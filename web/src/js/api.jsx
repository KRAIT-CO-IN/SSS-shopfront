/* eslint-disable */
// API client — wraps fetch with auth + base URL

const BASE = (window.__API_BASE__ || "/api").replace(/\/$/, "");
const TOKEN_KEY = "sss-admin-token";

const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } };
const setToken = (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} };

async function req(path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (opts.body && typeof opts.body !== "string") {
    headers["content-type"] = "application/json";
    opts.body = JSON.stringify(opts.body);
  }
  const tok = getToken();
  if (tok && !headers.authorization) headers.authorization = `Bearer ${tok}`;

  const res = await fetch(BASE + path, { ...opts, headers });
  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json() : await res.text();
  if (!res.ok) {
    const err = new Error(body?.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return body;
}

const API = {
  auth: {
    login: (email, password) => req("/adm/login", { method: "POST", body: { email, password } }),
    me: () => req("/adm/me"),
    updateProfile: (data) => req("/adm/profile", { method: "PUT", body: data }),
    changePassword: (current, next) => req("/adm/password", { method: "PUT", body: { current, next } }),
    getToken, setToken,
    isAuthed: () => !!getToken(),
    logout: () => setToken(null),
  },
  products: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return req(`/products${q ? "?" + q : ""}`);
    },
    get: (pid) => req(`/products/${encodeURIComponent(pid)}`),
    create: (data) => req("/products", { method: "POST", body: data }),
    update: (pid, data) => req(`/products/${encodeURIComponent(pid)}`, { method: "PUT", body: data }),
    remove: (pid) => req(`/products/${encodeURIComponent(pid)}`, { method: "DELETE" }),
  },
  categories: {
    list: () => req("/categories"),
    get: (cid) => req(`/categories/${cid}`),
    create: (data) => req("/categories", { method: "POST", body: data }),
    update: (cid, data) => req(`/categories/${cid}`, { method: "PUT", body: data }),
    remove: (cid) => req(`/categories/${cid}`, { method: "DELETE" }),
  },
  orders: {
    create: (data) => req("/orders", { method: "POST", body: data }),
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return req(`/orders${q ? "?" + q : ""}`);
    },
    get: (txId) => req(`/orders/${txId}`),
    exportCsv: () => `${BASE}/orders/export.csv`,
  },
  settings: {
    get: (key) => req(`/settings/${key}`),
    update: (key, value) => req(`/settings/${key}`, { method: "PUT", body: { value } }),
  },
};

window.API = API;
