import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Auth } from "../api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("user@local.test");
  const [password, setPassword] = React.useState("user123");
  const [err, setErr] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async () => {
    setErr(null);
    setBusy(true);
    try {
      await Auth.login(email, password);
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
        <div className="h1">Logowanie</div>
        <p className="sub">Zaloguj się, aby dodać do koszyka i ulubionych.</p>
      </div>

      {err && <div className="notice noticeErr">{err}</div>}

      <div className="card cardPad">
        <div className="grid" style={{ gap: 10 }}>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Hasło" type="password" />
          <button className="btn btnPrimary" onClick={submit} disabled={busy}>
            {busy ? "Logowanie..." : "Zaloguj"}
          </button>

          <div className="muted" style={{ fontSize: 13 }}>
            Nie masz konta? <Link to="/register" style={{ textDecoration: "underline" }}>Zarejestruj się</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
