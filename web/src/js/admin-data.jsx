/* eslint-disable */
// SSS Food World — Admin portal data helpers (API-backed)

// Map raw API product → admin shape used by pages
function adaptAdminProduct(p) {
  return {
    id: p.id,
    pid: p.pid,
    name: p.name,
    category: p.category?.name || "",
    catId: p.category?.cid || "",
    categorySlug: p.category?.slug || "",
    shortDesc: p.shortDesc || "",
    fullDesc: p.fullDesc || "",
    img: p.img || "/assets/product-pickle.jpg",
    price: p.price,
    disc: p.disc,
    discountLabel: p.discountLabel || "",
    stock: p.stock,
    lowAlert: p.lowAlert,
    status: p.status,
    visible: p.visible,
    tags: p.tags || [],
    variants: p.variants || [],
  };
}

function adaptAdminCategory(c) {
  return {
    id: c.id, cid: c.cid, name: c.name, slug: c.slug,
    products: c.products ?? 0, status: c.status,
    desc: c.desc || "",
    created: new Date(c.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    img: c.img || "/assets/product-pickle.jpg",
    showNav: c.showNav, showHome: c.showHome, order: c.order,
  };
}

const HEALTH_TAGS_ALL = ["No Preservatives", "Vegan", "Gluten Free", "Organic", "Spicy", "Hand-packed"];

const NOTIF_LOG = [
  { dt: "07 May 2025 02:35", event: "New Order — ORD-1189", channel: "Email", status: "Sent" },
  { dt: "06 May 2025 11:20", event: "New Order — ORD-1188", channel: "Email", status: "Sent" },
];

function AIcon({ name, size = 18, stroke = 1.8, ...props }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: stroke,
    strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": "true", ...props,
  };
  switch (name) {
    case "box":       return <svg {...common}><path d="M21 8l-9 4-9-4 9-4 9 4z"/><path d="M21 8v8l-9 4-9-4V8"/><path d="M12 12v8"/></svg>;
    case "plus-c":    return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>;
    case "grid":      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case "receipt":   return <svg {...common}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>;
    case "cog":       return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .4 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.4 1.7 1.7 0 0 0-1.1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .4-1.9 1.7 1.7 0 0 0-1.6-1.1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.4-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.4h.1a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.4 1.9v.1a1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1.1z"/></svg>;
    case "logout":    return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>;
    case "lock":      return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "eye":       return <svg {...common}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "eye-off":   return <svg {...common}><path d="M17.9 17.9A10.7 10.7 0 0 1 12 19c-7 0-11-7-11-7a18 18 0 0 1 4.2-5.2"/><path d="M9.9 4.2A10.6 10.6 0 0 1 12 4c7 0 11 7 11 7a18 18 0 0 1-3.2 4.2"/><path d="M3 3l18 18"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>;
    case "cloud-up":  return <svg {...common}><path d="M16 16l-4-4-4 4"/><path d="M12 12v9"/><path d="M20.4 14.5A5.5 5.5 0 0 0 17 5a7 7 0 0 0-13 3 4.5 4.5 0 0 0 1 8.9"/></svg>;
    case "edit":      return <svg {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></svg>;
    case "trash":     return <svg {...common}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>;
    case "chev-l":    return <svg {...common}><path d="M15 18l-6-6 6-6"/></svg>;
    case "chev-r":    return <svg {...common}><path d="M9 18l6-6-6-6"/></svg>;
    case "chev-d":    return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>;
    case "close":     return <svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "search":    return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "cal":       return <svg {...common}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>;
    case "arrow-r":   return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case "down":      return <svg {...common}><path d="M12 4v12M6 14l6 6 6-6"/><path d="M4 20h16"/></svg>;
    case "image":     return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/></svg>;
    case "print":     return <svg {...common}><path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/></svg>;
    case "check-c":   return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>;
    case "alert-tri": return <svg {...common}><path d="M12 3l10 18H2L12 3z"/><path d="M12 10v5M12 18v0"/></svg>;
    case "archive":   return <svg {...common}><rect x="2" y="3" width="20" height="5" rx="1"/><path d="M4 8v12a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/></svg>;
    case "bell":      return <svg {...common}><path d="M18 16V11a6 6 0 1 0-12 0v5l-2 3h16z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>;
    case "user":      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>;
    case "shop":      return <svg {...common}><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9"/><path d="M3 9a3 3 0 0 0 6 0M9 9a3 3 0 0 0 6 0M15 9a3 3 0 0 0 6 0"/></svg>;
    case "bolt":      return <svg {...common}><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/></svg>;
    case "menu":      return <svg {...common}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    default: return null;
  }
}

const afmt = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

// Re-export ADMIN_CATEGORIES as live array (used by ProductForm category dropdown).
// Hydrated from API by AdminApp; pages read window.ADMIN_CATEGORIES on render.
const ADMIN_CATEGORIES = [];

Object.assign(window, {
  ADMIN_CATEGORIES, HEALTH_TAGS_ALL, NOTIF_LOG,
  AIcon, afmt, adaptAdminProduct, adaptAdminCategory,
});
