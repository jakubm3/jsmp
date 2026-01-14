import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Auth } from "../api";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      await Auth.register(email, password, name || undefined);
      window.dispatchEvent(new Event("auth-changed"));
      nav("/", { replace: true });
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid" style={{ gap: 14, maxWidth: 520, margin: "0 auto" }}>
      <div className="card cardPad">
        <div className="h1">Rejestracja</div>
        <p className="sub">Załóż konto w wersji demo marketplace.</p>
      </div>

      {err && <div className="notice noticeErr">{err}</div>}

      <div className="card cardPad">
        <div className="grid" style={{ gap: 10 }}>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Imię (opcjonalnie)" />
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" type="password" />
          <button className="btn btnPrimary" onClick={submit} disabled={busy}>
            {busy ? "Tworzenie..." : "Zarejestruj"}
          </button>

          <div className="muted" style={{ fontSize: 13 }}>
            Masz konto? <Link to="/login" style={{ textDecoration: "underline" }}>Zaloguj się</Link>
          </div>
        </div>
      </div>
    </div>
  );
}