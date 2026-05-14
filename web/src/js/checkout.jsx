/* eslint-disable */
// SSS Food World — checkout & confirmation pages

// ─────────────────────────────────────────────
// Checkout Page
// ─────────────────────────────────────────────
function CheckoutPage({ cart, onNav, onProceed }) {
  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", phoneAlt: "",
    address: "", pincode: "", city: "", state: "", country: "India",
    landmark: "", instructions: "",
  });
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  React.useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  // If cart is empty, send back to shop
  if (cart.items.length === 0) {
    return (
      <main className="container" style={{ padding: "120px 0", textAlign: "center" }} data-screen-label="05 Checkout (empty)">
        <Icon name="cart" size={56} stroke={1.2}/>
        <h1 className="h-1" style={{ marginTop: 16 }}>Your cart is empty</h1>
        <p className="body-lg" style={{ marginTop: 8 }}>Add a few jars to your cart before you check out.</p>
        <button className="btn btn--primary" style={{ marginTop: 24 }} onClick={() => onNav("shop")}>Browse the shop</button>
      </main>
    );
  }

  const validate = (data = form) => {
    const e = {};
    if (!data.name.trim()) e.name = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(data.email)) e.email = "Enter a valid email";
    if (!/^[+\d\s\-()]{8,}$/.test(data.phone)) e.phone = "Enter a valid phone";
    if (!data.address.trim() || data.address.length < 10) e.address = "Please enter your full address";
    if (!/^\d{4,6}$/.test(data.pincode)) e.pincode = "Invalid pincode";
    if (!data.city.trim()) e.city = "City is required";
    if (!data.state.trim()) e.state = "State is required";
    return e;
  };

  const setField = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (touched[k]) {
      const e = validate(next);
      setErrors(e);
    }
  };

  const blurField = (k) => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors(validate());
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    // Mark all touched so errors show
    const allTouched = Object.keys(form).reduce((o, k) => (o[k] = true, o), {});
    setTouched(allTouched);
    if (Object.keys(errs).length === 0) onProceed(form);
  };

  const shipping = useShippingSettings();
  const FREE_AT = +shipping.free || 499;
  const RATE = +shipping.rate || 80;
  const SHIPPING = cart.subtotal >= FREE_AT ? 0 : RATE;
  const TAX_RATE = 0.05;
  const tax = Math.round(cart.subtotal * TAX_RATE);
  const total = cart.subtotal + SHIPPING + tax;

  return (
    <main className="container" data-screen-label="05 Checkout">
      <div className="checkout-header" style={{ paddingTop: 32 }}>
        <h1>Checkout</h1>
        <p>Complete your order details below</p>
      </div>

      <form className="checkout-layout" onSubmit={submit} noValidate>
        <section className="card">
          <div className="form-section">
            <h2>Delivery Details</h2>

            <div className="form-grid-2">
              <Field label="Full Name" required error={touched.name && errors.name}>
                <input className={`input${touched.name && errors.name ? " is-error" : ""}`}
                       value={form.name}
                       onChange={(e) => setField("name", e.target.value)}
                       onBlur={() => blurField("name")}
                       placeholder="Jane Doe" />
              </Field>
              <Field label="Email Address" required error={touched.email && errors.email}>
                <input className={`input${touched.email && errors.email ? " is-error" : ""}`}
                       type="email"
                       value={form.email}
                       onChange={(e) => setField("email", e.target.value)}
                       onBlur={() => blurField("email")}
                       placeholder="jane.doe@email.com" />
              </Field>
              <Field label="Phone Number" required error={touched.phone && errors.phone}>
                <input className={`input${touched.phone && errors.phone ? " is-error" : ""}`}
                       type="tel"
                       value={form.phone}
                       onChange={(e) => setField("phone", e.target.value)}
                       onBlur={() => blurField("phone")}
                       placeholder="+91 98765 43210" />
              </Field>
              <Field label="Alternative Phone">
                <input className="input"
                       type="tel"
                       value={form.phoneAlt}
                       onChange={(e) => setField("phoneAlt", e.target.value)}
                       placeholder="Optional" />
              </Field>
            </div>

            <Field label="Delivery Address" required error={touched.address && errors.address}>
              <textarea className={`textarea${touched.address && errors.address ? " is-error" : ""}`}
                        rows="2"
                        value={form.address}
                        onChange={(e) => setField("address", e.target.value)}
                        onBlur={() => blurField("address")}
                        placeholder="House no., street, area" />
            </Field>

            <div className="form-grid-4">
              <Field label="Pincode" required error={touched.pincode && errors.pincode}>
                <input className={`input${touched.pincode && errors.pincode ? " is-error" : ""}`}
                       inputMode="numeric"
                       value={form.pincode}
                       onChange={(e) => setField("pincode", e.target.value.replace(/\D/g,"").slice(0,6))}
                       onBlur={() => blurField("pincode")}
                       placeholder="302001" />
              </Field>
              <Field label="City" required error={touched.city && errors.city}>
                <input className={`input${touched.city && errors.city ? " is-error" : ""}`}
                       value={form.city}
                       onChange={(e) => setField("city", e.target.value)}
                       onBlur={() => blurField("city")}
                       placeholder="Jaipur" />
              </Field>
              <Field label="State" required error={touched.state && errors.state}>
                <input className={`input${touched.state && errors.state ? " is-error" : ""}`}
                       value={form.state}
                       onChange={(e) => setField("state", e.target.value)}
                       onBlur={() => blurField("state")}
                       placeholder="Rajasthan" />
              </Field>
              <Field label="Country">
                <select className="select"
                        value={form.country}
                        onChange={(e) => setField("country", e.target.value)}>
                  <option>India</option>
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Australia</option>
                  <option>Canada</option>
                </select>
              </Field>
            </div>

            <Field label="Landmark (Optional)">
              <input className="input"
                     value={form.landmark}
                     onChange={(e) => setField("landmark", e.target.value)}
                     placeholder="Near, Opp, Behind landmark" />
            </Field>

            <Field label="Delivery Instructions (Optional)">
              <textarea className="textarea"
                        rows="2"
                        value={form.instructions}
                        onChange={(e) => setField("instructions", e.target.value)}
                        placeholder="Delivery time preference, gate code, etc." />
            </Field>
          </div>
        </section>

        <aside>
          <div className="summary-card">
            <h2>Order Summary</h2>
            {cart.items.map((it) => (
              <div className="sum-item" key={it.key}>
                <img src={it.img} alt="" />
                <div>
                  <div className="name">{it.name}</div>
                  <div className="meta">{it.weight} • Hand-packed</div>
                  {it.qty > 1 && <div className="qty-meta">Qty: {it.qty}</div>}
                </div>
                <span className="price" style={{ color: "var(--c-ink-2)", fontWeight: 600 }}>{fmt(it.price * it.qty)}</span>
              </div>
            ))}

            <div className="sum-totals">
              <div className="sum-row"><span>Subtotal</span><span>{fmt(cart.subtotal)}</span></div>
              <div className="sum-row"><span>Shipping <span style={{ color: "var(--c-muted)", fontSize: 12 }}>(Standard Express)</span></span><span>{fmt(SHIPPING)}</span></div>
              <div className="sum-row"><span>Taxes</span><span>{fmt(tax)}</span></div>
              <div className="sum-row total"><span>Total</span><b>{fmt(total)}</b></div>
            </div>

            <button type="submit" className="btn btn--primary btn--block" style={{ marginTop: 18 }}>
              <Icon name="lock" size={14}/> Proceed to Payment
            </button>
            <div className="secure-note">
              <Icon name="shield" size={12}/> Secure payment via Razorpay
            </div>
          </div>
        </aside>
      </form>
    </main>
  );
}

function Field({ label, required, error, children }) {
  const id = React.useId();
  // Inject id onto the child
  const child = React.Children.map(children, (c) =>
    React.isValidElement(c) ? React.cloneElement(c, { id, "aria-invalid": !!error, "aria-describedby": error ? `${id}-err` : undefined }) : c
  );
  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}{required && <span className="req"> *</span>}
      </label>
      {child}
      <div className="field-error" id={`${id}-err`}>{error || ""}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Order Confirmation
// ─────────────────────────────────────────────
function ConfirmPage({ order, onNav }) {
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  if (!order) {
    return (
      <main className="container" style={{ padding: "120px 0", textAlign: "center" }} data-screen-label="07 Confirmation (empty)">
        <Icon name="cart" size={56} stroke={1.2}/>
        <h1 className="h-1" style={{ marginTop: 16 }}>No recent order</h1>
        <p className="body-lg" style={{ marginTop: 8 }}>Browse our handcrafted goods to place an order.</p>
        <button className="btn btn--primary" style={{ marginTop: 24 }} onClick={() => onNav("shop")}>Browse the shop</button>
      </main>
    );
  }

  return (
    <main className="container confirm-wrap" data-screen-label="07 Confirmation">
      <section className="confirm-card fade-up">
        <div className="confirm-tick">
          <Icon name="check" size={42} stroke={2.4}/>
        </div>
        <h1 className="confirm-title balanced">Your Order is Confirmed!</h1>
        <p className="confirm-desc pretty">
          Thank you for your purchase, {order.form.name.split(" ")[0]}. We're preparing your artisanal goods for shipment.
        </p>

        <div className="confirm-details">
          <div>
            <h4>Customer Details</h4>
            <div className="row">
              <div className="label">Name</div>
              <div className="value">{order.form.name}</div>
            </div>
            <div className="row">
              <div className="label">Email</div>
              <div className="value">{order.form.email}</div>
            </div>
            <div className="row">
              <div className="label">Mobile</div>
              <div className="value">{order.form.phone}</div>
            </div>
          </div>
          <div>
            <h4>Order Details</h4>
            <div className="row">
              <div className="label">Order ID</div>
              <div className="value mono">{order.id}</div>
            </div>
            <div className="row">
              <div className="label">Transaction ID</div>
              <div className="value mono">{order.txnId}</div>
            </div>
            <div className="row">
              <div className="label">Status</div>
              <div className="value"><span className="tag tag--success">Hand-packed</span></div>
            </div>
          </div>
        </div>

        <button className="btn btn--primary" onClick={() => onNav("shop")}>
          Continue Shopping
        </button>
      </section>

      <aside className="shop-cta-card">
        <span className="label-xs">Up Next</span>
        <h2 className="h-2">Stock up the pantry</h2>
        <p className="body" style={{ maxWidth: 38 + "ch" }}>
          Free shipping on all orders above {fmt(FREE_AT)}. Save 10% on your next gift box when you bundle three or more.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "16px 0" }}>
          {PRODUCTS.slice(0, 4).map((p) => (
            <button key={p.id}
                    onClick={() => onNav("product", p.id)}
                    style={{ background: "none", border: "1px solid var(--c-line)", borderRadius: 10, overflow: "hidden", padding: 0, cursor: "pointer" }}
                    aria-label={p.name}>
              <img src={p.img} alt={p.name} style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
            </button>
          ))}
        </div>
        <button className="btn btn--ghost" onClick={() => onNav("shop")}>Browse the full shop</button>
      </aside>
    </main>
  );
}

Object.assign(window, { CheckoutPage, ConfirmPage });
