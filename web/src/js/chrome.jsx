/* eslint-disable */
// SSS Food World — shared chrome (header, footer, drawer, modal)

// ─────────────────────────────────────────────
// Logo — original typographic mark (red badge)
// ─────────────────────────────────────────────
function Logo({ size = "md", onNav }) {
  const handleClick = (e) => { e.preventDefault(); if (onNav) onNav("home"); };
  return (
    <a href="#/" className={`logo logo--${size}`} onClick={handleClick} aria-label="SSS Food World — Home">
      <img src="/assets/sss-logo-v3.png" alt="SSS Food World — Taste Lasts Forever" className="logo-img" />
    </a>
  );
}

// ─────────────────────────────────────────────
// Rolling topbar
// ─────────────────────────────────────────────
function TopBar() {
  const [idx, setIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % window.TOP_BAR_LINES.length), 4500);
    return () => clearInterval(id);
  }, [paused]);
  return (
    <div className="topbar" role="region" aria-label="Site announcements"
         onMouseEnter={() => setPaused(true)}
         onMouseLeave={() => setPaused(false)}>
      <div key={idx} className="fade-in" style={{ animation: "fadeIn .5s ease both" }}>
        {window.TOP_BAR_LINES[idx]}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
function Header({ route, onNav, cartCount, onOpenCart }) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => { setMobileOpen(false); }, [route]);

  const navItems = [
    { id: "story", label: "Our Story", route: "home", anchor: "story" },
    { id: "shop",  label: "Shop",     route: "shop" },
  ];

  const handleNavClick = (e, n) => {
    e.preventDefault();
    onNav(n.route);
    if (n.anchor) {
      setTimeout(() => {
        const el = document.getElementById(n.anchor);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <React.Fragment>
      <TopBar />
      <header className={`header${scrolled ? " is-scrolled" : ""}`} role="banner">
        <div className="container header-inner">
          <Logo onNav={onNav} />
          <nav className="nav" aria-label="Primary">
            {navItems.map((n) => {
              const active = (n.id === "shop" && (route === "shop" || route === "product"))
                          || (n.id === "story" && route === "home");
              return (
                <a key={n.id} href={`#/${n.route}${n.anchor ? "#" + n.anchor : ""}`}
                   className={`nav-link${active ? " is-active" : ""}`}
                   aria-current={active ? "page" : undefined}
                   onClick={(e) => handleNavClick(e, n)}>
                  {n.label}
                </a>
              );
            })}
          </nav>
          <div className="header-tools">
            <button className="icon-btn" aria-label={`Cart, ${cartCount} items`} onClick={onOpenCart}>
              <Icon name="cart" />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button className="icon-btn menu-toggle" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
              <Icon name="menu" />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-nav" role="dialog" aria-modal="true">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Logo onNav={onNav} />
            <button className="icon-btn" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <Icon name="close" />
            </button>
          </div>
          {navItems.map((n) => (
            <a key={n.id} href={`#/${n.route}${n.anchor ? "#" + n.anchor : ""}`} className="nav-link"
               onClick={(e) => { handleNavClick(e, n); setMobileOpen(false); }}>
              {n.label}
            </a>
          ))}
        </div>
      )}
    </React.Fragment>
  );
}

// ─────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────
function Footer({ onNav }) {
  // Keep CATEGORIES live so adding from Admin Panel shows up here automatically.
  useCatalog();
  const nav = [
    { l: "Shop",       route: "shop" },
    { l: "Our Story",  route: "home" },
    { l: "Contact Us", route: "home" },
  ];
  // Skip the synthetic "All" entry; cap at 5 published categories — keeps layout stable
  // no matter how many categories admin creates.
  const cats = window.CATEGORIES.filter((c) => c.id !== "all").slice(0, 5);
  const info = ["Delivery Info", "Returns Policy", "Privacy", "Terms"];

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Logo onNav={onNav} />
            <p>Crafting authentic, small-batch preserves and culinary essentials for the modern pantry.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 22, color: "var(--c-on-footer-mute)" }}>
              <a href="#" aria-label="Instagram"><Icon name="instagram" /></a>
              <a href="#" aria-label="Website"><Icon name="globe" /></a>
              <a href="#" aria-label="Email"><Icon name="mail" /></a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              {nav.map((n) => (
                <li key={n.l}>
                  <a href={`#/${n.route}`} onClick={(e) => { e.preventDefault(); onNav(n.route); window.scrollTo({top:0}); }}>{n.l}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Categories</h4>
            <ul>
              {cats.map((c) => (
                <li key={c.id}>
                  <a href="#/shop" onClick={(e) => { e.preventDefault(); onNav("shop", c.id); }}>{c.label}</a>
                </li>
              ))}
              {window.CATEGORIES.filter((c) => c.id !== "all").length > 5 && (
                <li>
                  <a href="#/shop" onClick={(e) => { e.preventDefault(); onNav("shop"); }} style={{ opacity: .85, fontWeight: 600 }}>View all →</a>
                </li>
              )}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Information</h4>
            <ul>{info.map((c) => <li key={c}><a href="#">{c}</a></li>)}</ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SSS Food World. All rights reserved.</span>
          <div className="footer-trust">
            <span><Icon name="leaf" size={14}/> No Preservatives</span>
            <span><Icon name="truck" size={14}/> Fast Shipping</span>
            <span><Icon name="award" size={14}/> 100% Natural</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// Toasts
// ─────────────────────────────────────────────
function Toasts({ toasts }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className="toast" role="status">
          <Icon name="check" size={18} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Cart drawer
// ─────────────────────────────────────────────
function CartDrawer({ open, onClose, cart, onNav }) {
  const shipping = useShippingSettings();
  const FREE_AT = +shipping.free || 499;
  const remaining = Math.max(0, FREE_AT - cart.subtotal);
  const progress = Math.min(100, (cart.subtotal / FREE_AT) * 100);

  // Lock body scroll
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Esc to close
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <React.Fragment>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true" aria-label="Shopping cart">
        <div className="drawer-header">
          <h2 className="drawer-title">Your Cart ({cart.itemCount} items)</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close cart">
            <Icon name="close" />
          </button>
        </div>

        <div className="drawer-body">
          {cart.items.length === 0 ? (
            <div className="empty-cart">
              <Icon name="cart" size={48} stroke={1.2} />
              <h3>Your cart is empty</h3>
              <p>Browse our handcrafted spices, pickles & sweets to fill it up.</p>
              <button className="btn btn--primary" onClick={() => { onClose(); onNav("shop"); }}>
                Start Shopping
              </button>
            </div>
          ) : (
            cart.items.map((it) => (
              <div className="cart-item" key={it.key}>
                <div className="cart-item-img">
                  <img src={it.img} alt={it.name} loading="lazy" />
                </div>
                <div className="cart-item-body">
                  <h4>{it.name}</h4>
                  <span className="cart-item-meta">{it.weight}</span>
                  <div className="cart-item-row">
                    <div className="cart-qty">
                      <button onClick={() => cart.setQty(it.key, it.qty - 1)} aria-label="Decrease quantity">
                        <Icon name="minus" size={14}/>
                      </button>
                      <span>{it.qty}</span>
                      <button onClick={() => cart.setQty(it.key, it.qty + 1)} aria-label="Increase quantity">
                        <Icon name="plus" size={14}/>
                      </button>
                    </div>
                    <span className="cart-item-price">{fmt(it.price * it.qty)}</span>
                  </div>
                </div>
                <button className="cart-item-remove" aria-label={`Remove ${it.name}`} onClick={() => cart.removeItem(it.key)}>
                  <Icon name="trash" size={18}/>
                </button>
              </div>
            ))
          )}
        </div>

        {cart.items.length > 0 && (
          <div className="drawer-footer">
            <div className="subtotal-row">
              <span>Subtotal</span>
              <b>{fmt(cart.subtotal)}</b>
            </div>
            {remaining > 0 ? (
              <div className="ship-progress">
                <span><Icon name="truck" size={16} /> You're {fmt(remaining)} away from free shipping!</span>
                <div className="bar"><div style={{ width: `${progress}%` }} /></div>
              </div>
            ) : (
              <div className="ship-progress">
                <span><Icon name="check" size={16} /> You've unlocked free shipping!</span>
                <div className="bar"><div style={{ width: "100%" }} /></div>
              </div>
            )}
            <button className="btn btn--primary btn--block" onClick={() => { onClose(); onNav("checkout"); }}>
              <Icon name="bolt" size={16}/> Magic Checkout
            </button>
          </div>
        )}
      </aside>
    </React.Fragment>
  );
}

// ─────────────────────────────────────────────
// Payment modal (Razorpay-style)
// ─────────────────────────────────────────────
function PaymentModal({ open, total, onClose, onPaid }) {
  const [openMethod, setOpenMethod] = React.useState("upi");
  const [upi, setUpi] = React.useState("");
  const [card, setCard] = React.useState({ number: "", name: "", exp: "", cvv: "" });
  const [bank, setBank] = React.useState("");
  const [paying, setPaying] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape" && !paying) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, paying, onClose]);

  if (!open) return null;

  const canPay = () => {
    if (openMethod === "upi") return /.+@.+/.test(upi) || ["gpay","phonepe"].includes(upi);
    if (openMethod === "card") return card.number.replace(/\s/g, "").length >= 12 && card.name && card.exp.length >= 4 && card.cvv.length >= 3;
    if (openMethod === "bank") return !!bank;
    return false;
  };

  const pay = () => {
    if (!canPay() || paying) return;
    setPaying(true);
    setTimeout(() => { setPaying(false); onPaid(); }, 1600);
  };

  const formatCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExp  = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0,2) + "/" + d.slice(2) : d;
  };

  return (
    <div className="modal-backdrop" onClick={paying ? null : onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Payment" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <Logo onNav={() => {}} />
          <button className="modal-close" aria-label="Close payment" onClick={onClose} disabled={paying}>
            <Icon name="close" />
          </button>
        </div>
        <div className="modal-amount">
          <div className="v">{fmt(total)}</div>
          <div className="l">Total Payable Amount</div>
        </div>

        <div className="pay-section">
          <div className="pay-section-label">Select Payment Method</div>

          {/* UPI */}
          <div className={`pay-method${openMethod === "upi" ? " is-open" : ""}`}>
            <button className="pay-method-head" onClick={() => setOpenMethod(openMethod === "upi" ? "" : "upi")}>
              <span className="pay-method-icon"><Icon name="wallet" /></span>
              UPI (Google Pay, PhonePe)
              <span className="chev"><Icon name="chev-down" size={16}/></span>
            </button>
            {openMethod === "upi" && (
              <div className="pay-method-body">
                <span>Enter UPI ID or select an app below to pay.</span>
                <input className="input" placeholder="Enter UPI ID (e.g., name@bank)"
                       value={upi} onChange={(e) => setUpi(e.target.value)} />
                <div className="pay-apps">
                  <button className="pay-app-btn" onClick={() => setUpi("gpay")}>GPay</button>
                  <button className="pay-app-btn" onClick={() => setUpi("phonepe")}>PhonePe</button>
                </div>
              </div>
            )}
          </div>

          {/* Card */}
          <div className={`pay-method${openMethod === "card" ? " is-open" : ""}`}>
            <button className="pay-method-head" onClick={() => setOpenMethod(openMethod === "card" ? "" : "card")}>
              <span className="pay-method-icon"><Icon name="credit" /></span>
              Card (Visa, Mastercard, RuPay)
              <span className="chev"><Icon name="chev-down" size={16}/></span>
            </button>
            {openMethod === "card" && (
              <div className="pay-method-body">
                <input className="input" placeholder="Card number" value={card.number}
                       onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                       inputMode="numeric" />
                <input className="input" placeholder="Cardholder name" value={card.name}
                       onChange={(e) => setCard({ ...card, name: e.target.value })} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input className="input" placeholder="MM/YY" value={card.exp}
                         onChange={(e) => setCard({ ...card, exp: formatExp(e.target.value) })}
                         inputMode="numeric" />
                  <input className="input" placeholder="CVV" type="password" maxLength="4"
                         value={card.cvv}
                         onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })}
                         inputMode="numeric" />
                </div>
              </div>
            )}
          </div>

          {/* Netbanking */}
          <div className={`pay-method${openMethod === "bank" ? " is-open" : ""}`}>
            <button className="pay-method-head" onClick={() => setOpenMethod(openMethod === "bank" ? "" : "bank")}>
              <span className="pay-method-icon"><Icon name="bank" /></span>
              Netbanking
              <span className="chev"><Icon name="chev-down" size={16}/></span>
            </button>
            {openMethod === "bank" && (
              <div className="pay-method-body">
                <select className="select" value={bank} onChange={(e) => setBank(e.target.value)}>
                  <option value="">Select your bank</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>State Bank of India</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra</option>
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="pay-cta">
          <button className="btn btn--primary btn--block"
                  onClick={pay}
                  disabled={!canPay() || paying}
                  aria-disabled={!canPay() || paying}>
            {paying ? <React.Fragment><span className="spinner"/> Processing…</React.Fragment> : "Pay Now"}
          </button>
          <div className="secure-note">
            <Icon name="lock" size={12}/> Secured by Razorpay
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Logo, Header, Footer, Toasts, CartDrawer, PaymentModal });
