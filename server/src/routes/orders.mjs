function orderId() {
  return "ORD-" + Math.floor(Math.random() * 9000 + 1000);
}
function txId() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const rnd = String(Math.floor(Math.random() * 9000 + 1000));
  return `TXN-${ymd}-${rnd}`;
}

export default async function orderRoutes(app) {
  // Storefront — create order (public)
  app.post("/", async (req, reply) => {
    const b = req.body || {};
    if (!b.items?.length) return reply.code(400).send({ error: "No items" });
    if (!b.customerName || !b.customerPhone) return reply.code(400).send({ error: "Customer details required" });

    const subtotal = b.items.reduce((s, i) => s + (i.price * i.qty), 0);
    const shipping = subtotal >= 999 ? 0 : 80;
    const gst = Math.round(subtotal * 0.05);
    const total = subtotal + shipping + gst;

    const order = await app.prisma.order.create({
      data: {
        orderId: orderId(),
        txId: txId(),
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        customerEmail: b.customerEmail || null,
        address: b.address || "",
        city: b.city || "",
        state: b.state || "",
        pincode: b.pincode || "",
        subtotal, shipping, gst, total,
        payment: b.payment || "UPI",
        status: "Completed",
        items: {
          create: b.items.map((i) => ({
            name: i.name,
            variant: i.variant || i.weight || null,
            qty: +i.qty,
            price: +i.price,
            total: +i.price * +i.qty,
            productId: i.productId || null,
          })),
        },
      },
      include: { items: true },
    });

    // Decrement product stock
    for (const it of b.items) {
      if (it.productId) {
        await app.prisma.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: +it.qty } },
        }).catch(() => {});
      }
    }

    return { order };
  });

  // Admin — list transactions
  app.get("/", { preHandler: app.authed }, async (req) => {
    const { from, to, payment, status, q, take = 50, skip = 0 } = req.query || {};
    const where = {};
    if (from || to) where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
    if (payment && payment !== "All Payment") where.payment = payment;
    if (status && status !== "All Status") where.status = status;
    if (q) where.OR = [
      { txId: { contains: q, mode: "insensitive" } },
      { orderId: { contains: q, mode: "insensitive" } },
    ];

    const [items, total] = await Promise.all([
      app.prisma.order.findMany({
        where, take: +take, skip: +skip,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      app.prisma.order.count({ where }),
    ]);
    return { items, total };
  });

  app.get("/:txId", { preHandler: app.authed }, async (req, reply) => {
    const order = await app.prisma.order.findUnique({
      where: { txId: req.params.txId },
      include: { items: true },
    });
    if (!order) return reply.code(404).send({ error: "Not found" });
    return { order };
  });

  // CSV export
  app.get("/export.csv", { preHandler: app.authed }, async (req, reply) => {
    const items = await app.prisma.order.findMany({
      orderBy: { createdAt: "desc" }, take: 5000,
    });
    const header = "Transaction ID,Order ID,Date,Customer,Phone,Amount,Payment,Status\n";
    const rows = items.map((o) => [
      o.txId, o.orderId, o.createdAt.toISOString(), o.customerName, o.customerPhone, o.total, o.payment, o.status,
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    reply.header("content-type", "text/csv");
    reply.header("content-disposition", "attachment; filename=transactions.csv");
    return header + rows;
  });
}
