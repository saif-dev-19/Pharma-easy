import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createUser,
    getUser,
    updateUser,
} from "../../api/userApi";
import { getBranches } from "../../api/branchApi";

function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const isEdit = Boolean(id);

    const [branches, setBranches] = useState([]);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "STAFF",
        branch: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const branchData = await getBranches();
                setBranches(branchData.results || branchData);

                if (isEdit) {
                    const user = await getUser(id);

                    setFormData({
                        username: user.username || "",
                        email: user.email || "",
                        password: "",
                        role: user.role || "STAFF",
                        branch: user.branch || "",
                        is_active: user.is_active ?? true,
                    });
                }
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to load data."
                );
            } finally {
                setInitialLoading(false);
            }
        };

        loadData();
    }, [id, isEdit]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!formData.username.trim()) {
            setError("Username is required.");
            return;
        }

        if (!isEdit && !formData.password) {
            setError("Password is required.");
            return;
        }

        if (!formData.branch) {
            setError("Branch is required.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                username: formData.username.trim(),
                email: formData.email.trim(),
                role: formData.role,
                branch: Number(formData.branch),
                is_active: formData.is_active,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            if (isEdit) {
                await updateUser(id, payload);
            } else {
                await createUser(payload);
            }

            navigate("/users");
        } catch (err) {
            console.error(err);

            const data = err.response?.data;

            if (data) {
                const firstError = Object.values(data)[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : firstError || "Failed to save user."
                );
            } else {
                setError("Failed to save user.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="page-loading">
                Loading user...
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>
                        {isEdit ? "Edit User" : "Add User"}
                    </h1>

                    <p>
                        {isEdit
                            ? "Update user information"
                            : "Create a Manager or Staff account"}
                    </p>
                </div>
            </div>

            <div className="form-card">

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-section">

                        <h2 className="form-section-title">
                            Account Information
                        </h2>

                        <div className="form-grid">

                            <div className="form-group">
                                <label htmlFor="username">
                                    Username *
                                </label>

                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">
                                    {isEdit
                                        ? "New Password"
                                        : "Password *"}
                                </label>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder={
                                        isEdit
                                            ? "Leave blank to keep current password"
                                            : "Enter password"
                                    }
                                    required={!isEdit}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="role">
                                    Role *
                                </label>

                                <select
                                    id="role"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="MANAGER">
                                        Manager
                                    </option>

                                    <option value="STAFF">
                                        Staff
                                    </option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="branch">
                                    Branch *
                                </label>

                                <select
                                    id="branch"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select Branch
                                    </option>

                                    {branches
                                        .filter(
                                            (branch) =>
                                                branch.is_active
                                        )
                                        .map((branch) => (
                                            <option
                                                key={branch.id}
                                                value={branch.id}
                                            >
                                                {branch.name}
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="form-group">

                                <label className="checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleChange}
                                    />

                                    <span>
                                        Active User
                                    </span>
                                </label>

                            </div>

                        </div>
                    </div>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => navigate("/users")}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : isEdit
                                    ? "Update User"
                                    : "Create User"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default UserForm;