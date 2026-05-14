/* eslint-disable */
// SSS Food World — Admin root + hash router (API-backed)

function parseAdminRoute() {
  const h = (window.location.hash || "#/").replace(/^#/, "");
  const parts = h.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "products" };
  if (parts[0] === "login") return { name: "login" };
  if (parts[0] === "products") return { name: "products" };
  if (parts[0] === "product-add") return { name: "product-add" };
  if (parts[0] === "product-edit") return { name: "product-edit", id: parts[1] };
  if (parts[0] === "product") return { name: "product", id: parts[1] };
  if (parts[0] === "categories") return { name: "categories" };
  if (parts[0] === "category-add") return { name: "category-add" };
  if (parts[0] === "transactions") return { name: "transactions" };
  if (parts[0] === "settings") return { name: "settings", tab: parts[1] || "account" };
  return { name: "products" };
}

const ROUTE_TITLE = {
  products: "All Products", product: "Product Detail",
  "product-add": "Add New Product", "product-edit": "Edit Product",
  categories: "Categories", "category-add": "Add New Category",
  transactions: "Transaction History", settings: "Admin Settings",
};

function AdminApp() {
  const toasts = useToasts();
  const [route, setRoute] = React.useState(parseAdminRoute());
  const [authed, setAuthed] = React.useState(() => window.API.auth.isAuthed());
  const [products, setProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [txns, setTxns] = React.useState([]);
  const [confirmDel, setConfirmDel] = React.useState(null);
  const [viewTxn, setViewTxn] = React.useState(null);
  const [mobileNav, setMobileNav] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const onHash = () => { setRoute(parseAdminRoute()); setMobileNav(false); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const refreshProducts = React.useCallback(async () => {
    const { items } = await window.API.products.list({ take: 200 });
    const adapted = items.map(adaptAdminProduct);
    setProducts(adapted);
    return adapted;
  }, []);

  const refreshCategories = React.useCallback(async () => {
    const { items } = await window.API.categories.list();
    const adapted = items.map(adaptAdminCategory);
    setCategories(adapted);
    window.ADMIN_CATEGORIES.length = 0;
    adapted.forEach((c) => window.ADMIN_CATEGORIES.push(c));
    return adapted;
  }, []);

  const refreshTxns = React.useCallback(async () => {
    const { items } = await window.API.orders.list({ take: 50 });
    const adapted = items.map((o) => ({
      txId: o.txId, orderId: o.orderId,
      date: new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      time: new Date(o.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      customerPhone: o.customerPhone, customerName: o.customerName,
      address: o.address, city: o.city, state: o.state,
      amount: o.total, payment: o.payment, status: o.status,
      items: o.items, subtotal: o.subtotal, shipping: o.shipping, gst: o.gst, total: o.total,
    }));
    setTxns(adapted);
    return adapted;
  }, []);

  // Initial hydration after auth
  React.useEffect(() => {
    if (!authed) return;
    setLoading(true);
    Promise.all([refreshCategories(), refreshProducts(), refreshTxns()])
      .catch((e) => toasts.push("Load failed: " + e.message))
      .finally(() => setLoading(false));
  }, [authed]);

  const nav = (name, idOrTab) => {
    if (name === "settings" && idOrTab) window.location.hash = `#/settings/${idOrTab}`;
    else if ((name === "product" || name === "product-edit") && idOrTab) window.location.hash = `#/${name}/${idOrTab}`;
    else window.location.hash = `#/${name === "home" ? "" : name}`;
    setMobileNav(false);
  };

  const login = async (email, password) => {
    try {
      await window.API.auth.login(email, password).then((r) => window.API.auth.setToken(r.token));
      setAuthed(true);
      toasts.push("Welcome back, Admin");
      nav("products");
    } catch (e) {
      toasts.push("Login failed: " + e.message);
      throw e;
    }
  };
  const logout = () => {
    window.API.auth.logout();
    setAuthed(false);
    window.location.hash = "#/login";
  };

  React.useEffect(() => {
    if (!authed && route.name !== "login") window.location.hash = "#/login";
  }, [authed, route.name]);

  if (!authed || route.name === "login") {
    return (
      <React.Fragment>
        <LoginPage onLogin={login} />
        <AdmToasts toasts={toasts.toasts} />
      </React.Fragment>
    );
  }

  const currentProduct = (route.name === "product" || route.name === "product-edit")
    ? products.find((p) => p.pid === route.id) : null;

  const title = ROUTE_TITLE[route.name] || "Admin";

  const handleProductSave = async (form, isEdit) => {
    try {
      const payload = {
        name: form.name, shortDesc: form.shortDesc, fullDesc: form.fullDesc,
        category: form.category, catId: form.catId, img: form.img,
        price: +form.price || 0, disc: form.disc ? +form.disc : null,
        discountLabel: form.discountLabel, stock: +form.stock || 0,
        lowAlert: +form.lowAlert || 10, status: form.status,
        visible: form.visible, tags: form.tags, variants: form.variants,
      };
      if (isEdit) {
        await window.API.products.update(form.pid, payload);
        toasts.push(`Updated "${form.name}"`);
      } else {
        await window.API.products.create({ ...payload, pid: form.pid });
        toasts.push(`Published "${form.name || "new product"}"`);
      }
      await refreshProducts();
      nav("products");
    } catch (e) { toasts.push("Save failed: " + e.message); }
  };

  const handleCategorySave = async (form) => {
    try {
      await window.API.categories.create({
        cid: form.cid, name: form.name, slug: form.slug, desc: form.desc,
        showNav: form.showNav, showHome: form.showHome, order: +form.order || 1,
        status: form.status,
      });
      toasts.push(`Saved category "${form.name || "Untitled"}"`);
      await refreshCategories();
      nav("categories");
    } catch (e) { toasts.push("Save failed: " + e.message); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      if (confirmDel.type === "product") {
        await window.API.products.remove(confirmDel.target.pid);
        toasts.push(`Deleted "${confirmDel.target.name}"`);
        await refreshProducts();
      } else {
        await window.API.categories.remove(confirmDel.target.cid);
        toasts.push(`Deleted "${confirmDel.target.name}"`);
        await refreshCategories();
      }
      setConfirmDel(null);
    } catch (e) {
      toasts.push("Delete failed: " + e.message);
      setConfirmDel(null);
    }
  };

  return (
    <React.Fragment>
      <div className={`adm-shell${mobileNav ? " is-mobile-open" : ""}`}>
        <AdmSidebar route={route.name} settingsTab={route.tab}
                    onNav={nav} onLogout={logout}
                    onMobileClose={() => setMobileNav(false)} />

        <main className="adm-main">
          <AdmHeader title={title} onMenu={() => setMobileNav(true)} />
          <section className="adm-content" id="main">
            {loading && products.length === 0 && (
              <div style={{ padding: 40, textAlign: "center", color: "var(--ac-muted)" }}>Loading…</div>
            )}

            {route.name === "products" && !loading && (
              <ProductsPage products={products} onNav={nav}
                            onDelete={(p) => setConfirmDel({ type: "product", target: p })} />
            )}

            {route.name === "product-add" && (
              <ProductForm mode="add"
                           onSave={(f) => handleProductSave(f, false)}
                           onBack={() => nav("products")} />
            )}

            {route.name === "product-edit" && currentProduct && (
              <ProductForm mode="edit" product={currentProduct}
                           onSave={(f) => handleProductSave(f, true)}
                           onDelete={(p) => setConfirmDel({ type: "product", target: p })}
                           onBack={() => nav("products")} />
            )}

            {route.name === "product" && currentProduct && (
              <ProductDetailPage product={currentProduct} onBack={() => nav("products")} />
            )}

            {route.name === "categories" && (
              <CategoriesPage categories={categories} onNav={nav}
                              onDelete={(c) => setConfirmDel({ type: "category", target: c })} />
            )}

            {route.name === "category-add" && (
              <AddCategoryPage onSave={handleCategorySave} onCancel={() => nav("categories")} />
            )}

            {route.name === "transactions" && (
              <TransactionsPage txns={txns} onView={(t) => setViewTxn(t)} onRefresh={refreshTxns} />
            )}

            {route.name === "settings" && route.tab === "account" && <SettingsAccount toast={toasts.push} />}
            {route.name === "settings" && route.tab === "store" && <SettingsStore toast={toasts.push} />}
            {route.name === "settings" && route.tab === "notifications" && <SettingsNotifications toast={toasts.push} />}
          </section>
        </main>
      </div>

      <AdmConfirmModal
        open={!!confirmDel}
        title={confirmDel?.type === "category" ? "Delete Category?" : "Delete Product?"}
        message={confirmDel?.type === "category"
          ? "This will permanently remove this category. Categories with products cannot be deleted."
          : "This will permanently remove this product from your catalogue. This cannot be undone."}
        target={confirmDel?.target?.name}
        onClose={() => setConfirmDel(null)}
        onConfirm={handleDelete}
      />

      <TransactionModal txn={viewTxn} onClose={() => setViewTxn(null)} />
      <AdmToasts toasts={toasts.toasts} />
    </React.Fragment>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AdminApp />);
