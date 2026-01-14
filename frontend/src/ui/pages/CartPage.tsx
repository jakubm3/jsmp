import React from "react";
import { Cart } from "../api";
import { Link } from "react-router-dom";

const paymentMethods = ["CARD", "BLIK", "TRANSFER"] as const;
type PaymentMethod = (typeof paymentMethods)[number];
const isPaymentMethod = (val: string): val is PaymentMethod => paymentMethods.includes(val as PaymentMethod);
const paymentLabels: Record<PaymentMethod, string> = {
  CARD: "Karta",
  BLIK: "BLIK",
  TRANSFER: "Przelew",
};

export default function CartPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("CARD");

  const load = async () => {
    setErr(null);
    try {
      setItems(await Cart.get());
    } catch (e: any) {
      setErr(e.message);
    }
  };

  React.useEffect(() => { load(); }, []);

  const total = items.reduce((acc, it) => acc + Number(it.product.price) * it.quantity, 0);

  const checkout = async () => {
    setBusy(true);
    try {
      await Cart.checkout(paymentMethod);
      alert("Zamówienie złożone (fikcyjna płatność: PAID).");
      await load();
      window.dispatchEvent(new Event("products-changed"));
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row space wrap">
        <div>
          <div className="h1">Koszyk</div>
          <p className="sub">Dodawaj produkty i złóż fikcyjne zamówienie (bez płatności).</p>
        </div>
        <Link className="btn" to="/">← Wróć do ofert</Link>
      </div>

      {err && <div className="notice noticeErr">{err}</div>}

      {items.length === 0 ? (
        <div className="notice">Pusty koszyk.</div>
      ) : (
        <div className="grid" style={{ gap: 12 }}>
          {items.map((it) => (
            <div key={it.id} className="card cardPad">
              <div className="row space wrap">
                <div>
                  <div style={{ fontWeight: 900 }}>{it.product.title}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    Ilość: <b style={{ color: "var(--text)" }}>{it.quantity}</b>
                  </div>
                </div>
                <div className="row wrap">
                  <div className="price">{Number(it.product.price).toFixed(2)} zł</div>
                  <button
                    className="btn btnDanger"
                    onClick={async () => { await Cart.remove(it.productId); await load(); }}
                  >
                    Usuń
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="card cardPad">
            <div className="row space wrap">
              <div className="muted">Suma</div>
              <div className="price">{total.toFixed(2)} zł</div>
            </div>
            <div className="grid" style={{ gap: 6, marginTop: 10 }}>
              <label className="muted" style={{ fontSize: 14 }}>
                Wybierz metodę płatności:
              </label>
              <select
                className="select"
                value={paymentMethod}
                onChange={(e) => {
                  const val = e.target.value;
                  if (isPaymentMethod(val)) setPaymentMethod(val);
                }}
                disabled={busy}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {paymentLabels[method]}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btnPrimary" onClick={checkout} style={{ marginTop: 12 }} disabled={busy}>
              {busy ? "Przetwarzanie..." : "Kup teraz"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}