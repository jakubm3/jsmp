const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type User = {
  id: string;
  email: string;
  name?: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
};

function token() {
  return localStorage.getItem("token");
}

async function api(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const t = token();
  if (t) headers.set("Authorization", `Bearer ${t}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const Auth = {
  async login(email: string, password: string) {
    const data = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    // 🔥 ważne: powiadom UI w tej samej karcie
    window.dispatchEvent(new Event("auth-changed"));

    return data.user as User;
  },

  async register(email: string, password: string, name?: string) {
    const data = await api("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    window.dispatchEvent(new Event("auth-changed"));

    return data.user as User;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("auth-changed"));
  },

  me(): User | null {
    const u = localStorage.getItem("user");
    return u ? (JSON.parse(u) as User) : null;
  },
};


export const Products = {
  list(params: { search?: string; categoryId?: string; sort?: string } = {}) {
  const qs = new URLSearchParams();

  const search = (params.search ?? "").trim();
  const categoryId = (params.categoryId ?? "").trim();
  const sort = (params.sort ?? "").trim();

  if (search) qs.set("search", search);

  // kluczowe: NIE wysyłaj "all", "0", itp.
  if (categoryId && categoryId !== "all" && categoryId !== "0") {
    qs.set("categoryId", categoryId);
  }

  if (sort) qs.set("sort", sort);

  const q = qs.toString();
  return api(`/api/products${q ? `?${q}` : ""}`);
  }, 
  get(id: string) {
    return api(`/api/products/${id}`);
  },
  mine() {
    return api("/api/products/mine");
  },
  create(input: {
    title: string;
    description: string;
    price: number;
    categoryId?: string | null;
    imageUrls?: string[];
  }) {
    return api("/api/products", { method: "POST", body: JSON.stringify(input) });
  },
  update(
    id: string,
    input: Partial<{
      title: string;
      description: string;
      price: number;
      categoryId: string | null;
      imageUrls: string[];
    }>
  ) {
    return api(`/api/products/${id}`, { method: "PUT", body: JSON.stringify(input) });
  },
  remove(id: string) {
    return api(`/api/products/${id}`, { method: "DELETE" });
  },
};

export const Categories = {
  list() {
    return api("/api/categories");
  },
};

export const Favorites = {
  list() {
    return api("/api/favorites");
  },
  toggle(productId: string) {
    return api(`/api/favorites/${productId}/toggle`, { method: "POST", body: "{}" });
  },
};

export const Cart = {
  get() {
    return api("/api/cart");
  },
  add(productId: string, quantity: number) {
    return api("/api/cart/add", { method: "POST", body: JSON.stringify({ productId, quantity }) });
  },
  remove(productId: string) {
    return api("/api/cart/remove", { method: "POST", body: JSON.stringify({ productId }) });
  },
  checkout(paymentMethod: "CARD" | "BLIK" | "TRANSFER" = "CARD") {
    return api("/api/cart/checkout", { method: "POST", body: JSON.stringify({ paymentMethod }) });
  },
};

export const Orders = {
  my() {
    return api("/api/orders/my");
  },
};


export const Admin = {
  users() {
    return api("/api/admin/users");
  },
  toggleUser(id: string) {
    return api(`/api/admin/users/${id}/toggle-active`, { method: "POST", body: "{}" });
  },
  products() {
    return api("/api/admin/products");
  },
  toggleProduct(id: string) {
    return api(`/api/admin/products/${id}/toggle-active`, { method: "POST", body: "{}" });
  },
  orders() {
    return api("/api/orders/admin");
  },
};
