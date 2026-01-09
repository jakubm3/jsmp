import React from "react";
import { Categories, Products } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function SellPage() {
  const nav = useNavigate();
  const [cats, setCats] = React.useState<any[]>([]);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState<string>("0");
  const [categoryId, setCategoryId] = React.useState<string>("");
  const [imageUrl, setImageUrl] = React.useState<string>("https://picsum.photos/seed/new/640/480");
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setCats(await Categories.list());
      } catch (e: any) {
        setErr(e.message);
      }
    })();
  }, []);

  const submit = async () => {
    setErr(null);
    setOk(null);

    const p = Number(price);
    if (!title.trim()) return setErr("Podaj tytuł.");
    if (!description.trim()) return setErr("Podaj opis.");
    if (!Number.isFinite(p) || p <= 0) return setErr("Cena musi być > 0.");

    setBusy(true);
    try {
      await Products.create({
        title,
        description,
        price: p,
        categoryId: categoryId || null,
        imageUrls: imageUrl.trim() ? [imageUrl.trim()] : [],
      });
      setOk("Oferta dodana ✅");
      window.dispatchEvent(new Event("products-changed"));
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 14, maxWidth: 820 }}>
      <div className="row space wrap">
        <div>
          <div className="h1">Wystaw ofertę</div>
          <p className="sub">Dodaj ogłoszenie do marketplace (URL zdjęcia w wersji demo).</p>
        </div>
        <Link className="btn" to="/">← Wróć</Link>
      </div>

      {err && <div className="notice noticeErr">{err}</div>}
      {ok && <div className="notice noticeOk">{ok}</div>}

      <div className="card cardPad">
        <div className="grid" style={{ gap: 10 }}>
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tytuł" />
          <textarea
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opis"
            rows={6}
          />
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input className="input" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Cena (np. 199.99)" />
            <select className="select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">(opcjonalnie) Wybierz kategorię</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <input
            className="input"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="URL zdjęcia (opcjonalnie)"
          />

          <div className="row wrap">
            <button className="btn btnPrimary" onClick={submit} disabled={busy}>
              {busy ? "Dodawanie..." : "Dodaj ofertę"}
            </button>
            <span className="muted" style={{ fontSize: 13 }}>
              Zdjęcie: URL (np. picsum). W realnej aplikacji byłby upload.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}