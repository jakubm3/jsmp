import React from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { Auth } from "./api";
import "./ui.css";

import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CartPage from "./pages/CartPage";
import FavoritesPage from "./pages/FavoritesPage";
import OrdersPage from "./pages/OrdersPage";
import AdminPage from "./pages/AdminPage";
import SellPage from "./pages/SellPage";
import MyProductsPage from "./pages/MyProductsPage";
import ProfilePage from "./pages/ProfilePage";

function Nav() {
  const nav = useNavigate();
  const [u, setU] = React.useState(Auth.me());

  const logout = () => {
    Auth.logout();
    window.dispatchEvent(new Event("auth-changed"));
    setU(null);
    nav("/", { replace: true });
  };

  React.useEffect(() => {
    const sync = () => setU(Auth.me());
    window.addEventListener("storage", sync);
    window.addEventListener("auth-changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("auth-changed", sync);
    };
  }, []);

  return (
    <div className="nav">
      <div className="navInner">
        <Link to="/" className="brand">
          <span className="brandDot" />
          Mini Marketplace
        </Link>

        <div className="navLinks">
          <Link to="/" className="navLink">Marketplace</Link>
          {u && (
            <>
              <Link to="/sell" className="navLink">Wystaw</Link>
              <Link to="/my-products" className="navLink">Moje oferty</Link>
            </>
          )}
          <Link to="/cart" className="navLink">Koszyk</Link>
          <Link to="/favorites" className="navLink">Ulubione</Link>
          <Link to="/orders" className="navLink">Zamówienia</Link>
          {u && <Link to="/profile" className="navLink">Profil</Link>}
          {u?.role === "ADMIN" && <Link to="/admin" className="navLink">Admin</Link>}
        </div>

        <div className="row" style={{ gap: 10 }}>
          {u ? (
            <>
              <span className="badge">{u.email} • {u.role}</span>
              <button className="btn" onClick={logout}>Wyloguj</button>
            </>
          ) : (
            <>
              <Link className="btn" to="/login">Zaloguj</Link>
              <Link className="btn btnPrimary" to="/register">Rejestracja</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  return Auth.me() ? <>{children}</> : <Navigate to="/login" replace />;
}
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const u = Auth.me();
  return u && u.role === "ADMIN" ? <>{children}</> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <>
      <Nav />
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/p/:id" element={<ProductPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/sell" element={<RequireAuth><SellPage /></RequireAuth>} />
          <Route path="/my-products" element={<RequireAuth><MyProductsPage /></RequireAuth>} />

          <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="/favorites" element={<RequireAuth><FavoritesPage /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        </Routes>
      </div>
    </>
  );
}
