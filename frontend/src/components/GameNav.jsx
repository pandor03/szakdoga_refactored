import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: "🏠" },
  { label: "Keret", path: "/squad", icon: "👥" },
  { label: "Átigazolások", path: "/transfer", icon: "💸" },
  { label: "Meccsek", path: "/fixtures", icon: "⚽" },
  { label: "Tabella", path: "/standings", icon: "📊" },
];

export default function GameNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="game-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            type="button"
            className={`game-nav-button ${isActive ? "game-nav-active" : ""}`}
            onClick={() => navigate(item.path)}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}