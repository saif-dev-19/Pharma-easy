import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!username || !password) {
            setError("Please enter your username and password.");
            return;
        }

        try {
            setLoading(true);

            await login(username, password);

            navigate("/dashboard");
        } catch (error) {
            setError(
                error.response?.data?.detail ||
                error.response?.data?.non_field_errors?.[0] ||
                "Invalid username or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">

                {/* Left Side */}
                <div className="login-brand-section">
                    <div className="login-brand-icon">
                        +
                    </div>

                    <h1>Pharma Easy</h1>

                    <p>
                        Manage your pharmacy operations,
                        inventory and sales from one place.
                    </p>

                    <div className="login-features">
                        <div className="login-feature">
                            <span>✓</span>
                            <span>Inventory Management</span>
                        </div>

                        <div className="login-feature">
                            <span>✓</span>
                            <span>Sales & POS</span>
                        </div>

                        <div className="login-feature">
                            <span>✓</span>
                            <span>Multi-Branch Management</span>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="login-form-section">

                    <div className="login-form-header">
                        <h2>Welcome back</h2>
                        <p>
                            Sign in to access your pharmacy dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">

                        {error && (
                            <div className="login-error">
                                {error}
                            </div>
                        )}

                        <div className="login-input-group">
                            <label htmlFor="username">
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) =>
                                    setUsername(e.target.value)
                                }
                                autoComplete="username"
                            />
                        </div>

                        <div className="login-input-group">
                            <label htmlFor="password">
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="current-password"
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                    </form>

                    <div className="login-footer">
                        Pharma Easy &copy; 2026. All rights reserved.
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;