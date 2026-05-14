/* eslint-disable */
// SSS Food World — Admin chrome (sidebar, shell, modals)

function AdmBrand() {
  return (
    <div className="adm-brand">
      <img src="/assets/sss-logo-v3.png" alt="SSS Food World" className="adm-brand-img" />
      <span className="adm-brand-pill">ADMIN</span>
    </div>
  );
}

function AdmSidebar({ route, settingsTab, onNav, onLogout, onMobileClose }) {
  const nav = [
    {
      group: "Catalogue",
      items: [
        { id: "products",     label: "All Products",        icon: "box",     match: ["products", "product"] },
        { id: "product-add",  label: "Add Product",         icon: "plus-c",  match: ["product-add"] },
        { id: "categories",   label: "Categories",          icon: "grid",    match: ["categories", "category-add"] },
      ],
    },
    {
      group: "Orders",
      items: [
        { id: "transactions", label: "Transaction History", icon: "receipt", match: ["transactions"] },
      ],
    },
    {
      group: "Settings",
      items: [
        { id: "settings",     label: "Admin Settings",      icon: "cog",     match: ["settings"], expandable: true },
      ],
    },
  ];

  const settingsSub = [
    { id: "account",       label: "Account Information", icon: "cog" },
    { id: "store",         label: "Store Information",   icon: "receipt" },
    { id: "notifications", label: "Notifications",       icon: "receipt" },
  ];

  return (
    <aside className="adm-sidebar" role="navigation" aria-label="Admin">
      <button className="adm-sidebar-close" onClick={onMobileClose} aria-label="Close menu">
        <AIcon name="close" />
      </button>
      <AdmBrand />
      <div className="adm-nav">
        {nav.map((sec) => (
          <div className="adm-nav-section" key={sec.group}>
            <div className="adm-nav-label">{sec.group}</div>
            {sec.items.map((it) => {
              const active = it.match.includes(route);
              return (
                <React.Fragment key={it.id}>
                  <a className={`adm-nav-link${active ? " is-active" : ""}`}
                     href={`#/${it.id}`}
                     onClick={(e) => { e.preventDefault(); onNav(it.id === "settings" ? "settings" : it.id, it.id === "settings" ? "account" : null); }}>
                    <AIcon name={it.icon} />
                    {it.label}
                  </a>
                  {it.id === "settings" && active && (
                    <div className="adm-nav-sub">
                      {settingsSub.map((s) => (
                        <a key={s.id}
                           className={`adm-nav-link${settingsTab === s.id ? " is-active" : ""}`}
                           href={`#/settings/${s.id}`}
                           onClick={(e) => { e.preventDefault(); onNav("settings", s.id); }}>
                          <AIcon name={s.icon} size={15} />
                          {s.label}
                        </a>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        ))}
      </div>
      <div className="adm-user">
        <span className="adm-user-avatar" />
        <span className="adm-user-name">Admin User</span>
        <button className="adm-user-out" aria-label="Sign out" onClick={onLogout}>
          <AIcon name="logout" />
        </button>
      </div>
    </aside>
  );
}

function AdmHeader({ title, onMenu }) {
  return (
    <header className="adm-header" role="banner">
      <button className="adm-hamburger" aria-label="Open menu" onClick={onMenu}>
        <AIcon name="menu" />
      </button>
      <h1>{title}</h1>
    </header>
  );
}

function AdmConfirmModal({ open, title, message, target, onClose, onConfirm, confirmLabel = "Delete", danger = true }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="amodal-backdrop" onClick={onClose}>
      <div className="amodal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="amodal-confirm">
          <div className="ico"><AIcon name="trash" size={22} /></div>
          <h3>{title}</h3>
          <p>{message}</p>
          {target && <div className="target">{target}</div>}
          <div className="actions">
            <button className="abtn abtn--neutral" onClick={onClose}>Cancel</button>
            <button className={`abtn ${danger ? "abtn--danger-solid" : "abtn--primary"}`} onClick={onConfirm}>{confirmLabel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdmToggle({ checked, onChange }) {
  return (
    <label className="atoggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange && onChange(e.target.checked)} />
      <span className="atoggle-slider" />
    </label>
  );
}

function AdmToasts({ toasts }) {
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className="toast" role="status">
          <AIcon name="check-c" size={18} />
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { AdmSidebar, AdmHeader, AdmConfirmModal, AdmToggle, AdmToasts });
