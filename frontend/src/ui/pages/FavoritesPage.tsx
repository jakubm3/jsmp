import React from "react";
import { Favorites } from "../api";
import { Link } from "react-router-dom";

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

  const remove = async (id: string) => {
    try {
      await Favorites.toggle(id);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row space wrap">
        <div>
          <div className="h1">Ulubione</div>
          <p className="sub">Twoje zapisane oferty.</p>
        </div>
        <Link className="btn" to="/">← Wróć</Link>
      </div>

      {err && <div className="notice noticeErr">{err}</div>}

      {items.length === 0 ? (
        <div className="notice">Brak ulubionych produktów.</div>
      ) : (
        <div className="grid gridProducts">
          {items.map((p) => (
            <div key={p.id} className="card productCard">
              <img
                className="productImg"
                src={p.images?.[0]?.url ?? "https://picsum.photos/seed/na/640/480"}
                alt=""
                loading="lazy"
              />
              <div className="cardPad">
                <Link to={`/p/${p.id}`} className="productTitle">{p.title}</Link>
                <div className="price" style={{ marginTop: 4 }}>{Number(p.price).toFixed(2)} zł</div>
                
                <button 
                  className="btn btnDanger" 
                  style={{ marginTop: 10, width: "100%" }}
                  onClick={() => remove(p.id)}
                >
                  Usuń z ulubionych
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}