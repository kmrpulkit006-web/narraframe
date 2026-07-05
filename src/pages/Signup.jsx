import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveSession } from "../utils/auth";
import "../styles/Auth.css";

function Signup() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Signup failed.");
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
                <h1>Create Account</h1>
                <p className="auth-subtitle">Join NarraFrame</p>

                {error && <div className="auth-error">{error}</div>}

                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />

                <label>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </form>
        </div>
    );
}

export default Signup;