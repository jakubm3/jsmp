import React from "react";
import { Orders } from "../api";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  const load = async () => {
    setErr(null);
    try {
      setOrders(await Orders.my());
    } catch (e: any) {
      setErr(e.message);
    }
  };

  React.useEffect(() => { load(); }, []);

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row space wrap">
        <div>
          <div className="h1">Historia zamówień</div>
          <p className="sub">Podgląd fikcyjnych zamówień złożonych przez użytkownika.</p>
        </div>
        <Link className="btn" to="/">← Wróć</Link>
      </div>

      {err && <div className="notice noticeErr">{err}</div>}

      {orders.length === 0 ? (
        <div className="notice">Brak zamówień.</div>
      ) : (
        <div className="grid">
          {orders.map((o) => (
            <div key={o.id} className="card cardPad">
              <div className="row space wrap">
                <div>
                  <div style={{ fontWeight: 950 }}>Zamówienie</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    ID: {o.id} • {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className="badge">{o.status} • {Number(o.totalPrice).toFixed(2)} zł</span>
              </div>

              <div className="notice" style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Pozycje:</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {o.items.map((it: any) => (
                    <li key={it.id}>
                      {it.product.title} — {it.quantity} szt. — {Number(it.unitPrice).toFixed(2)} zł
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
