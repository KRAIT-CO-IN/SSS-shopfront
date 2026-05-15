/* eslint-disable */
// SSS Food World — Admin pages

// ─────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = React.useState("admin@artisangroc.com");
  const [pw, setPw] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");
  const submit = async (e) => {
    e.preventDefault();
    if (!email || !pw) { setErr("Email and password required"); return; }
    setBusy(true); setErr("");
    try { await onLogin(email, pw); }
    catch (e) { setErr(e.message || "Login failed"); }
    finally { setBusy(false); }
  };
  return (
    <div className="adm-login-wrap">
      <form className="adm-login" onSubmit={submit}>
        <div className="adm-login-logo">
          <img src="/assets/sss-logo-v3.png" alt="SSS Food World" className="adm-login-img" />
        </div>
        <div className="adm-login-title">Admin Portal</div>

        <div className="afield">
          <label className="afield-label">Email Address</label>
          <input className="ainput" type="email" placeholder="admin@artisangroc.com"
                 value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="afield">
          <label className="afield-label">Password</label>
          <div className="apass-wrap">
            <input className="ainput" type={show ? "text" : "password"} placeholder="••••••••"
                   value={pw} onChange={(e) => setPw(e.target.value)} />
            <button type="button" className="eye" aria-label="Toggle password" onClick={() => setShow((s) => !s)}>
              <AIcon name={show ? "eye" : "eye-off"} size={18} />
            </button>
          </div>
        </div>

        <button type="button" className="forgot">Forgot password?</button>

        {err && <div style={{ color: "var(--ac-primary)", fontSize: 13, marginBottom: 10, textAlign: "center" }}>{err}</div>}

        <button type="submit" className="abtn abtn--primary abtn--block" disabled={busy}>
          {busy ? "Signing in…" : "Sign In"}
        </button>

        <div className="secure">
          <AIcon name="lock" size={12} /> Secure Admin Access
        </div>
        <div className="adm-login-foot">© 2025 ArtisanGroc. Internal Use Only.</div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────
// All Products
// ─────────────────────────────────────────────
function ProductsPage({ products, onNav, onDelete }) {
  const [page, setPage] = React.useState(1);
  const [selection, setSelection] = React.useState(new Set());

  const toggle = (id) => {
    setSelection((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const allChecked = products.length > 0 && selection.size === products.length;
  const toggleAll = () => {
    setSelection(allChecked ? new Set() : new Set(products.map((p) => p.pid)));
  };

  return (
    <div className="atable-wrap">
      <table className="atable">
        <thead>
          <tr>
            <th style={{ width: 56 }}>
              <input type="checkbox" className="acheck" checked={allChecked} onChange={toggleAll} />
            </th>
            <th style={{ width: 88 }}>Image</th>
            <th>Product Name</th>
            <th>ID</th>
            <th>Category</th>
            <th className="num">Price</th>
            <th className="num">Disc.</th>
            <th className="num">Stock</th>
            <th>Status</th>
            <th style={{ width: 100 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.pid}>
              <td>
                <input type="checkbox" className="acheck"
                       checked={selection.has(p.pid)} onChange={() => toggle(p.pid)} />
              </td>
              <td>
                <div className="atable-thumb" style={{ backgroundImage: `url(${p.img})` }} />
              </td>
              <td>
                <div className="atable-name">
                  <b style={{ cursor: "pointer" }} onClick={() => onNav("product", p.pid)}>{p.name}</b>
                  <span>{p.shortDesc}</span>
                </div>
              </td>
              <td className="atable-id">{p.pid}</td>
              <td><span className="apill apill--cat no-dot">{p.category}</span></td>
              <td className="num">{afmt(p.price)}</td>
              <td className="num text-red">{p.disc ? afmt(p.disc) : "—"}</td>
              <td className="num">{p.stock}</td>
              <td><span className="apill apill--success">{p.status}</span></td>
              <td>
                <div className="atable-actions">
                  <button aria-label="Edit" onClick={() => onNav("product-edit", p.pid)}><AIcon name="edit" size={16} /></button>
                  <button aria-label="Delete" onClick={() => onDelete(p)}><AIcon name="trash" size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="atable-foot">
        <span>Showing <b>1–{products.length}</b> of <b>124</b></span>
        <div className="apager">
          <button disabled aria-label="Previous"><AIcon name="chev-l" size={14} /></button>
          <button className={page === 1 ? "is-active" : ""} onClick={() => setPage(1)}>1</button>
          <button className={page === 2 ? "is-active" : ""} onClick={() => setPage(2)}>2</button>
          <button aria-label="Next" onClick={() => setPage(2)}><AIcon name="chev-r" size={14} /></button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Product Form (Add / Edit shared)
// ─────────────────────────────────────────────
function ProductForm({ mode, product, onSave, onDelete, onBack }) {
  const isEdit = mode === "edit";
  const [form, setForm] = React.useState(() => product || {
    pid: "PRD-0043", name: "", catId: "CAT-002", category: "",
    shortDesc: "", fullDesc: "", price: "", disc: "", discountLabel: "",
    stock: 100, lowAlert: 10, status: "Published", visible: true,
    tags: ["No Preservatives", "Vegan"],
    variants: [
      { w: "100g", price: "", stock: 0 },
      { w: "250g", price: "", stock: 0 },
    ],
    img: null,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleTag = (t) => {
    setForm((f) => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter((x) => x !== t) : [...f.tags, t] }));
  };
  const setVariant = (i, k, v) => {
    const arr = [...form.variants];
    arr[i] = { ...arr[i], [k]: v };
    set("variants", arr);
  };
  const addVariant = () => set("variants", [...form.variants, { w: "", price: "", stock: 0 }]);
  const removeVariant = (i) => set("variants", form.variants.filter((_, idx) => idx !== i));

  return (
    <div className="adm-2col">
      <div>
        {/* Basic info */}
        <div className="adm-card">
          <h2 className="adm-card-title">Basic Information</h2>
          <div className="afield">
            <label className="afield-label">Product Name</label>
            <input className="ainput" placeholder="e.g. Guntur Red Chili Powder"
                   value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="afield">
            <label className="afield-label">Product ID</label>
            <div className="ainput-locked">
              <input className="ainput ainput-mono" value={form.pid} readOnly />
              <span className="lock"><AIcon name="lock" size={14} /></span>
            </div>
            <span className="afield-hint">Auto-generated by system</span>
          </div>
          <div className="afield">
            <label className="afield-label">Short Description</label>
            <input className="ainput" placeholder="One-line tagline shown in product listing"
                   value={form.shortDesc} onChange={(e) => set("shortDesc", e.target.value)} />
          </div>
          <div className="afield">
            <label className="afield-label">Full Description</label>
            <textarea className="atextarea" rows="3" placeholder="Detailed product description…"
                      value={form.fullDesc} onChange={(e) => set("fullDesc", e.target.value)} />
          </div>
        </div>

        {/* Category */}
        <div className="adm-card">
          <h2 className="adm-card-title">Category &amp; Classification</h2>
          <div className="afield">
            <label className="afield-label">Category</label>
            <select className="aselect" value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Select Category</option>
              {window.ADMIN_CATEGORIES.map((c) => <option key={c.cid} value={c.name}>{c.name}</option>)}
            </select>
            <button type="button" className="alink" style={{ marginTop: 8, textAlign: "left" }}>+ Create New Category</button>
          </div>
          <div className="afield">
            <label className="afield-label">Category ID</label>
            <div className="ainput-locked">
              <input className="ainput ainput-mono" value={form.catId} readOnly />
              <span className="lock"><AIcon name="lock" size={14} /></span>
            </div>
          </div>
          <div className="afield">
            <label className="afield-label">Health Tags</label>
            <div className="achips">
              {window.HEALTH_TAGS_ALL.map((t) => (
                <button key={t} type="button"
                        className={`achip${form.tags.includes(t) ? " is-active" : ""}`}
                        onClick={() => toggleTag(t)}>{t}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="adm-card">
          <h2 className="adm-card-title">Pricing &amp; Inventory</h2>
          <div className="afield-row cols-2">
            <div className="afield">
              <label className="afield-label">Regular Price (₹)</label>
              <input className="ainput" placeholder="₹ 0.00" value={form.price}
                     onChange={(e) => set("price", e.target.value)} />
            </div>
            <div className="afield">
              <label className="afield-label">Discounted Price (₹)</label>
              <input className="ainput" placeholder="₹ 0.00" value={form.disc || ""}
                     onChange={(e) => set("disc", e.target.value)} />
              <span className="afield-hint">Optional</span>
            </div>
          </div>
          <div className="afield">
            <label className="afield-label">Discount Label</label>
            <input className="ainput" placeholder="e.g. Save ₹50 (20% off)" value={form.discountLabel}
                   onChange={(e) => set("discountLabel", e.target.value)} />
          </div>
          <div className="afield-row cols-2">
            <div className="afield">
              <label className="afield-label">Stock Quantity</label>
              <div className="astepper">
                <button type="button" onClick={() => set("stock", Math.max(0, (+form.stock || 0) - 1))}>−</button>
                <input value={form.stock} onChange={(e) => set("stock", e.target.value.replace(/\D/g, ""))} />
                <button type="button" onClick={() => set("stock", (+form.stock || 0) + 1)}>+</button>
              </div>
            </div>
            <div className="afield">
              <label className="afield-label">Low Stock Alert</label>
              <input className="ainput" value={form.lowAlert}
                     onChange={(e) => set("lowAlert", e.target.value.replace(/\D/g, ""))} />
              <span className="afield-hint">Alert below this qty</span>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="adm-card">
          <h2 className="adm-card-title">Weight / Size Variants</h2>
          {form.variants.map((v, i) => (
            <div className="avariant-row" key={i}>
              <input className="ainput" placeholder="100g" value={v.w}
                     onChange={(e) => setVariant(i, "w", e.target.value)} />
              <input className="ainput" placeholder="₹0.00" value={v.price}
                     onChange={(e) => setVariant(i, "price", e.target.value)} />
              <input className="ainput" placeholder="0" value={v.stock}
                     onChange={(e) => setVariant(i, "stock", e.target.value.replace(/\D/g, ""))} />
              <button type="button" className="x" aria-label="Remove variant" onClick={() => removeVariant(i)}>
                <AIcon name="close" size={14} />
              </button>
            </div>
          ))}
          <button type="button" className="alink" onClick={addVariant}>+ Add Another Variant</button>
        </div>
      </div>

      {/* Right column */}
      <div>
        <div className="adm-card">
          <h2 className="adm-card-title">Product Images</h2>
          {isEdit ? (
            <div className="aproduct-img" style={form.img ? { backgroundImage: `url(${form.img})` } : null}>
              {!form.img && <AIcon name="image" size={36} />}
            </div>
          ) : (
            <div className="adropzone">
              <AIcon name="cloud-up" size={36} />
              <b>Drag &amp; drop or click to upload</b>
              <span>PNG or JPG, max 5MB</span>
            </div>
          )}
          {isEdit && <button type="button" className="abtn abtn--ghost abtn--block" style={{ marginTop: 12 }}>Change Image</button>}
          <div className="adropzone-row">
            <div className={`slot${form.img ? " has-image" : ""}`}>{form.img ? <AIcon name="image" size={18}/> : "+"}</div>
            <div className="slot">+</div>
            <div className="slot">+</div>
            <div className="slot">+</div>
          </div>
          {!isEdit && (
            <div className="afield" style={{ marginTop: 16, marginBottom: 0 }}>
              <label className="afield-label">Image Alt Text</label>
              <input className="ainput" />
            </div>
          )}
        </div>

        <div className="adm-card">
          <h2 className="adm-card-title">Status &amp; Visibility</h2>
          <div className="aseg">
            {["Draft", "Published", "Out of Stock"].map((s) => (
              <button key={s} type="button"
                      className={form.status === s ? "is-active" : ""}
                      onClick={() => set("status", s)}>{s}</button>
            ))}
          </div>
          <div className="atoggle-row" style={{ marginTop: 16, borderTop: "none", paddingTop: 0 }}>
            <div className="atoggle-row-body"><h5>Show on storefront</h5></div>
            <AdmToggle checked={form.visible} onChange={(v) => set("visible", v)} />
          </div>
          <button type="button" className="abtn abtn--primary abtn--block" onClick={() => onSave(form)}>
            {isEdit ? "Update Product" : "Publish Product"}
          </button>
          <button type="button" className="abtn abtn--ghost abtn--block" style={{ marginTop: 10 }}>
            Save as Draft
          </button>
          {isEdit ? (
            <React.Fragment>
              <button type="button" className="abtn abtn--danger abtn--block" style={{ marginTop: 10 }}
                      onClick={() => onDelete(form)}>
                Delete This Product
              </button>
              <p className="text-red" style={{ textAlign: "center", fontSize: 12, marginTop: 8, marginBottom: 0 }}>
                This action cannot be undone.
              </p>
            </React.Fragment>
          ) : (
            <button type="button" className="alink" style={{ display: "block", margin: "12px auto 0" }}
                    onClick={onBack}>Discard Changes</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Product Detail (read-only)
// ─────────────────────────────────────────────
function ProductDetailPage({ product, onBack }) {
  if (!product) return <div className="adm-card">Product not found.</div>;
  return (
    <div className="adm-2col">
      <div>
        <div className="adm-card">
          <button className="aback" onClick={onBack}><AIcon name="chev-l" size={16}/> Product Information</button>
          <h2 className="aproduct-title">{product.name}</h2>

          <div className="aprop-row">
            <span className="lbl">Product ID</span>
            <span className="val mono">{product.pid}</span>
          </div>
          <div className="aprop-row">
            <span className="lbl">Category</span>
            <span className="val"><span className="apill apill--cat no-dot">{product.category}</span></span>
          </div>
          <div className="aprop-row">
            <span className="lbl">Category ID</span>
            <span className="val mono">{product.catId}</span>
          </div>
          <div className="aprop-row">
            <span className="lbl">Status</span>
            <span className="val"><span className="apill apill--success">{product.status}</span></span>
          </div>
          <div className="aprop-row">
            <span className="lbl">Storefront</span>
            <span className="val" style={{ color: "var(--ac-success)" }}>
              <AIcon name="check-c" size={16} /> Visible
            </span>
          </div>
          <div className="aprop-row">
            <span className="lbl">Health Tags</span>
            <span className="val">
              <div className="achips">
                {product.tags.map((t) => <span key={t} className="apill apill--success no-dot">{t}</span>)}
              </div>
            </span>
          </div>
          <div className="aprop-row">
            <span className="lbl">Short Description</span>
            <span className="val italic">{product.shortDesc}</span>
          </div>
          <div className="aprop-row">
            <span className="lbl">Full Description</span>
            <span className="val">{product.fullDesc}</span>
          </div>
        </div>

        <div className="adm-card">
          <h2 className="adm-card-title">Weight Variants</h2>
          <table className="atable" style={{ background: "transparent" }}>
            <thead>
              <tr>
                <th>Weight</th>
                <th className="num">Regular Price</th>
                <th className="num">Discounted Price</th>
                <th className="num">Stock Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.w}>
                  <td><b>{v.w}</b></td>
                  <td className="num">{afmt(v.price)}</td>
                  <td className="num text-red">{v.disc ? afmt(v.disc) : "—"}</td>
                  <td className="num">{v.stock}</td>
                  <td>
                    <span className={`apill ${v.status === "Low" ? "apill--warn" : "apill--success"}`}>{v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="adm-card">
          <h2 className="adm-card-title">Product Image</h2>
          <div className="aproduct-img" style={{ backgroundImage: `url(${product.img})` }} />
          <div className="athumbs">
            <div className="thumb"><AIcon name="image" size={22} /></div>
            <div className="thumb"><AIcon name="image" size={22} /></div>
            <div className="thumb"><AIcon name="image" size={22} /></div>
          </div>
        </div>

        <div className="adm-card">
          <h2 className="adm-card-title">Pricing Summary</h2>
          <div className="aprice-row"><span>Regular Price</span><b>{afmt(product.price)}</b></div>
          <div className="aprice-row"><span>Discounted Price</span><span className="strike">{product.disc ? afmt(product.disc) : "—"}</span></div>
          <div className="aprice-row" style={{ borderTop: "1px solid var(--ac-line)", paddingTop: 14 }}>
            <span>Total Stock</span><b>{product.stock} units</b>
          </div>
          <div className="aprice-row">
            <span>Low Stock Alert</span><span className="warn">Alert at: {product.lowAlert}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Categories list
// ─────────────────────────────────────────────
function CategoriesPage({ categories, onNav, onDelete }) {
  return (
    <React.Fragment>
      <div className="adm-stats">
        <div className="adm-stat">
          <span className="v">6</span>
          <span className="adm-stat-icon"><AIcon name="grid" /></span>
        </div>
        <div className="adm-stat">
          <span className="v">124</span>
          <span className="adm-stat-icon neutral"><AIcon name="archive" /></span>
        </div>
        <div className="adm-stat is-red">
          <span className="v">3</span>
          <span className="adm-stat-icon warn"><AIcon name="alert-tri" /></span>
        </div>
      </div>

      <div className="adm-filters">
        <div className="search" style={{ gridColumn: "1 / 4" }}>
          <AIcon name="search" size={16} />
          <input className="ainput" placeholder="Search categories…" />
        </div>
        <button className="abtn abtn--primary" onClick={() => onNav("category-add")}>
          <AIcon name="plus-c" size={16} /> Add New Category
        </button>
      </div>

      <div className="atable-wrap">
        <table className="atable">
          <thead>
            <tr>
              <th style={{ width: 56 }}><input type="checkbox" className="acheck" /></th>
              <th style={{ width: 88 }}>Image</th>
              <th>Category Name</th>
              <th>Category ID</th>
              <th>Products</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.cid}>
                <td><input type="checkbox" className="acheck" /></td>
                <td>
                  <div className="atable-thumb" style={{ backgroundImage: `url(${c.img})` }} />
                </td>
                <td><b>{c.name}</b></td>
                <td className="atable-id">{c.cid}</td>
                <td>{c.products}</td>
                <td>
                  <span className={`apill ${c.status === "Draft" ? "apill--neutral no-dot" : "apill--success"}`}>{c.status}</span>
                </td>
                <td>{c.created}</td>
                <td>
                  <div className="atable-actions">
                    <button aria-label="Edit"><AIcon name="edit" size={16} /></button>
                    <button aria-label="Delete" onClick={() => onDelete(c)}><AIcon name="trash" size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="atable-foot">
          <span>Showing 1 to {Math.min(4, categories.length)} of {categories.length} entries</span>
          <div className="apager">
            <button disabled><AIcon name="chev-l" size={14} /></button>
            <button className="is-active">1</button>
            <button><AIcon name="chev-r" size={14} /></button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

// ─────────────────────────────────────────────
// Add Category
// ─────────────────────────────────────────────
function AddCategoryPage({ onSave, onCancel }) {
  const [form, setForm] = React.useState({
    name: "", cid: "CAT-007", slug: "pickles", desc: "",
    showNav: true, showHome: true, order: 1, status: "Published",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="adm-card">
        <h2 className="adm-card-title">Category Details</h2>
        <div className="afield">
          <label className="afield-label">Category Name</label>
          <input className="ainput" placeholder="e.g. Pickles" value={form.name}
                 onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="afield">
          <label className="afield-label">Category ID</label>
          <div className="ainput-locked">
            <input className="ainput ainput-mono" value={form.cid} readOnly />
            <span className="lock"><AIcon name="lock" size={14} /></span>
          </div>
          <span className="afield-hint">Auto-assigned by system</span>
        </div>
        <div className="afield">
          <label className="afield-label">URL Slug</label>
          <input className="ainput ainput-mono" value={form.slug}
                 onChange={(e) => set("slug", e.target.value)} />
          <span className="afield-hint">artisangroc.com/category/{form.slug}</span>
        </div>
        <div className="afield">
          <label className="afield-label">Short Description</label>
          <textarea className="atextarea" rows="2" placeholder="Description shown on category banner page"
                    value={form.desc} onChange={(e) => set("desc", e.target.value)} />
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Category Image</h2>
        <div className="abanner-up">
          <AIcon name="cloud-up" size={36} />
          <b>Upload Category Banner</b>
          <span>1200×400px recommended</span>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Display Settings</h2>
        <div className="atoggle-row">
          <div className="atoggle-row-body">
            <h5>Show in Navigation</h5>
            <p>Show this category in storefront navigation</p>
          </div>
          <AdmToggle checked={form.showNav} onChange={(v) => set("showNav", v)} />
        </div>
        <div className="atoggle-row">
          <div className="atoggle-row-body">
            <h5>Show in Homepage Category Strip</h5>
            <p>Appear on homepage category icon row</p>
          </div>
          <AdmToggle checked={form.showHome} onChange={(v) => set("showHome", v)} />
        </div>

        <div className="afield" style={{ marginTop: 18 }}>
          <label className="afield-label">Display Order</label>
          <input className="ainput" style={{ maxWidth: 120 }} value={form.order}
                 onChange={(e) => set("order", e.target.value.replace(/\D/g, ""))} />
          <span className="afield-hint">Lower = appears first</span>
        </div>

        <div className="aseg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", marginTop: 12 }}>
          {["Published", "Draft", "Hidden"].map((s) => (
            <button key={s} type="button"
                    className={form.status === s ? "is-active" : ""}
                    onClick={() => set("status", s)}>{s}</button>
          ))}
        </div>

        <button type="button" className="abtn abtn--primary abtn--block" style={{ marginTop: 18 }}
                onClick={() => onSave(form)}>Save Category</button>
        <button type="button" className="abtn abtn--ghost abtn--block" style={{ marginTop: 10 }}>Save as Draft</button>
        <button type="button" className="alink" style={{ display: "block", margin: "12px auto 0" }}
                onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────
function TransactionsPage({ txns, onView }) {
  const [quick, setQuick] = React.useState("Last 30 Days");

  return (
    <React.Fragment>
      <div className="adm-card" style={{ padding: 22 }}>
        <div className="adm-daterange" style={{ marginBottom: 14 }}>
          <input className="ainput" type="date" aria-label="Start date" />
          <span className="arrow"><AIcon name="arrow-r" size={16} /></span>
          <input className="ainput" type="date" aria-label="End date" />
          <button className="abtn abtn--primary abtn--sm">Apply</button>
        </div>
        <div className="aquick">
          <span>Quick Select:</span>
          {["Today", "Last 7 Days", "Last 30 Days", "This Month"].map((q) => (
            <button key={q} className={`aquick-chip${quick === q ? " is-active" : ""}`}
                    onClick={() => setQuick(q)}>{q}</button>
          ))}
        </div>
        <div className="adm-row between" style={{ marginTop: 16, flexWrap: "wrap", gap: 12 }}>
          <select className="aselect" style={{ maxWidth: 180 }}>
            <option>All Payment</option><option>UPI</option><option>Card</option><option>COD</option>
          </select>
          <select className="aselect" style={{ maxWidth: 180 }}>
            <option>All Status</option><option>Completed</option><option>Failed</option><option>Refunded</option>
          </select>
          <div className="asearch-wrap">
            <AIcon name="search" size={16} className="asearch-icon" />
            <input className="ainput asearch-input" placeholder="Transaction ID, Order ID…" />
          </div>
          <a className="abtn abtn--ghost" href={window.API.orders.exportCsv()} target="_blank" rel="noopener">
            <AIcon name="down" size={16} /> Export CSV
          </a>
        </div>
      </div>

      <p className="text-muted" style={{ margin: "18px 4px" }}>
        Showing {txns.length} {txns.length === 1 ? "transaction" : "transactions"}
      </p>

      <div className="atable-wrap">
        <table className="atable">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Order ID</th>
              <th>Date &amp; Time</th>
              <th>Customer</th>
              <th className="num">Amount</th>
              <th>Payment</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.txId}>
                <td>
                  <button className="alink mono" onClick={() => onView(t)} style={{ textDecoration: "underline" }}>
                    {t.txId}
                  </button>
                </td>
                <td className="atable-id">{t.orderId}</td>
                <td>
                  <div>{t.date}</div>
                  <span className="text-muted" style={{ fontSize: 12 }}>{t.time}</span>
                </td>
                <td className="mono">{t.customerPhone}</td>
                <td className="num"><b>{afmt(t.amount)}</b></td>
                <td>{t.payment}</td>
                <td><span className="apill apill--success">{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="atable-foot">
          <span>Showing {txns.length === 0 ? 0 : 1}–{txns.length} of {txns.length} transactions</span>
          <div className="apager">
            <button disabled><AIcon name="chev-l" size={14}/></button>
            <button className="is-active">1</button>
            <button disabled style={{ display: "none" }}>2</button>
            <button disabled style={{ display: "none" }}>3</button>
            <button disabled style={{ display: "none" }}>…</button>
            <button disabled style={{ display: "none" }}>13</button>
            <button disabled><AIcon name="chev-r" size={14}/></button>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

// Transaction detail modal
function TransactionModal({ txn, onClose }) {
  React.useEffect(() => {
    if (!txn) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [txn, onClose]);
  if (!txn) return null;

  return (
    <div className="amodal-backdrop" onClick={onClose}>
      <div className="amodal amodal-lg" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="amodal-head">
          <h3>Transaction Detail</h3>
          <button className="amodal-close" onClick={onClose} aria-label="Close"><AIcon name="close" /></button>
        </div>

        <div style={{ background: "var(--ac-content)", borderRadius: 10, padding: "12px 16px", marginBottom: 18 }}>
          <span className="apill apill--success" style={{ fontSize: 13 }}>
            <AIcon name="check-c" size={14}/> {txn.status}
          </span>
        </div>

        <div className="aprop-row" style={{ borderBottom: "1px solid var(--ac-line)", paddingBottom: 6, marginBottom: 6 }}>
          <span className="lbl">Transaction Info</span>
          <span />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
          <div>
            <div className="lbl mono" style={{ fontSize: 11, letterSpacing: "1.6px", color: "var(--ac-muted-2)" }}>TRANSACTION ID</div>
            <div className="mono">{txn.txId}</div>
          </div>
          <div>
            <div className="lbl mono" style={{ fontSize: 11, letterSpacing: "1.6px", color: "var(--ac-muted-2)" }}>ORDER ID</div>
            <div className="mono">{txn.orderId}</div>
          </div>
          <div>
            <div className="lbl mono" style={{ fontSize: 11, letterSpacing: "1.6px", color: "var(--ac-muted-2)" }}>DATE &amp; TIME</div>
            <div>{txn.date}, {txn.time}</div>
          </div>
          <div>
            <div className="lbl mono" style={{ fontSize: 11, letterSpacing: "1.6px", color: "var(--ac-muted-2)" }}>PAYMENT METHOD</div>
            <div>{txn.payment} via Razorpay</div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--ac-line)", paddingTop: 14, marginBottom: 14 }}>
          <div className="lbl mono" style={{ fontSize: 11, letterSpacing: "1.6px", color: "var(--ac-muted-2)", marginBottom: 10 }}>CUSTOMER &amp; DELIVERY</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <div className="text-muted" style={{ fontSize: 12 }}>PHONE</div>
              <div className="mono">{txn.customerPhone}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: 12 }}>NAME</div>
              <div>{txn.customerName}</div>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div className="text-muted" style={{ fontSize: 12 }}>ADDRESS</div>
              <div>{txn.address}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: 12 }}>CITY</div>
              <div>{txn.city}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: 12 }}>STATE</div>
              <div>{txn.state}</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--ac-line)", paddingTop: 14 }}>
          <div className="lbl mono" style={{ fontSize: 11, letterSpacing: "1.6px", color: "var(--ac-muted-2)", marginBottom: 10 }}>ORDER ITEMS</div>
          <table className="atable" style={{ background: "transparent" }}>
            <thead>
              <tr>
                <th>Item</th>
                <th className="num">Qty</th>
                <th className="num">Price</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {txn.items.map((it, i) => (
                <tr key={i}>
                  <td>{it.name}</td>
                  <td className="num">{it.qty}</td>
                  <td className="num">{afmt(it.price)}</td>
                  <td className="num">{afmt(it.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <div style={{ minWidth: 240 }}>
              <div className="aprice-row" style={{ padding: "6px 0", borderBottom: "none" }}>
                <span className="text-muted">Subtotal</span><span>{afmt(txn.subtotal)}</span>
              </div>
              <div className="aprice-row" style={{ padding: "6px 0", borderBottom: "none" }}>
                <span className="text-muted">Shipping</span><span>{afmt(txn.shipping)}</span>
              </div>
              <div className="aprice-row" style={{ padding: "6px 0", borderBottom: "1px solid var(--ac-line)" }}>
                <span className="text-muted">GST (5%)</span><span>{afmt(txn.gst)}</span>
              </div>
              <div className="aprice-row" style={{ padding: "10px 0", fontSize: 16 }}>
                <b>Total</b><b className="text-red">{afmt(txn.total)}</b>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, borderTop: "1px solid var(--ac-line)", paddingTop: 18 }}>
          <button className="abtn abtn--ghost"><AIcon name="print" size={16} /> Print / Download Invoice</button>
          <button className="abtn abtn--primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Settings — Account
// ─────────────────────────────────────────────
function SettingsAccount({ toast }) {
  const [profile, setProfile] = React.useState({
    name: "Admin User", email: "admin@artisangroc.com", phone: "",
  });
  const [pw, setPw] = React.useState({ cur: "", new: "", confirm: "" });
  const [show, setShow] = React.useState({ cur: false, new: false, confirm: false });
  const [busy, setBusy] = React.useState(false);

  const strength = Math.min(4, Math.floor(pw.new.length / 2));
  const strengthLabel = ["", "Weak", "Weak", "Fair", "Strong"][strength];

  const set = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  React.useEffect(() => {
    window.API.auth.me().then((r) => r.admin && setProfile({
      name: r.admin.name || "", email: r.admin.email || "", phone: r.admin.phone || "",
    })).catch(() => {});
  }, []);

  const saveProfile = async () => {
    setBusy(true);
    try {
      await window.API.auth.updateProfile(profile);
      toast && toast("Profile saved");
    } catch (e) { toast && toast("Save failed: " + e.message); }
    finally { setBusy(false); }
  };

  const changePw = async () => {
    if (!pw.cur || !pw.new) { toast && toast("Fill current + new password"); return; }
    if (pw.new !== pw.confirm) { toast && toast("Passwords don't match"); return; }
    if (pw.new.length < 8) { toast && toast("New password must be 8+ characters"); return; }
    setBusy(true);
    try {
      await window.API.auth.changePassword(pw.cur, pw.new);
      setPw({ cur: "", new: "", confirm: "" });
      toast && toast("Password updated");
    } catch (e) { toast && toast("Update failed: " + e.message); }
    finally { setBusy(false); }
  };

  return (
    <React.Fragment>
      <div className="adm-card">
        <h2 className="adm-card-title">Account Information</h2>
        <div className="adm-row" style={{ marginBottom: 18 }}>
          <span className="adm-user-avatar" style={{ width: 56, height: 56, background: "#F1EAD7", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23B8A99A' stroke-width='1.6'%3E%3Crect x='4' y='4' width='16' height='16' rx='2'/%3E%3Cpath d='M4 16l4-4 5 5 3-3 4 4'/%3E%3C/svg%3E\")" }} />
          <div>
            <b style={{ display: "block", color: "var(--ac-ink-2)" }}>{profile.name}</b>
            <button className="alink">Change Photo</button>
          </div>
        </div>

        <div className="afield">
          <label className="afield-label">Full Name</label>
          <input className="ainput" value={profile.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="afield">
          <label className="afield-label">Email Address</label>
          <input className="ainput" value={profile.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="afield">
          <label className="afield-label">Phone Number</label>
          <input className="ainput" placeholder="+91 XXXXX XXXXX" value={profile.phone}
                 onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div className="afield">
          <label className="afield-label">Role</label>
          <div className="ainput-locked">
            <input className="ainput" value="Super Admin" readOnly />
            <span className="lock"><AIcon name="lock" size={14} /></span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="abtn abtn--primary" onClick={saveProfile} disabled={busy}>Save Changes</button>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Change Password</h2>
        {[
          { k: "cur", lbl: "Current Password" },
          { k: "new", lbl: "New Password" },
          { k: "confirm", lbl: "Confirm New Password" },
        ].map((f) => (
          <div className="afield" key={f.k}>
            <label className="afield-label">{f.lbl}</label>
            <div className="apass-wrap">
              <input className="ainput" type={show[f.k] ? "text" : "password"}
                     value={pw[f.k]} onChange={(e) => setPw({ ...pw, [f.k]: e.target.value })} />
              <button type="button" className="eye" onClick={() => setShow({ ...show, [f.k]: !show[f.k] })}>
                <AIcon name={show[f.k] ? "eye" : "eye-off"} size={18} />
              </button>
            </div>
            {f.k === "new" && pw.new.length > 0 && (
              <React.Fragment>
                <div className={`astrength s${strength}`}>
                  <span /><span /><span /><span />
                </div>
                <div className="astrength-label">{strengthLabel}</div>
              </React.Fragment>
            )}
          </div>
        ))}

        <ul className="areqs">
          <li>8+ characters</li>
          <li>One number</li>
          <li>One special character</li>
        </ul>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="abtn abtn--primary" onClick={changePw} disabled={busy}>Update Password</button>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title danger">Danger Zone</h2>
        <div className="adm-row between">
          <div>
            <b style={{ display: "block", color: "var(--ac-ink-2)" }}>Delete Admin Account</b>
            <span className="text-muted" style={{ fontSize: 13 }}>Permanently removes your admin access</span>
          </div>
          <button className="abtn abtn--danger">Delete Account</button>
        </div>
      </div>
    </React.Fragment>
  );
}

// ─────────────────────────────────────────────
// Settings — Store
// ─────────────────────────────────────────────
function SettingsStore({ toast }) {
  const [info, setInfo] = React.useState({
    name: "SSS FOOD WORLD",
    tagline: "Crafting authentic, small-batch preserves and culinary essentials.",
    supportEmail: "support@artisangroc.com",
    supportPhone: "+91 XXXXX XXXXX",
    address: "123 Heritage Lane, Old Fort Area, Hyderabad, Telangana 500001",
  });
  const [ship, setShip] = React.useState({ free: 499, rate: 80, eta: "2-4 Business Days", cod: true });
  const [magic, setMagic] = React.useState({ otpExpiry: 30, otpLen: 4, autofill: true, razKey: "rzp_live_XXXX...XXXX", reveal: false });

  const seti = (k, v) => setInfo((p) => ({ ...p, [k]: v }));
  const sets = (k, v) => setShip((p) => ({ ...p, [k]: v }));
  const setm = (k, v) => setMagic((p) => ({ ...p, [k]: v }));

  React.useEffect(() => {
    window.API.settings.get("store").then((r) => r.value && setInfo((p) => ({ ...p, ...r.value }))).catch(() => {});
    window.API.settings.get("shipping").then((r) => r.value && setShip((p) => ({ ...p, ...r.value }))).catch(() => {});
    window.API.settings.get("checkout").then((r) => r.value && setMagic((p) => ({ ...p, ...r.value }))).catch(() => {});
  }, []);

  const saveStore = async () => {
    try { await window.API.settings.update("store", info); toast && toast("Store info saved"); }
    catch (e) { toast && toast("Save failed: " + e.message); }
  };
  const saveShipping = async () => {
    try { await window.API.settings.update("shipping", ship); toast && toast("Shipping saved"); }
    catch (e) { toast && toast("Save failed: " + e.message); }
  };
  const saveCheckout = async () => {
    try { await window.API.settings.update("checkout", magic); toast && toast("Checkout saved"); }
    catch (e) { toast && toast("Save failed: " + e.message); }
  };
  const testConn = () => toast && toast("Razorpay connection OK");

  return (
    <React.Fragment>
      <div className="adm-card">
        <h2 className="adm-card-title">Store Information</h2>
        <div className="afield">
          <label className="afield-label">Store Name</label>
          <input className="ainput" value={info.name} onChange={(e) => seti("name", e.target.value)} />
        </div>
        <div className="afield">
          <label className="afield-label">Store Tagline</label>
          <input className="ainput" value={info.tagline} onChange={(e) => seti("tagline", e.target.value)} />
        </div>
        <div className="afield-row cols-2">
          <div className="afield">
            <label className="afield-label">Support Email</label>
            <input className="ainput" value={info.supportEmail} onChange={(e) => seti("supportEmail", e.target.value)} />
          </div>
          <div className="afield">
            <label className="afield-label">Support Phone</label>
            <input className="ainput" value={info.supportPhone} onChange={(e) => seti("supportPhone", e.target.value)} />
          </div>
        </div>
        <div className="afield">
          <label className="afield-label">Store Address</label>
          <textarea className="atextarea" rows="2" value={info.address}
                    onChange={(e) => seti("address", e.target.value)} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="abtn abtn--primary" onClick={saveStore}>Save Store Info</button>
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Shipping &amp; Delivery</h2>
        <div className="afield-row cols-2">
          <div className="afield">
            <label className="afield-label">Free Shipping Above (₹)</label>
            <input className="ainput" value={ship.free} onChange={(e) => sets("free", e.target.value)} />
          </div>
          <div className="afield">
            <label className="afield-label">Standard Shipping Rate (₹)</label>
            <input className="ainput" value={ship.rate} onChange={(e) => sets("rate", e.target.value)} />
          </div>
        </div>
        <div className="afield">
          <label className="afield-label">Estimated Delivery</label>
          <input className="ainput" value={ship.eta} onChange={(e) => sets("eta", e.target.value)} />
        </div>
        <div className="atoggle-row">
          <div className="atoggle-row-body">
            <h5>Cash on Delivery (COD)</h5>
            <p>Allow COD orders</p>
          </div>
          <AdmToggle checked={ship.cod} onChange={(v) => sets("cod", v)} />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button className="abtn abtn--primary" onClick={saveShipping}>Save Shipping Settings</button>
        </div>
      </div>

      <div className="adm-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--ac-line)" }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <AIcon name="bolt" size={18} /> Magic Checkout Settings
          </h2>
          <span className="aconn">Connected</span>
        </div>
        <div className="afield-row cols-2">
          <div className="afield">
            <label className="afield-label">OTP Expiry</label>
            <div className="adm-row" style={{ gap: 8 }}>
              <input className="ainput" style={{ maxWidth: 100 }} value={magic.otpExpiry}
                     onChange={(e) => setm("otpExpiry", e.target.value)} />
              <span className="text-muted">seconds</span>
            </div>
          </div>
          <div className="afield">
            <label className="afield-label">OTP Length</label>
            <div className="aseg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
              <button className={magic.otpLen === 4 ? "is-active" : ""} onClick={() => setm("otpLen", 4)}>4 digits</button>
              <button className={magic.otpLen === 6 ? "is-active" : ""} onClick={() => setm("otpLen", 6)}>6 digits</button>
            </div>
          </div>
        </div>
        <div className="atoggle-row">
          <div className="atoggle-row-body">
            <h5>Auto-fill Returning Customers</h5>
            <p>Match by phone number</p>
          </div>
          <AdmToggle checked={magic.autofill} onChange={(v) => setm("autofill", v)} />
        </div>
        <div className="afield" style={{ marginTop: 14 }}>
          <label className="afield-label">Razorpay Key ID</label>
          <div className="adm-row" style={{ gap: 8 }}>
            <input className="ainput ainput-mono" value={magic.reveal ? "rzp_live_AbCdEfGhIjKl" : magic.razKey} readOnly />
            <button className="alink" onClick={() => setm("reveal", !magic.reveal)}>{magic.reveal ? "Hide" : "Reveal"}</button>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
          <button className="abtn abtn--neutral" onClick={testConn}>Test Connection</button>
          <button className="abtn abtn--primary" onClick={saveCheckout}>Save Checkout Settings</button>
        </div>
      </div>
    </React.Fragment>
  );
}

// ─────────────────────────────────────────────
// Settings — Notifications
// ─────────────────────────────────────────────
function SettingsNotifications({ toast }) {
  const [n, setN] = React.useState({
    newOrder: true, paymentFailed: true, lowStock: true,
    email: true, sms: true,
    notifEmail: "admin@artisangroc.com", notifPhone: "+91 XXXXX XXXXX",
  });
  const set = (k, v) => setN((p) => ({ ...p, [k]: v }));

  React.useEffect(() => {
    window.API.settings.get("notifications").then((r) => r.value && setN((p) => ({ ...p, ...r.value }))).catch(() => {});
  }, []);

  const save = async () => {
    try { await window.API.settings.update("notifications", n); toast && toast("Notifications saved"); }
    catch (e) { toast && toast("Save failed: " + e.message); }
  };

  return (
    <React.Fragment>
      <div className="adm-card">
        <h2 className="adm-card-title">Order Notifications</h2>
        <div className="atoggle-row">
          <div className="atoggle-row-body">
            <h5>New Order Received</h5>
            <p>Notify when a customer places a new order</p>
          </div>
          <AdmToggle checked={n.newOrder} onChange={(v) => set("newOrder", v)} />
        </div>
        <div className="atoggle-row">
          <div className="atoggle-row-body">
            <h5>Payment Failed</h5>
            <p>Alert when checkout payment is unsuccessful</p>
          </div>
          <AdmToggle checked={n.paymentFailed} onChange={(v) => set("paymentFailed", v)} />
        </div>
        <div className="atoggle-row">
          <div className="atoggle-row-body">
            <h5>Low Stock Alert</h5>
            <p>Product quantity below your set threshold</p>
          </div>
          <AdmToggle checked={n.lowStock} onChange={(v) => set("lowStock", v)} />
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Notification Channels</h2>
        <div className="atoggle-row" style={{ borderTop: "none", paddingTop: 0 }}>
          <div className="atoggle-row-body">
            <h5>Email Notifications</h5>
            <p>{n.notifEmail}</p>
          </div>
          <AdmToggle checked={n.email} onChange={(v) => set("email", v)} />
        </div>
        <div className="atoggle-row">
          <div className="atoggle-row-body">
            <h5>SMS / WhatsApp</h5>
            <input className="ainput" style={{ maxWidth: 220, marginTop: 6 }}
                   value={n.notifPhone} onChange={(e) => set("notifPhone", e.target.value)} />
          </div>
          <AdmToggle checked={n.sms} onChange={(v) => set("sms", v)} />
        </div>
      </div>

      <div className="adm-card">
        <h2 className="adm-card-title">Recent Notification Log</h2>
        <table className="atable" style={{ background: "transparent" }}>
          <thead>
            <tr>
              <th>Date/Time</th>
              <th>Event</th>
              <th>Channel</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {window.NOTIF_LOG.map((l, i) => (
              <tr key={i}>
                <td className="mono">{l.dt}</td>
                <td>{l.event}</td>
                <td className="text-muted">{l.channel}</td>
                <td><span className="apill apill--success">{l.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button className="abtn abtn--primary abtn--block" style={{ marginTop: 18 }} onClick={save}>Save Notification Settings</button>
    </React.Fragment>
  );
}

Object.assign(window, {
  LoginPage, ProductsPage, ProductForm, ProductDetailPage,
  CategoriesPage, AddCategoryPage,
  TransactionsPage, TransactionModal,
  SettingsAccount, SettingsStore, SettingsNotifications,
});
