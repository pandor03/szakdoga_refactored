import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await login(form);
      navigate("/saves", { replace: true });
    } catch {}
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-layout">
        <section className="auth-brand-panel">
          <span className="game-page-kicker">Soccer Manager</span>
          <h1>Építs bajnokcsapatot.</h1>
          <p>
            Kezeld a kereted, igazolj játékosokat, állítsd össze a kezdőt és
            vezesd végig a csapatod a szezonon.
          </p>

          <div className="auth-feature-list">
            <span>Keretmenedzsment</span>
            <span>Átigazolási piac</span>
            <span>Forduló szimuláció</span>
          </div>
        </section>

        <section className="card auth-card auth-form-card">
          <span className="game-page-kicker">Welcome back</span>
          <h2>Bejelentkezés</h2>

          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Email
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Jelszó
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
            </label>

            <button type="submit" disabled={isAuthLoading}>
              {isAuthLoading ? "Belépés..." : "Belépés"}
            </button>
          </form>

          {authError && <p className="error-text auth-message">{authError}</p>}

          <p className="muted-text auth-switch-text">
            Nincs még fiókod? <Link to="/register">Regisztráció</Link>
          </p>
        </section>
      </div>
    </div>
  );
}