import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await register(form);
      setSuccess("Sikeres regisztráció. Átirányítás a bejelentkezéshez...");

      setTimeout(() => {
        navigate("/login");
      }, 700);
    } catch (err) {
      setError(err?.response?.data?.message || "Sikertelen regisztráció");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-layout">
        <section className="auth-brand-panel">
          <span className="game-page-kicker">New Career</span>
          <h1>Kezdd el a menedzseri karriered.</h1>
          <p>
            Hozz létre fiókot, válassz csapatot, majd építsd fel a saját
            futballmenedzser történeted.
          </p>

          <div className="auth-feature-list">
            <span>Csapatválasztás</span>
            <span>Szezon mentések</span>
            <span>Fejlődő játéklogika</span>
          </div>
        </section>

        <section className="card auth-card auth-form-card">
          <span className="game-page-kicker">Create account</span>
          <h2>Regisztráció</h2>

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
              Felhasználónév
              <input
                type="text"
                name="username"
                placeholder="manager_nev"
                value={form.username}
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

            <button type="submit" disabled={loading}>
              {loading ? "Regisztráció..." : "Fiók létrehozása"}
            </button>
          </form>

          {error && <p className="error-text auth-message">{error}</p>}
          {success && <p className="success-text auth-message">{success}</p>}

          <p className="muted-text auth-switch-text">
            Már van fiókod? <Link to="/login">Bejelentkezés</Link>
          </p>
        </section>
      </div>
    </div>
  );
}