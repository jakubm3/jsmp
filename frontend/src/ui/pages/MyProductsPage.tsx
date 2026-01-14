import React from "react";
import { Categories, Products } from "../api";
import { Link } from "react-router-dom";

export default function MyProductsPage() {
  const [cats, setCats] = React.useState<any[]>([]);
  const [items, setItems] = React.useState<any[]>([]);
  const [err, setErr] = React.useState<string | null>(null);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<{
    title: string; description: string; price: string; categoryId: string; imageUrl: string;
  }>({ title: "", description: "", price: "", categoryId: "", imageUrl: "" });

  const load = async () => {
    setErr(null);
    try {
      const [c, mine] = await Promise.all([Categories.list(), Products.mine()]);
      setCats(c);
      setItems(mine);
    } catch (e: any) {
      setErr(e.message);
    }
  };

  React.useEffect(() => { load(); }, []);

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      title: p.title ?? "",
      description: p.description ?? "",
      price: String(p.price ?? ""),
      categoryId: p.categoryId ?? "",
      imageUrl: p.images?.[0]?.url ?? "",
    });
  };

  const save = async () => {
    if (!editingId) return;
    setErr(null);

    const priceNum = Number(form.price);
    if (!form.title.trim()) return setErr("Tytuł nie może być pusty.");
    if (!form.description.trim()) return setErr("Opis nie może być pusty.");
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setErr("Cena musi być > 0.");

    try {
      await Products.update(editingId, {
        title: form.title,
        description: form.description,
        price: priceNum,
        categoryId: form.categoryId || null,
        imageUrls: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
      });
      setEditingId(null);
      await load();
      window.dispatchEvent(new Event("products-changed"));
      alert("Zapisano ✅");
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Usunąć ofertę? (zostanie zdezaktywowana)")) return;
    try {
      await Products.remove(id);
      await load();
      window.dispatchEvent(new Event("products-changed"));
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="grid" style={{ gap: 14 }}>
      <div className="row space wrap">
        <div>
          <div className="h1">Moje oferty</div>
          <p className="sub">Edytuj lub dezaktywuj swoje ogłoszenia.</p>
        </div>
        <Link className="btn btnPrimary" to="/sell">+ Wystaw nową</Link>
      </div>

      {err && <div className="notice noticeErr">{err}</div>}

      {items.length === 0 ? (
        <div className="notice">Nie masz jeszcze żadnych ofert. Kliknij „Wystaw nową”.</div>
      ) : (
        <div className="grid">
          {items.map((p) => (
            <div key={p.id} className="card cardPad">
              <div className="row space wrap">
                <div>
                  <div className="productTitle" style={{ margin: 0 }}>{p.title}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    Aktywna: <b style={{ color: "var(--text)" }}>{String(p.isActive)}</b> • ID: {p.id}
                  </div>
                </div>
                <div className="row wrap">
                  <button className="btn" onClick={() => startEdit(p)}>Edytuj</button>
                  <button className="btn btnDanger" onClick={() => remove(p.id)}>Usuń</button>
                </div>
              </div>

              {p.images?.[0]?.url && (
                <img
                  src={p.images[0].url}
                  alt=""
                  style={{ marginTop: 12, width: "100%", maxWidth: 520, borderRadius: 14, border: "1px solid rgba(255,255,255,.12)" }}
                />
              )}

              <div className="row space wrap" style={{ marginTop: 12 }}>
                <div className="muted" style={{ fontSize: 13 }}>
                  {p.category?.name ?? "Bez kategorii"}
                </div>
                <div className="price">{Number(p.price).toFixed(2)} zł</div>
              </div>

              <div className="notice" style={{ marginTop: 12 }}>
                {p.description}
              </div>

              {editingId === p.id && (
                <div className="card" style={{ marginTop: 12 }}>
                  <div className="cardPad">
                    <div className="row space wrap" style={{ marginBottom: 10 }}>
                      <div style={{ fontWeight: 900 }}>Edycja oferty</div>
                      <button className="btn" onClick={() => setEditingId(null)}>Zamknij</button>
                    </div>

                    <div className="grid" style={{ gap: 10 }}>
                      <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tytuł" />
                      <textarea className="textarea" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Opis" rows={5} />
                      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <input className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Cena" />
                        <select className="select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                          <option value="">(opcjonalnie) Kategoria</option>
                          {cats.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <input className="input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="URL zdjęcia (opcjonalnie)" />

                      <div className="row wrap">
                        <button className="btn btnPrimary" onClick={save}>Zapisz</button>
                        <button className="btn" onClick={() => setEditingId(null)}>Anuluj</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}