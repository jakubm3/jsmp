import React from "react";
import { Link } from "react-router-dom";
import { Profile, Auth } from "../api";

export default function ProfilePage() {
  const [user, setUser] = React.useState<any>(null);
  const [name, setName] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState<string | null>(null);

  const load = async () => {
    setErr(null);
    try {
      const u = await Profile.me();
      setUser(u);
      setName(u.name ?? "");
    } catch (e: any) {
      setErr(e.message);
    }
  };

  React.useEffect(() => { load(); }, []);

  const save = async () => {
    setErr(null);
    setOk(null);
    try {
      const updated = await Profile.update({ name: name.trim() || undefined });
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("auth-changed"));
      setOk("Profil zaktualizowany ✅");
    } catch (e: any) {
      setErr(e.message);
    }
  };

  return (
    <div className="grid" style={{ gap: 14, maxWidth: 720 }}>
      <div className="row space wrap">
        <div>
          <div className="h1">Mój profil</div>
          <p className="sub">Dane konta i edycja podstawowych informacji.</p>
        </div>
        <Link className="btn" to="/">← Wróć</Link>
      </div>

      {err && <div className="notice noticeErr">{err}</div>}
      {ok && <div className="notice noticeOk">{ok}</div>}

      {user && (
        <div className="card cardPad">
          <div className="grid" style={{ gap: 10 }}>
            <div className="row space wrap">
              <div>
                <div style={{ fontWeight: 900 }}>Adres email</div>
                <div className="muted">{user.email}</div>
              </div>
              <span className="badge">{user.role}</span>
            </div>

            <div className="row space wrap">
              <div>
                <div style={{ fontWeight: 900 }}>Status</div>
                <div className="muted">{user.isActive ? "Aktywne" : "Zablokowane"}</div>
              </div>
              <div className="muted">Od: {new Date(user.createdAt).toLocaleString()}</div>
            </div>

            <div className="grid" style={{ gap: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 700 }}>Nazwa wyświetlana</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Twoje imię / nick" />
            </div>

            <div className="row wrap">
              <button className="btn btnPrimary" onClick={save}>Zapisz</button>
              <button className="btn" onClick={() => setName(user.name ?? "")}>Reset</button>
            </div>

            <div className="notice" style={{ marginTop: 4 }}>
              Te dane są wykorzystywane w ofertach i zamówieniach. Wersja demo umożliwia edycję nazwy wyświetlanej.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
