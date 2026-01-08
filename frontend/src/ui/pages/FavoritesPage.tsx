import React from "react";
import { Link } from "react-router-dom";
import { Favorites } from "../api";

export default function FavoritesPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  const load = async () => {
    setErr(null);
    try {
      setItems(await Favorites.list());
    } catch (e: any) {
      setErr(e.message);
    }
  };

  React.useEffect(() => { load(); }, []);

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="card cardPad">
        <div className="h1">Ulubione</div>
        <p className="sub">Lista produktów oznaczonych jako ulubione.</p>
      </div>

      {err && <div className="notice noticeErr">{err}</div>}

      {items.length === 0 ? (
        <div className="notice">Brak ulubionych.</div>
      ) : (
        <div className="grid gridProducts">
          {items.map((p) => (
            <Link key={p.id} to={`/p/${p.id}`} className="card productCard">
              <img
                className="productImg"
                src={p.images?.[0]?.url ?? "https://picsum.photos/seed/fav/640/480"}
                alt=""
                loading="lazy"
              />
              <div className="cardPad">
                <div className="productTitle">{p.title}</div>
                <div className="kv">
                  <div className="price">{Number(p.price).toFixed(2)} zł</div>
                  <span className="badge">Zobacz</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
