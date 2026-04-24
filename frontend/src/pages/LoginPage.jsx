import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useGameStore } from "../store/gameStore";

export default function LoginPage() {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading);
  const authError = useAuthStore((state) => state.authError);
  const clearAuthError = useAuthStore((state) => state.clearAuthError);

  const activeSaveId = useGameStore((state) => state.activeSaveId);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    clearAuthError();
  }, [clearAuthError]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(form);
      navigate(activeSaveId ? "/dashboard" : "/saves");
    } catch {
      // A hibát az authStore kezeli.
    }
  };

  return (
    <div className="page-shell">
      <div className="card auth-card">
        <h1>Bejelentkezés</h1>

        <form onSubmit={handleSubmit} className="form-stack">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Jelszó"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={isAuthLoading}>
            {isAuthLoading ? "Belépés..." : "Belépés"}
          </button>
        </form>

        {authError && <p className="error-text">{authError}</p>}

        <p className="muted-text">
          Nincs még fiókod? <Link to="/register">Regisztráció</Link>
        </p>
      </div>
    </div>
  );
}