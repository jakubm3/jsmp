import React from "react";
import { useParams, Link } from "react-router-dom";
import { Products, Cart, Favorites, Auth } from "../api";

export default function ProductPage() {
  const { id } = useParams();
  const [p, setP] = React.useState<any>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setP(await Products.get(id!));
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, [id]);

  if (err) return <div className="notice noticeErr">{err}</div>;
  if (!p) return <div className="notice">Ładowanie...</div>;

  const u = Auth.me();

  const addToCart = async () => {
    setBusy(true);
    try {
      await Cart.add(p.id, 1);
      alert("Dodano do koszyka");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleFav = async () => {
    setBusy(true);
    try {
      await Favorites.toggle(p.id);
      alert("Zmieniono ulubione");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row space wrap">
        <Link className="btn" to="/">← Wróć</Link>
        <span className="badge">{p.category?.name ?? "Bez kategorii"}</span>
      </div>

      <div className="card productCard">
        {p.images?.[0]?.url && (
          <img className="productImg" src={p.images[0].url} alt="" />
        )}
        <div className="cardPad">
          <div className="row space wrap">
            <div>
              <div className="h1" style={{ margin: 0 }}>{p.title}</div>
              <div className="muted" style={{ marginTop: 6 }}>
                Sprzedawca: {p.seller?.name ?? p.seller?.email ?? "—"}
              </div>
            </div>
            <div className="price">{Number(p.price).toFixed(2)} zł</div>
          </div>

          <div className="notice" style={{ marginTop: 12 }}>
            {p.description}
          </div>

          {u ? (
            <div className="row wrap" style={{ marginTop: 12 }}>
              <button className="btn btnPrimary" onClick={addToCart} disabled={busy}>
                Do koszyka
              </button>
              <button className="btn" onClick={toggleFav} disabled={busy}>
                ❤ Ulubione
              </button>
            </div>
          ) : (
            <div className="notice" style={{ marginTop: 12 }}>
              Zaloguj się, aby dodać do koszyka i ulubionych.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}