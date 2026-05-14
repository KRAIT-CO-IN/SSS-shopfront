/* eslint-disable */
// SSS Food World — root app + hash router

function parseRoute() {
  const h = (window.location.hash || "#/").replace(/^#/, "");
  const parts = h.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "home" };
  if (parts[0] === "shop") return { name: "shop", category: parts[1] || null };
  if (parts[0] === "categories") return { name: "categories" };
  if (parts[0] === "product") return { name: "product", id: parts[1] || (PRODUCTS[0]?.id) };
  if (parts[0] === "checkout") return { name: "checkout" };
  if (parts[0] === "confirm") return { name: "confirm" };
  return { name: "home" };
}

function App() {
  const cart = useCart();
  const toasts = useToasts();
  const catalog = useCatalog();
  const [route, setRoute] = React.useState(parseRoute());
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [payOpen, setPayOpen] = React.useState(false);
  const [pendingForm, setPendingForm] = React.useState(null);
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

  const proceedToPayment = (form) => {
    setPendingForm(form);
    setPayOpen(true);
  };

  const onPaid = async () => {
    try {
      const { order } = await window.API.orders.create({
        customerName: pendingForm.name,
        customerPhone: pendingForm.phone,
        customerEmail: pendingForm.email,
        address: pendingForm.address,
        city: pendingForm.city,
        state: pendingForm.state,
        pincode: pendingForm.pincode,
        payment: pendingForm.payment || "UPI",
        items: cart.items.map((i) => ({
          name: i.name + (i.weight ? ` (${i.weight})` : ""),
          variant: i.weight, qty: i.qty, price: i.price, productId: i.productId,
        })),
      });
      const rec = {
        id: order.orderId, txnId: order.txId,
        form: pendingForm, items: cart.items,
        subtotal: order.subtotal, shipping: order.shipping, gst: order.gst, total: order.total,
        placedAt: order.createdAt,
      };
      sessionStorage.setItem("sss-last-order", JSON.stringify(rec));
      setLastOrder(rec);
      cart.clear();
      setPayOpen(false);
      setPendingForm(null);
      nav("confirm");
      toasts.push("Payment successful. Order placed.");
    } catch (e) {
      toasts.push("Order failed: " + e.message);
      setPayOpen(false);
    }
  };

  React.useEffect(() => { document.body.dataset.route = route.name; }, [route]);

  const subtotal = cart.subtotal;
  const shipping = subtotal >= 999 ? 0 : 80;
  const gst = Math.round(subtotal * 0.05);

  return (
    <React.Fragment>
      <Header route={route.name} onNav={nav} cartCount={cart.itemCount} onOpenCart={() => setDrawerOpen(true)} />

      <div key={route.name + (route.id || "") + (catalog.ready ? "r" : "0")} className="fade-in">
        {route.name === "home"     && <HomePage onNav={nav} />}
        {route.name === "shop"     && <ShopPage onNav={nav} onAddToCart={addToCart} cart={cart} initialCategory={route.category} />}
        {route.name === "categories" && <CategoriesPage onNav={nav} />}
        {route.name === "product"  && <ProductPage productId={route.id} onNav={nav} onAddToCart={addToCart} />}
        {route.name === "checkout" && <CheckoutPage cart={cart} onNav={nav} onProceed={proceedToPayment} />}
        {route.name === "confirm"  && <ConfirmPage order={lastOrder} onNav={nav} />}
      </div>

      <Footer onNav={nav} />

      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} cart={cart} onNav={nav} />
      <PaymentModal open={payOpen} total={pendingForm ? subtotal + shipping + gst : 0}
                    onClose={() => setPayOpen(false)} onPaid={onPaid} />
      <Toasts toasts={toasts.toasts} />
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
