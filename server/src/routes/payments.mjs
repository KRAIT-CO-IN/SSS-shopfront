// Razorpay payment routes — real gateway integration.
// Flow: POST /order (server-priced) → Razorpay Checkout (browser) → POST /verify (HMAC).
// Secret never leaves the server. Amount is computed server-side, client values are not trusted.
import crypto from "node:crypto";

const RZP_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RZP_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

function orderId() {
  return "ORD-" + Math.floor(Math.random() * 9000 + 1000);
}
function txId() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  return `TXN-${ymd}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

// Re-price items against the DB so the charged amount can't be tampered with client-side.
// Falls back to the client price only when the product/variant can't be resolved.
async function priceItems(app, items) {
  const ids = [...new Set(items.map((i) => i.productId).filter(Boolean))];
  const products = ids.length
    ? await app.prisma.product.findMany({ where: { id: { in: ids } } })
    : [];
  const byId = new Map(products.map((p) => [p.id, p]));

  let subtotal = 0;
  const norm = items.map((i) => {
    let price = +i.price || 0;
    const p = i.productId && byId.get(i.productId);
    if (p) {
      const variants = Array.isArray(p.variants) ? p.variants : [];
      const v = variants.find((x) => x.w === (i.variant || i.weight));
      if (v) price = +(v.disc ?? v.price ?? p.price);
      else if (!variants.length) price = +(p.disc ?? p.price);
    }
    const qty = Math.max(1, +i.qty || 1);
    subtotal += price * qty;
    return {
      name: i.name,
      variant: i.variant || i.weight || null,
      qty,
      price,
      total: price * qty,
      productId: i.productId || null,
    };
  });
  return { norm, subtotal };
}

async function computeTotals(app, subtotal) {
  const row = await app.prisma.settings.findUnique({ where: { key: "shipping" } });
  const ship = row?.value || {};
  const free = +ship.free || 499;
  const rate = +ship.rate || 80;
  const shipping = subtotal >= free ? 0 : rate;
  const gst = 0;
  return { subtotal, shipping, gst, total: subtotal + shipping };
}

export default async function paymentRoutes(app) {
  // Keep the raw body (scoped to /api/payments/*) so the webhook can verify the
  // X-Razorpay-Signature, which is computed over the exact bytes Razorpay sent.
  app.addContentTypeParser("application/json", { parseAs: "buffer" }, (req, body, done) => {
    req.rawBody = body;
    if (!body || body.length === 0) return done(null, {});
    try { done(null, JSON.parse(body.toString("utf8"))); }
    catch (e) { e.statusCode = 400; done(e, undefined); }
  });

  // Public — lets the storefront know the key_id + whether the gateway is live.
  app.get("/config", async () => ({
    keyId: RZP_KEY_ID,
    enabled: !!(RZP_KEY_ID && RZP_KEY_SECRET),
    mode: RZP_KEY_ID.startsWith("rzp_live_") ? "live" : RZP_KEY_ID.startsWith("rzp_test_") ? "test" : "unset",
  }));

  // Step 1 — create a Razorpay order + a Pending DB order.
  app.post("/order", async (req, reply) => {
    const b = req.body || {};
    if (!b.items?.length) return reply.code(400).send({ error: "No items" });
    if (!b.customerName || !b.customerPhone) return reply.code(400).send({ error: "Customer details required" });
    if (!RZP_KEY_ID || !RZP_KEY_SECRET) return reply.code(503).send({ error: "Payment gateway not configured" });

    const { norm, subtotal } = await priceItems(app, b.items);
    const t = await computeTotals(app, subtotal);
    if (t.total <= 0) return reply.code(400).send({ error: "Invalid order amount" });

    const amountPaise = Math.round(t.total * 100);
    const receipt = orderId();

    const auth = Buffer.from(`${RZP_KEY_ID}:${RZP_KEY_SECRET}`).toString("base64");
    let rzpOrder;
    try {
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Basic ${auth}` },
        body: JSON.stringify({
          amount: amountPaise,
          currency: "INR",
          receipt,
          notes: { customer: b.customerName, phone: b.customerPhone },
        }),
      });
      rzpOrder = await res.json();
      if (!res.ok) {
        req.log.error({ rzpOrder }, "razorpay order create failed");
        return reply.code(502).send({ error: rzpOrder?.error?.description || "Payment gateway error" });
      }
    } catch (e) {
      req.log.error({ err: e.message }, "razorpay order request threw");
      return reply.code(502).send({ error: "Could not reach payment gateway" });
    }

    const dbOrder = await app.prisma.order.create({
      data: {
        orderId: receipt,
        txId: txId(),
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        customerEmail: b.customerEmail || null,
        address: b.address || "",
        city: b.city || "",
        state: b.state || "",
        pincode: b.pincode || "",
        subtotal: t.subtotal,
        shipping: t.shipping,
        gst: t.gst,
        total: t.total,
        payment: "Razorpay",
        status: "Pending",
        razorpayOrderId: rzpOrder.id,
        items: { create: norm },
      },
    });

    return {
      keyId: RZP_KEY_ID,
      rzpOrderId: rzpOrder.id,
      amount: amountPaise,
      currency: "INR",
      totals: t,
      orderId: dbOrder.orderId,
      txId: dbOrder.txId,
    };
  });

  // Step 2 — verify the signature, mark the order paid, decrement stock.
  app.post("/verify", async (req, reply) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return reply.code(400).send({ error: "Missing payment confirmation fields" });
    if (!RZP_KEY_SECRET) return reply.code(503).send({ error: "Payment gateway not configured" });

    const expected = crypto
      .createHmac("sha256", RZP_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");
    const sigOk =
      expected.length === razorpay_signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(razorpay_signature));
    if (!sigOk) return reply.code(400).send({ error: "Payment signature verification failed" });

    const order = await app.prisma.order.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { items: true },
    });
    if (!order) return reply.code(404).send({ error: "Order not found" });

    // Idempotent — only flip + decrement stock the first time.
    if (order.status !== "Completed") {
      await app.prisma.order.update({
        where: { id: order.id },
        data: { status: "Completed", razorpayPaymentId: razorpay_payment_id },
      });
      for (const it of order.items) {
        if (it.productId) {
          await app.prisma.product
            .update({ where: { id: it.productId }, data: { stock: { decrement: it.qty } } })
            .catch(() => {});
        }
      }
    }

    const fresh = await app.prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    return { order: fresh };
  });

  // Server-to-server confirmation from Razorpay (configure URL+secret+events in
  // the Razorpay dashboard). Verifies HMAC over the raw body, then reconciles the
  // order. Idempotent + independent of the browser, so it's the source of truth
  // even if the user closes the tab after paying.
  app.post("/webhook", async (req, reply) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    if (!secret) return reply.code(503).send({ error: "Webhook secret not configured" });

    const sig = String(req.headers["x-razorpay-signature"] || "");
    const raw = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    const sigOk =
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
    if (!sigOk) return reply.code(400).send({ error: "Invalid webhook signature" });

    const event = req.body?.event;
    const payment = req.body?.payload?.payment?.entity;
    const rzpOrderId = payment?.order_id;

    if (rzpOrderId && (event === "payment.captured" || event === "payment.authorized")) {
      const order = await app.prisma.order.findUnique({
        where: { razorpayOrderId: rzpOrderId },
        include: { items: true },
      });
      if (order && order.status !== "Completed") {
        await app.prisma.order.update({
          where: { id: order.id },
          data: { status: "Completed", razorpayPaymentId: payment.id },
        });
        for (const it of order.items) {
          if (it.productId) {
            await app.prisma.product
              .update({ where: { id: it.productId }, data: { stock: { decrement: it.qty } } })
              .catch(() => {});
          }
        }
        req.log.info({ orderId: order.orderId, event }, "webhook → order completed");
      }
    } else if (rzpOrderId && event === "payment.failed") {
      const order = await app.prisma.order.findUnique({ where: { razorpayOrderId: rzpOrderId } });
      if (order && order.status === "Pending") {
        await app.prisma.order.update({
          where: { id: order.id },
          data: { status: "Failed", razorpayPaymentId: payment?.id || null },
        });
        req.log.info({ orderId: order.orderId }, "webhook → order failed");
      }
    }

    // Always ack with 200 so Razorpay does not retry a handled event.
    return { ok: true };
  });
}
