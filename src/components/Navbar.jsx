import { Sparkles } from "lucide-react";
import "../styles/Navbar.css";
import Logo from "./Logo";
import { useNavigate } from "react-router-dom";
import { isLoggedIn, clearSession, getUser } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const user = getUser();

  return (
    <nav className="navbar">

      <Logo />

      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#examples">Examples</a>
        <a href="#pricing">Pricing</a>
        <a href="#about">About</a>
      </div>

      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <button className="nav-btn" onClick={() => navigate("/projects")}>
          📁 My Projects
        </button>

        {loggedIn ? (
          <button
            className="nav-btn"
            style={{ background: "rgba(255,255,255,0.08)" }}
            onClick={() => {
              clearSession();
              navigate("/");
            }}
          >
            🚪 Logout {user?.email ? `(${user.email})` : ""}
          </button>
        ) : (
          <button
            className="nav-btn"
            style={{ background: "rgba(255,255,255,0.08)" }}
            onClick={() => navigate("/login")}
          >
            🔑 Log In
          </button>
        )}
      </div>

    </nav>
  );
}

export default Navbar;