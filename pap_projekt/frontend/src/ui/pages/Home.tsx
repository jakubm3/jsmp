import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Categories, Products, Auth } from "../api";

export default function Home() {
  const [cats, setCats] = React.useState<any[]>([]);
  const [items, setItems] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [sort, setSort] = React.useState("newest");
  const [err, setErr] = React.useState<string | null>(null);

  const loc = useLocation();
  const u = Auth.me();

  const load = async () => {
    setErr(null);
    try {
      const c = await Categories.list().catch(() => []);
      setCats(c);
      const p = await Products.list({
        search: search || undefined,
        categoryId: categoryId || undefined,
        sort,
      });
      setItems(p);
    } catch (e: any) {
      console.error(e);
      setErr(e.message);
    }
  };

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc.key]);

  React.useEffect(() => {
    const onChanged = () => load();
    window.addEventListener("products-changed", onChanged);
    return () => window.removeEventListener("products-changed", onChanged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, sort]);

  return (
    <div>
      <div className="card cardPad" style={{ marginBottom: 14 }}>
        <div className="row space wrap">
          <div>
            <div className="h1">Oferty</div>
            <p className="sub">
              Przeglądaj ogłoszenia, filtruj po kategorii i sortuj po cenie.
            </p>
          </div>
          <div className="badge">
            {u ? "Zalogowany" : "Gość"} • {items.length} ofert
          </div>
        </div>
      </div>

      <div className="card cardPad" style={{ marginBottom: 14 }}>
        <div className="toolbar">
          <input className="input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Szukaj..." />
          <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Wszystkie kategorie</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Najnowsze</option>
            <option value="priceAsc">Cena rosnąco</option>
            <option value="priceDesc">Cena malejąco</option>
          </select>
          <button className="btn" onClick={load}>Filtruj</button>
        </div>

        {err && <div className="notice noticeErr" style={{ marginTop: 12 }}>{err}</div>}
      </div>

      <div className="grid gridProducts">
        {items.map((p) => (
          <Link key={p.id} to={`/p/${p.id}`} className="card productCard">
            <img
              className="productImg"
              src={p.images?.[0]?.url ?? "https://picsum.photos/seed/na/640/480"}
              alt=""
              loading="lazy"
            />
            <div className="cardPad">
              <div className="productTitle">{p.title}</div>
              <div className="muted" style={{ fontSize: 13, lineHeight: 1.35 }}>
                {p.category?.name ?? "Bez kategorii"} • {p.seller?.name ?? p.seller?.email ?? "Sprzedawca"}
              </div>

              <div className="kv">
                <div className="price">{Number(p.price).toFixed(2)} zł</div>
                <span className="badge">Zobacz</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {items.length === 0 && !err && (
        <div className="notice" style={{ marginTop: 14 }}>
          Brak ofert do wyświetlenia (spróbuj wyczyścić filtry).
        </div>
      )}
    </div>
  );
}
