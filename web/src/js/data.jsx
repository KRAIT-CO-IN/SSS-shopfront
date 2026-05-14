/* eslint-disable */
// SSS Food World — data + state store (API-backed)

const CATEGORIES = [{ id: "all", label: "All", accent: "#C4121F" }];
const COLLECTION = [
  { id: "mango",      label: "Mango",            color: "#F4B33A" },
  { id: "podi",       label: "Podi",             color: "#7A3E2A" },
  { id: "jeedipappu", label: "Jeedipappu Pakam", color: "#E5C16B" },
  { id: "cashew",     label: "Cashew Nuts",      color: "#E8D9B8" },
  { id: "boondi",     label: "Boondi Laadu",     color: "#E6B156" },
  { id: "ghee",       label: "Ghee Mysorepak",   color: "#D9A05B" },
];
const PRODUCTS = [];
const TOP_BAR_LINES = [
  "Free Shipping On Artisanal Orders Over ₹999",
  "Hand-packed in small batches • Made in India",
  "100% Natural • Zero Preservatives • Stone-ground",
];

const CAT_COLORS = {
  pickles: "#BB0013", powders: "#D97757", pastes: "#7A3E2A",
  chutneys: "#2A7A4B", snacks: "#E6B800", "gift-packs": "#9C2F2F",
};

function adaptProduct(p) {
  const variants = Array.isArray(p.variants) ? p.variants : [];
  return {
    id: p.pid, pid: p.pid, productId: p.id,
    name: p.name,
    category: p.category?.slug || "all",
    img: p.img || "/assets/product-pickle.jpg",
    desc: p.shortDesc || "",
    longDesc: p.fullDesc || p.shortDesc || "",
    weights: variants.length ? variants.map((v) => ({
      w: v.w,
      price: v.disc ?? v.price ?? p.price,
      mrp: v.price ?? p.price,
    })) : [{ w: "1pack", price: p.disc ?? p.price, mrp: p.price }],
    tags: p.tags || [],
    rating: 4.7, reviews: Math.floor(50 + Math.random() * 150),
    isNew: false, ingredients: [], howTo: [],
  };
}

async function hydrateCatalog() {
  try {
    const [cats, prods] = await Promise.all([
      window.API.categories.list(),
      window.API.products.list({ take: 200 }),
    ]);
    CATEGORIES.length = 1;
    for (const c of (cats.items || [])) {
      if (c.status !== "Published") continue;
      CATEGORIES.push({ id: c.slug, label: c.name, accent: CAT_COLORS[c.slug] || "#7A3E2A" });
    }
    PRODUCTS.length = 0;
    for (const p of (prods.items || [])) {
      if (p.status === "Out of Stock") continue;
      PRODUCTS.push(adaptProduct(p));
    }
    window.dispatchEvent(new CustomEvent("catalog:ready"));
    return true;
  } catch (e) {
    console.warn("[catalog] hydrate failed", e);
    return false;
  }
}

function useCatalog() {
  const [ready, setReady] = React.useState(PRODUCTS.length > 0);
  React.useEffect(() => {
    let mounted = true;
    hydrateCatalog().then(() => { if (mounted) setReady(true); });
    const onReady = () => mounted && setReady((r) => !r ? true : r + 0.0001);
    window.addEventListener("catalog:ready", onReady);
    return () => { mounted = false; window.removeEventListener("catalog:ready", onReady); };
  }, []);
  return { ready, products: PRODUCTS, categories: CATEGORIES };
}

const CART_KEY = "sss-cart-v1";
function loadCart() { try { const r = localStorage.getItem(CART_KEY); return r ? JSON.parse(r) : []; } catch (e) { return []; } }
function saveCart(items) { try { localStorage.setItem(CART_KEY, JSON.stringify(items)); } catch (e) {} }

function useCart() {
  const [items, setItems] = React.useState(() => loadCart());
  React.useEffect(() => { saveCart(items); }, [items]);
  React.useEffect(() => {
    const onStorage = (e) => { if (e.key === CART_KEY) setItems(loadCart()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const addItem = (product, weightSpec, qty = 1) => {
    setItems((prev) => {
      const key = `${product.id}::${weightSpec.w}`;
      const found = prev.find((x) => x.key === key);
      if (found) return prev.map((x) => x.key === key ? { ...x, qty: x.qty + qty } : x);
      return [...prev, {
        key, id: product.id, productId: product.productId,
        name: product.name, img: product.img,
        weight: weightSpec.w, price: weightSpec.price, mrp: weightSpec.mrp, qty,
      }];
    });
  };
  const setQty = (key, qty) => {
    if (qty <= 0) return removeItem(key);
    setItems((prev) => prev.map((x) => x.key === key ? { ...x, qty } : x));
  };
  const removeItem = (key) => setItems((prev) => prev.filter((x) => x.key !== key));
  const clear = () => setItems([]);
  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
  const itemCount = items.reduce((s, x) => s + x.qty, 0);
  return { items, addItem, setQty, removeItem, clear, subtotal, itemCount };
}

function useToasts() {
  const [toasts, setToasts] = React.useState([]);
  const idRef = React.useRef(0);
  const push = (message, type = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  };
  return { toasts, push };
}

function Icon({ name, size = 18, stroke = 1.7, ...props }) {
  const s = size;
  const common = {
    width: s, height: s, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor",
    strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": "true",
    ...props,
  };
  switch (name) {
    case "search":    return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
    case "cart":      return <svg {...common}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.4 12.5a2 2 0 0 0 2 1.5h8.4a2 2 0 0 0 2-1.5L21 8H6"/></svg>;
    case "user":      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>;
    case "menu":      return <svg {...common}><path d="M3 6h18M3 12h18M3 18h18"/></svg>;
    case "close":     return <svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case "minus":     return <svg {...common}><path d="M5 12h14"/></svg>;
    case "plus":      return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "chev-down": return <svg {...common}><path d="M6 9l6 6 6-6"/></svg>;
    case "chev-left": return <svg {...common}><path d="M15 18l-6-6 6-6"/></svg>;
    case "chev-right":return <svg {...common}><path d="M9 18l6-6-6-6"/></svg>;
    case "trash":     return <svg {...common}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14"/></svg>;
    case "truck":     return <svg {...common}><path d="M1 7h13v10H1zM14 10h4l3 3v4h-7"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>;
    case "shield":    return <svg {...common}><path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>;
    case "refresh":   return <svg {...common}><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></svg>;
    case "award":     return <svg {...common}><circle cx="12" cy="9" r="6"/><path d="M8.2 13.6L7 22l5-3 5 3-1.2-8.4"/></svg>;
    case "leaf":      return <svg {...common}><path d="M11 20A7 7 0 0 1 4 13c0-7 9-10 16-10-1 7-3 16-9 17z"/><path d="M2 22l9-9"/></svg>;
    case "star":      return <svg {...common} fill="currentColor"><path d="M12 2l3.1 6.5L22 9.7l-5 4.7 1.2 6.8L12 17.8 5.8 21.2 7 14.4 2 9.7l6.9-1.2z"/></svg>;
    case "star-o":    return <svg {...common}><path d="M12 2l3.1 6.5L22 9.7l-5 4.7 1.2 6.8L12 17.8 5.8 21.2 7 14.4 2 9.7l6.9-1.2z"/></svg>;
    case "check":     return <svg {...common}><path d="M4 12l5 5L20 6"/></svg>;
    case "lock":      return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>;
    case "bolt":      return <svg {...common}><path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="currentColor"/></svg>;
    case "instagram": return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>;
    case "globe":     return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
    case "mail":      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>;
    case "phone":     return <svg {...common}><path d="M22 16.9V21a1 1 0 0 1-1.1 1A19 19 0 0 1 2 4.1 1 1 0 0 1 3 3h4.1a1 1 0 0 1 1 .8l1 4a1 1 0 0 1-.3 1L7 10.6a16 16 0 0 0 6.4 6.4l1.7-1.7a1 1 0 0 1 1-.3l4 1a1 1 0 0 1 .9 1z"/></svg>;
    case "credit":    return <svg {...common}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
    case "bank":      return <svg {...common}><path d="M3 21h18M3 10h18M5 21V10M19 21V10M9 21V10M15 21V10M12 3l10 6H2z"/></svg>;
    case "wallet":    return <svg {...common}><path d="M3 7v12a1 1 0 0 0 1 1h17V8H4a1 1 0 0 1-1-1z"/><path d="M3 7a2 2 0 0 1 2-2h14v3"/><circle cx="17" cy="14" r="1.2" fill="currentColor"/></svg>;
    default:          return null;
  }
}

const fmt = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

Object.assign(window, {
  CATEGORIES, COLLECTION, PRODUCTS, TOP_BAR_LINES,
  useCart, useToasts, useCatalog, hydrateCatalog,
  Icon, fmt,
});
