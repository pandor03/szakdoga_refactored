import { useNavigate } from "react-router-dom";

export default function GameNav() {
  const navigate = useNavigate();

  return (
    <div className="button-row">
      <button className="secondary-btn" onClick={() => navigate("/dashboard")}>
        Dashboard
      </button>
      <button className="secondary-btn" onClick={() => navigate("/squad")}>
        Keret
      </button>
      <button className="secondary-btn" onClick={() => navigate("/transfer")}>
        Átigazolások
      </button>
      <button className="secondary-btn" onClick={() => navigate("/fixtures")}>
        Meccsek
      </button>
      <button className="secondary-btn" onClick={() => navigate("/standings")}>
        Tabella
      </button>
    </div>
  );
}