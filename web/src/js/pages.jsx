/* eslint-disable */
// SSS Food World — page components

// ─────────────────────────────────────────────
// Home page
// ─────────────────────────────────────────────
function HomePage({ onNav }) {
  const [activeCollection, setActiveCollection] = React.useState("cashew");
  return (
    <main data-screen-label="01 Home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-media" role="img" aria-label="A wooden tray of fresh, hand-ground spices in clay bowls" />
        <div className="hero-content fade-up">
          <div className="hero-eyebrow-row">
            <span>AUTHENTIC</span><span className="sep">|</span>
            <span>HANDCRAFTED</span><span className="sep">|</span>
            <span>DELIVERED FRESH</span>
          </div>
          <h1 className="h-display balanced">Taste the<br/>Authentic<br/>Flavors</h1>
          <p className="body-lg pretty" style={{ maxWidth: 480 }}>
            Handcrafted spice powders, pickles & more — made with love and zero preservatives, straight from small kitchens in Andhra.
          </p>
          <div className="hero-actions">
            <button className="btn btn--primary" onClick={() => onNav("shop")}>
              Shop Now <span aria-hidden="true">→</span>
            </button>
            <button className="btn btn--ghost" onClick={() => onNav("shop")}>
              Explore Categories
            </button>
          </div>
          <div className="hero-trust">
            <span className="trust-item"><Icon name="leaf" size={16}/> No Preservatives</span>
            <span className="trust-item"><Icon name="truck" size={16}/> Fast Shipping</span>
            <span className="trust-item"><Icon name="star" size={16}/> 10k+ Happy Customers</span>
          </div>
        </div>
      </section>

      {/* Collection */}
      <section className="section">
        <div className="container">
          <div className="section-title"><h2 className="h-1">Explore Our Collection</h2></div>
          <div className="collection-row">
            {COLLECTION.map((c) => (
              <button key={c.id}
                      className={`collection-item${activeCollection === c.id ? " is-active" : ""}`}
                      onClick={() => { setActiveCollection(c.id); onNav("shop"); }}>
                <span className="collection-disc">
                  <CollectionGlyph color={c.color} id={c.id} />
                </span>
                <span className="label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section process" id="story">
        <div className="container">
          <div className="section-title"><h2 className="h-1">Made With Love &amp; Respect</h2></div>
          <div className="process-grid">
            <div className="process-steps">
              {[
                { n: "01", t: "Source the finest raw materials", d: "We partner with sustainable farms to ensure only the highest quality ingredients reach our kitchen." },
                { n: "02", t: "Traditional stone grinding process", d: "Slow stone grinding preserves natural oils and rich, authentic flavors that machines simply cannot replicate." },
                { n: "03", t: "Sun-dried for natural preservation", d: "Harnessing the power of natural sunlight to lock in nutrients and extend shelf life organically." },
                { n: "04", t: "Hand-packed with care", d: "Every jar is inspected and sealed by hand, ensuring our artisanal standards are met." },
                { n: "05", t: "Delivered fresh to your doorstep", d: "Expedited, eco-friendly shipping brings the warmth of our kitchen directly to yours." },
              ].map((s) => (
                <div className="step" key={s.n}>
                  <div className="step-no">STEP {s.n}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              ))}
            </div>
            <div className="process-aside">
              <div className="process-quote">"Authenticity isn't just a word; it's the rhythm of our tradition."</div>
              <div className="process-image" role="img" aria-label="Bowls of fresh ground spices scattered with chilies" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Simple SVG glyph per collection circle (so we don't need 6 product photos)
function CollectionGlyph({ color, id }) {
  // Render a round, filled bowl with the category color and a little texture
  return (
    <svg viewBox="0 0 80 80" width="80%" height="80%" aria-hidden="true">
      <defs>
        <radialGradient id={`g-${id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0.78"/>
        </radialGradient>
      </defs>
      <circle cx="40" cy="40" r="34" fill={`url(#g-${id})`} />
      {/* Texture dots */}
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i * 53) % 360;
        const r = 8 + ((i * 7) % 20);
        const x = 40 + r * Math.cos(a);
        const y = 40 + r * Math.sin(a);
        return <circle key={i} cx={x} cy={y} r={1.4} fill="#fff" opacity="0.45" />;
      })}
      <ellipse cx="34" cy="28" rx="14" ry="4" fill="#fff" opacity="0.15" />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Shop / Listing page
// ─────────────────────────────────────────────
function ShopPage({ onNav, onAddToCart, cart, initialCategory }) {
  const catalog = useCatalog();
  const [activeCat, setActiveCat] = React.useState(initialCategory || "all");
  const [maxPrice, setMaxPrice] = React.useState(1000);
  const [page, setPage] = React.useState(1);
  const [weightByProduct, setWeightByProduct] = React.useState({}); // {productId: weight}
  const perPage = 6;

  React.useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  const filtered = PRODUCTS.filter((p) => {
    if (activeCat !== "all" && p.category !== activeCat) return false;
    const cheapest = Math.min(...p.weights.map((w) => w.price));
    if (cheapest > maxPrice) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const headerLabel = (CATEGORIES.find((c) => c.id === activeCat) || { label: "All Products" }).label;

  return (
    <main data-screen-label="02 Shop">
      <h1 className="sr-only">{headerLabel} — Shop SSS Food World</h1>
      <section className="page-hero" aria-hidden="true">
        <span className="page-hero-label">{headerLabel}</span>
      </section>

      <div className="container shop-layout">
        <aside className="filters" id="categories" aria-label="Product filters">
          <h3>Filters</h3>

          <div className="filters-section">
            <h4>Categories</h4>
            <div className="filter-list">
              {CATEGORIES.map((c) => (
                <button key={c.id}
                        className={`filter-pill${activeCat === c.id ? " is-active" : ""}`}
                        onClick={() => { setActiveCat(c.id); setPage(1); }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filters-section">
            <h4>Max Price</h4>
            <div className="filter-range">
              <input type="range" min="50" max="1000" step="10"
                     value={maxPrice}
                     onChange={(e) => { setMaxPrice(+e.target.value); setPage(1); }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--c-muted)" }}>
                <span>{fmt(50)}</span><span><b style={{ color: "var(--c-primary)" }}>{fmt(maxPrice)}</b></span>
              </div>
            </div>
          </div>

        </aside>

        <section>
          <div className="shop-toolbar">
            <div className="shop-count">Showing <b>{filtered.length}</b> products</div>
          </div>

          {!catalog.ready && PRODUCTS.length === 0 ? (
            <div className="product-list" aria-busy="true" aria-label="Loading products">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="p-row skeleton-card" key={`sk-${i}`}>
                  <div className="p-row-media skeleton-shimmer" />
                  <div className="p-row-body">
                    <div className="skeleton-line skeleton-shimmer" style={{ width: "60%" }} />
                    <div className="skeleton-line skeleton-shimmer" style={{ width: "92%" }} />
                    <div className="skeleton-line skeleton-shimmer" style={{ width: "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div className="empty-block" role="status">
              <p>No products match those filters.</p>
              <button className="btn btn--ghost btn--sm" onClick={() => { setActiveCat("all"); setMaxPrice(1000); }}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className="product-list">
              {visible.map((p, idx) => {
                const selectedW = weightByProduct[p.id] || p.weights[0].w;
                const sel = p.weights.find((w) => w.w === selectedW) || p.weights[0];
                return (
                  <article className="p-row fade-up" key={p.id}
                           onClick={() => onNav("product", p.id)}
                           onKeyDown={(e) => { if (e.key === "Enter") onNav("product", p.id); }}
                           tabIndex={0} role="link"
                           aria-label={`${p.name} — view details`}>
                    <div className="p-row-media">
                      <img src={p.img} alt={p.name} loading={idx < 3 ? "eager" : "lazy"} fetchpriority={idx < 1 ? "high" : "auto"} />
                    </div>
                    <div className="p-row-body">
                      <h3>{p.name}</h3>
                      <p>{p.desc}</p>
                      <div className="p-row-tags">
                        {p.tags.map((t) => <span className="tag tag--success" key={t}>{t}</span>)}
                      </div>
                    </div>
                    <div className="p-row-side" onClick={(e) => e.stopPropagation()}>
                      <div className="weight-row">
                        {p.weights.map((w) => (
                          <button key={w.w}
                                  className={`weight-chip${selectedW === w.w ? " is-active" : ""}`}
                                  onClick={() => setWeightByProduct({ ...weightByProduct, [p.id]: w.w })}>
                            {w.w}
                          </button>
                        ))}
                      </div>
                      <div className="price-row">
                        <span className="price">{fmt(sel.price)}</span>
                        {sel.mrp > sel.price && <span className="price-strike">{fmt(sel.mrp)}</span>}
                      </div>
                      <button className="btn btn--primary btn--sm" onClick={() => onAddToCart(p, sel)}>
                        <Icon name="cart" size={14}/> Add to Cart
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button className="page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">
                <Icon name="chev-left" size={16}/>
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i}
                        className={`page-btn${page === i + 1 ? " is-active" : ""}`}
                        onClick={() => setPage(i + 1)}
                        aria-label={`Page ${i + 1}`}
                        aria-current={page === i + 1 ? "page" : undefined}>
                  {i + 1}
                </button>
              ))}
              <button className="page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page">
                <Icon name="chev-right" size={16}/>
              </button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// Product Detail Page
// ─────────────────────────────────────────────
function ProductPage({ productId, onNav, onAddToCart }) {
  const product = PRODUCTS.find((p) => p.id === productId) || PRODUCTS[1]; // fallback to Nalla Karam
  const [weight, setWeight] = React.useState(product.weights[0].w);
  const [qty, setQty] = React.useState(1);
  const [tab, setTab] = React.useState("description");
  const [activeImg, setActiveImg] = React.useState(0);

  React.useEffect(() => {
    setWeight(product.weights[0].w);
    setQty(1);
    setActiveImg(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  const sel = product.weights.find((w) => w.w === weight) || product.weights[0];
  const savings = sel.mrp - sel.price;
  const savePct = sel.mrp ? Math.round((savings / sel.mrp) * 100) : 0;

  // Alternative images: use the product img + 2 others as gallery
  const altImgs = [product.img, "assets/product-pickle.jpg", "assets/product-podi.jpg"];

  return (
    <main className="container" data-screen-label="03 Product Detail" style={{ paddingTop: 24 }}>
      <div className="crumbs">
        <a href="#/" onClick={(e) => { e.preventDefault(); onNav("home"); }}>Home</a>
        <span className="sep">/</span>
        <a href="#/shop" onClick={(e) => { e.preventDefault(); onNav("shop"); }}>Shop</a>
        <span className="sep">/</span>
        <span className="current">{product.name}</span>
      </div>

      <section className="pdp-layout">
        <div className="pdp-media">
          <div className="pdp-main-img">
            <img src={altImgs[activeImg]} alt={product.name} />
          </div>
          <div className="pdp-thumbs">
            {altImgs.map((src, i) => (
              <button key={i} className={`pdp-thumb${activeImg === i ? " is-active" : ""}`} onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}>
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-body fade-up">
          <h1 className="pdp-title">{product.name}</h1>
          <div className="pdp-rating">
            <span className="stars" aria-label={`Rated ${product.rating} out of 5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name={i < Math.round(product.rating) ? "star" : "star-o"} size={16}/>
              ))}
            </span>
            <a href="#reviews" onClick={(e) => { e.preventDefault(); setTab("reviews"); }}>
              {product.reviews} reviews
            </a>
          </div>
          <p className="pdp-desc pretty">{product.longDesc || product.desc}</p>

          <div className="pdp-tags">
            {product.tags.map((t) => <span className="tag tag--info" key={t}><Icon name="leaf" size={12}/> {t}</span>)}
          </div>

          <div>
            <div className="pdp-weight-label">Select Weight</div>
            <div className="pdp-weights" style={{ marginTop: 12 }}>
              {product.weights.map((w) => (
                <button key={w.w}
                        className={`pdp-weight${weight === w.w ? " is-active" : ""}`}
                        onClick={() => setWeight(w.w)}>
                  {w.w}
                </button>
              ))}
            </div>
          </div>

          <div className="pdp-price-row">
            <span className="pdp-price">{fmt(sel.price)}</span>
            {sel.mrp > sel.price && (
              <React.Fragment>
                <span className="price-strike">{fmt(sel.mrp)}</span>
                <span className="pdp-savings">You save {fmt(savings)} ({savePct}%)</span>
              </React.Fragment>
            )}
          </div>

          <div className="pdp-cta-row">
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity">
                <Icon name="minus" size={14}/>
              </button>
              <input type="number" min="1" max="99" value={qty}
                     onChange={(e) => { const v = Math.max(1, Math.min(99, +e.target.value || 1)); setQty(v); }}
                     aria-label="Quantity" />
              <button onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase quantity">
                <Icon name="plus" size={14}/>
              </button>
            </div>
            <button className="btn btn--primary" style={{ flex: 1, minWidth: 220 }} onClick={() => onAddToCart(product, sel, qty)}>
              <Icon name="cart" size={16}/> Add to Cart
            </button>
          </div>

          <div className="pdp-trust-grid">
            <div className="pdp-trust-item">
              <Icon name="truck" /> <span className="t-label">Fast Delivery</span>
            </div>
            <div className="pdp-trust-item">
              <Icon name="refresh" /> <span className="t-label">Easy Returns</span>
            </div>
            <div className="pdp-trust-item">
              <Icon name="shield" /> <span className="t-label">Secure Payment</span>
            </div>
            <div className="pdp-trust-item">
              <Icon name="award" /> <span className="t-label">Premium Quality</span>
            </div>
          </div>
        </div>
      </section>

      <section className="tabs" id="reviews">
        <div className="tab-list" role="tablist">
          {["description","ingredients","howto","reviews"].map((t) => (
            <button key={t}
                    role="tab"
                    aria-selected={tab === t}
                    className={`tab-btn${tab === t ? " is-active" : ""}`}
                    onClick={() => setTab(t)}>
              {t === "description" && "Description"}
              {t === "ingredients" && "Ingredients"}
              {t === "howto" && "How to Use"}
              {t === "reviews" && `Reviews (${product.reviews})`}
            </button>
          ))}
        </div>
        <div className="tab-panel">
          {tab === "description" && (
            <div>
              <p>{product.longDesc || product.desc}</p>
              <p>The result is a coarse, flavor-packed blend that offers a perfect symphony of garlic-infused heat and earthy richness. It's the ultimate companion for hot idlis, crispy dosas, or simply mixed with a dollop of ghee over steaming rice. We maintain a strict zero-preservative policy, ensuring you experience the authentic, rustic taste of a Telugu household.</p>
            </div>
          )}
          {tab === "ingredients" && (
            <ul>
              {(product.ingredients || [
                "Hand-selected spices for an authentic regional flavor profile",
                "Rich in antioxidants from curry leaves and garlic",
                "Slow-roasted and stone-ground to keep essential flavors intact",
                "No artificial colors or additives — just 100% natural ingredients",
              ]).map((it) => <li key={it}>{it}</li>)}
            </ul>
          )}
          {tab === "howto" && (
            <ul>
              {(product.howTo || [
                "Mix 1–2 tsp with hot rice and a dollop of ghee.",
                "Sprinkle over fresh idlis or dosas as a flavor finisher.",
                "Stir into yogurt for a quick raita with bite.",
                "Use as a dry rub for grilled vegetables or paneer.",
              ]).map((it) => <li key={it}>{it}</li>)}
            </ul>
          )}
          {tab === "reviews" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {[
                { n: "Lakshmi R.", r: 5, t: "Tastes exactly like my grandmother used to make. The smell when you open the jar transports you home." },
                { n: "Arjun S.",    r: 5, t: "Quality is exceptional — coarse stone-ground texture, not the fine, lifeless powder you usually get." },
                { n: "Priya N.",    r: 4, t: "Great heat without being one-dimensional. A little goes a long way. Shipping was quick." },
              ].map((rev) => (
                <div key={rev.n} style={{ padding: 20, background: "rgba(255,255,255,0.5)", borderRadius: 12, border: "1px solid var(--c-line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <b style={{ color: "var(--c-ink-2)" }}>{rev.n}</b>
                    <span className="stars">
                      {Array.from({ length: 5 }).map((_, i) => <Icon key={i} name={i < rev.r ? "star" : "star-o"} size={14}/>)}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "var(--c-ink-3)" }}>"{rev.t}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

// ─────────────────────────────────────────────
// Categories landing
// ─────────────────────────────────────────────
function CategoriesPage({ onNav }) {
  React.useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  const cats = CATEGORIES.filter((c) => c.id !== "all");
  const countByCat = (id) => PRODUCTS.filter((p) => p.category === id).length;
  return (
    <React.Fragment>
      <div className="page-hero">
        <div>
          <h1 style={{ fontFamily: "var(--font-mono)", fontSize: 16, letterSpacing: 4, color: "#fff", margin: 0 }}>
            CATEGORIES
          </h1>
        </div>
      </div>

      <section className="container" style={{ padding: "56px 0 80px" }}>
        <div className="cat-grid">
          {cats.map((c) => (
            <button key={c.id} className="cat-tile" onClick={() => onNav("shop", c.id)}
                    style={{ "--cat-accent": c.accent }}>
              <div className="cat-tile-disc">
                <CollectionGlyph color={c.accent} id={c.id} />
              </div>
              <h3>{c.label}</h3>
              <span>{countByCat(c.id)} {countByCat(c.id) === 1 ? "product" : "products"}</span>
            </button>
          ))}
        </div>
      </section>
    </React.Fragment>
  );
}

Object.assign(window, { HomePage, ShopPage, ProductPage, CategoriesPage });
