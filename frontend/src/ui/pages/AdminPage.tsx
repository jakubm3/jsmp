import React from "react";
import { Admin, Categories } from "../api";
import { Link } from "react-router-dom";

export default function AdminPage() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [catForm, setCatForm] = React.useState<{ id: string | null; name: string; parentId: string }>({ id: null, name: "", parentId: "" });
  const [err, setErr] = React.useState<string | null>(null);

  const load = async () => {
    setErr(null);
    try {
      const [u, p, o, c] = await Promise.all([Admin.users(), Admin.products(), Admin.orders(), Categories.list()]);
      setUsers(u);
      setProducts(p);
      setOrders(o);
      setCategories(c);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  React.useEffect(() => { load(); }, []);

  const saveCategory = async () => {
    if (!catForm.name.trim()) return setErr("Nazwa kategorii nie może być pusta.");
    try {
      if (catForm.id) {
        await Categories.update(catForm.id, { name: catForm.name.trim(), parentId: catForm.parentId || null });
      } else {
        await Categories.create({ name: catForm.name.trim(), parentId: catForm.parentId || null });
      }
      setCatForm({ id: null, name: "", parentId: "" });
      await load();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const editCategory = (c: any) => setCatForm({ id: c.id, name: c.name, parentId: c.parentId ?? "" });

  const removeCategory = async (id: string) => {
    if (!confirm("Usunąć kategorię?")) return;
    try {
      await Categories.remove(id);
      await load();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const changeRole = async (id: string, role: "USER" | "ADMIN") => {
    try {
      await Admin.setRole(id, role);
      await load();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row space wrap">
        <div>
          <div className="h1">Panel admina</div>
          <p className="sub">Zarządzanie użytkownikami, ofertami i podgląd zamówień.</p>
        </div>
        <Link className="btn" to="/">← Wróć</Link>
      </div>

      {err && <div className="notice noticeErr">{err}</div>}

      <div className="card cardPad">
        <div style={{ fontWeight: 950, marginBottom: 10 }}>Użytkownicy</div>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr><th>Email</th><th>Rola</th><th>Aktywny</th><th></th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="select"
                      value={u.role}
                      onChange={(e) => {
                        const val = e.target.value === "ADMIN" ? "ADMIN" : "USER";
                        changeRole(u.id, val);
                      }}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td>{String(u.isActive)}</td>
                  <td>
                    <button className="btn" onClick={async () => { await Admin.toggleUser(u.id); await load(); }}>
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card cardPad">
        <div style={{ fontWeight: 950, marginBottom: 10 }}>Kategorie</div>

        <div className="grid" style={{ gap: 10, marginBottom: 12 }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input className="input" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Nazwa kategorii" />
            <select className="select" value={catForm.parentId} onChange={(e) => setCatForm({ ...catForm, parentId: e.target.value })}>
              <option value="">(brak nadrzędnej)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="row wrap">
            <button className="btn btnPrimary" onClick={saveCategory}>{catForm.id ? "Zapisz edycję" : "Dodaj kategorię"}</button>
            {catForm.id && <button className="btn" onClick={() => setCatForm({ id: null, name: "", parentId: "" })}>Anuluj</button>}
          </div>
        </div>

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr><th>Nazwa</th><th>Nadrzędna</th><th>ID</th><th></th></tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{categories.find((p: any) => p.id === c.parentId)?.name ?? "—"}</td>
                  <td>{c.id}</td>
                  <td className="row wrap">
                    <button className="btn" onClick={() => editCategory(c)}>Edytuj</button>
                    <button className="btn btnDanger" onClick={() => removeCategory(c.id)}>Usuń</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card cardPad">
        <div style={{ fontWeight: 950, marginBottom: 10 }}>Oferty</div>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr><th>Tytuł</th><th>Cena</th><th>Aktywna</th><th>Sprzedawca</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{Number(p.price).toFixed(2)}</td>
                  <td>{String(p.isActive)}</td>
                  <td>{p.seller?.email}</td>
                  <td>
                    <button className="btn" onClick={async () => { await Admin.toggleProduct(p.id); await load(); }}>
                      Toggle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card cardPad">
        <div style={{ fontWeight: 950, marginBottom: 10 }}>Zamówienia</div>
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr><th>ID</th><th>User</th><th>Status</th><th>Płatność</th><th>Dostawa</th><th>Suma</th><th>Data</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.user?.email}</td>
                  <td>{o.status}</td>
                  <td>{o.payment ? `${o.payment.method} • ${o.payment.status}` : "—"}</td>
                  <td>{o.shipment ? o.shipment.status : "—"}</td>
                  <td>{Number(o.totalPrice).toFixed(2)}</td>
                  <td>{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
