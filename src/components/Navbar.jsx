import { Sparkles } from "lucide-react";
import "../styles/Navbar.css";
import Logo from "./Logo";

function Navbar() {
  return (
    <nav className="navbar">

      <Logo />

      <div className="nav-links">
        <a href="#">Features</a>
        <a href="#">Examples</a>
        <a href="#">Pricing</a>
        <a href="#">About</a>
      </div>

      <button className="nav-btn">
        Launch App
      </button>

    </nav>
  );
}

export default Navbar;