import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveSession } from "../utils/auth";
import "../styles/Auth.css";

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Login failed.");
                return;
            }

            saveSession(data.token, data.user);
            navigate("/");

        } catch (err) {
            console.error(err);
            setError("Could not reach the server. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={handleSubmit}>
                <h1>Welcome Back</h1>
                <p className="auth-subtitle">Log in to NarraFrame</p>

                {error && <div className="auth-error">{error}</div>}

                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Log In"}
                </button>

                <p className="auth-switch">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;