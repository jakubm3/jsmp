import React from "react";
import { Admin } from "../api";
import { Link } from "react-router-dom";

export default function AdminPage() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<any[]>([]);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  const load = async () => {
    setErr(null);
    try {
      const [u, p, o] = await Promise.all([Admin.users(), Admin.products(), Admin.orders()]);
      setUsers(u);
      setProducts(p);
      setOrders(o);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  React.useEffect(() => { load(); }, []);

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
                  <td>{u.role}</td>
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
              <tr><th>ID</th><th>User</th><th>Status</th><th>Suma</th><th>Data</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.user?.email}</td>
                  <td>{o.status}</td>
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
