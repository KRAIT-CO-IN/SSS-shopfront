/* eslint-disable */
// SSS Food World — root app + hash router

function parseRoute() {
  const h = (window.location.hash || "#/").replace(/^#/, "");
  const parts = h.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home" };
  if (parts[0] === "shop") return { name: "shop", category: parts[1] || null };
  if (parts[0] === "product") return { name: "product", id: parts[1] || (PRODUCTS[0]?.id) };
  if (parts[0] === "checkout") return { name: "checkout" };
  if (parts[0] === "confirm") return { name: "confirm" };
  return { name: "home" };
}

function App() {
  const cart = useCart();
  const toasts = useToasts();
  const catalog = useCatalog();
  const shipping = useShippingSettings();
  const [route, setRoute] = React.useState(parseRoute());
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [lastOrder, setLastOrder] = React.useState(() => {
    try { return JSON.parse(sessionStorage.getItem("sss-last-order") || "null"); } catch (e) { return null; }
  });

  React.useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  React.useEffect(() => { if (catalog.ready) setRoute(parseRoute()); }, [catalog.ready]);

  const nav = (name, id) => {
    if (name === "product" && id) window.location.hash = `#/product/${id}`;
    else if (name === "shop" && id) window.location.hash = `#/shop/${id}`;
    else if (name === "home") window.location.hash = "#/";
    else window.location.hash = `#/${name}`;
  };

  const addToCart = (product, weightSpec, qty = 1) => {
    cart.addItem(product, weightSpec, qty);
    toasts.push(`Added ${product.name} (${weightSpec.w}) to cart`);
    setDrawerOpen(true);
  };

  // Order placement on successful, server-verified payment. Built entirely from the
  // server order so it survives even if the cart/form closures are gone (page reload).
  const finalizeOrder = (o) => {
    const rec = {
      id: o.orderId, txnId: o.txId,
      paymentId: o.razorpayPaymentId || null,
      status: o.status || "Completed",
      form: {
        name: o.customerName || "", email: o.customerEmail || "", phone: o.customerPhone || "",
        address: o.address || "", city: o.city || "", state: o.state || "", pincode: o.pincode || "",
      },
      items: o.items || [],
      subtotal: o.subtotal, shipping: o.shipping, gst: o.gst, total: o.total,
      placedAt: o.createdAt,
    };
    sessionStorage.setItem("sss-last-order", JSON.stringify(rec));
    setLastOrder(rec);
    cart.clear();
    nav("confirm");
    toasts.push("Payment successful. Order placed.");
  };

  // Real Razorpay flow: create a server-priced order, open Razorpay Checkout,
  // then verify the signature server-side before confirming.
  const proceedToPayment = async (form) => {
    if (!window.Razorpay) {
      toasts.push("Payment library failed to load. Please refresh and try again.");
      return;
    }
    const items = cart.items.map((i) => ({
      name: i.name + (i.weight ? ` (${i.weight})` : ""),
      variant: i.weight, qty: i.qty, price: i.price, productId: i.productId,
    }));

    let init;
    try {
      init = await window.API.payments.order({
        customerName: form.name, customerPhone: form.phone, customerEmail: form.email,
        address: form.address, city: form.city, state: form.state, pincode: form.pincode,
        items,
      });
    } catch (e) {
      toasts.push("Could not start payment: " + e.message);
      return;
    }

    const rzp = new window.Razorpay({
      key: init.keyId,
      amount: init.amount,
      currency: init.currency,
      order_id: init.rzpOrderId,
      name: "SSS Food World",
      description: "Order " + init.orderId,
      prefill: { name: form.name, email: form.email, contact: form.phone },
      notes: { orderId: init.orderId },
      theme: { color: "#C4121F" },
      handler: async (resp) => {
        try {
          const { order } = await window.API.payments.verify({
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          finalizeOrder(order);
        } catch (e) {
          toasts.push("Payment captured but verification failed: " + e.message + ". Contact support with order " + init.orderId + ".");
        }
      },
      modal: { ondismiss: () => toasts.push("Payment cancelled. Your cart is saved.") },
    });
    rzp.on("payment.failed", (r) => toasts.push("Payment failed: " + (r?.error?.description || "please try again")));
    rzp.open();
  };

  React.useEffect(() => { document.body.dataset.route = route.name; }, [route]);

  return (
    <React.Fragment>
      <Header route={route.name} onNav={nav} cartCount={cart.itemCount} onOpenCart={() => setDrawerOpen(true)} />

      <div key={route.name + (route.id || "") + (catalog.ready ? "r" : "0")} className="fade-in">
        {route.name === "home"     && <HomePage onNav={nav} />}
        {route.name === "shop"     && <ShopPage onNav={nav} onAddToCart={addToCart} cart={cart} initialCategory={route.category} />}
        {route.name === "product"  && <ProductPage productId={route.id} onNav={nav} onAddToCart={addToCart} />}
        {route.name === "checkout" && <CheckoutPage cart={cart} onNav={nav} onProceed={proceedToPayment} />}
        {route.name === "confirm"  && <ConfirmPage order={lastOrder} onNav={nav} />}
      </div>

      <Footer onNav={nav} />

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} cart={cart} onNav={nav} />
      <Toasts toasts={toasts.toasts} />
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
