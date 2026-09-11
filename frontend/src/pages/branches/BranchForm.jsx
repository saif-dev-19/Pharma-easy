import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createBranch,
    getBranch,
    updateBranch,
} from "../../api/branchApi";

function BranchForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEdit) return;

        const fetchBranch = async () => {
            try {
                const data = await getBranch(id);

                setFormData({
                    name: data.name || "",
                    address: data.address || "",
                    phone: data.phone || "",
                    is_active: data.is_active ?? true,
                });
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to load branch."
                );
            } finally {
                setInitialLoading(false);
            }
        };

        fetchBranch();
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

        if (!formData.name.trim()) {
            setError("Branch name is required.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: formData.name.trim(),
                address: formData.address.trim(),
                phone: formData.phone.trim(),
                is_active: formData.is_active,
            };

            if (isEdit) {
                await updateBranch(id, payload);
            } else {
                await createBranch(payload);
            }

            navigate("/branches");
        } catch (err) {
            console.error(err);

            const data = err.response?.data;

            if (data?.name) {
                setError(
                    Array.isArray(data.name)
                        ? data.name[0]
                        : data.name
                );
            } else {
                setError(
                    data?.detail ||
                    "Failed to save branch."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="page-loading">
                Loading branch...
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>
                        {isEdit
                            ? "Edit Branch"
                            : "Add Branch"}
                    </h1>

                    <p>
                        {isEdit
                            ? "Update branch information"
                            : "Create a new pharmacy branch"}
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
                            Branch Information
                        </h2>

                        <div className="form-grid">

                            <div className="form-group">
                                <label htmlFor="name">
                                    Branch Name *
                                </label>

                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter branch name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    Phone
                                </label>

                                <input
                                    id="phone"
                                    name="phone"
                                    type="text"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="address">
                                    Address
                                </label>

                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter branch address"
                                    rows="4"
                                />
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
                                        Active Branch
                                    </span>
                                </label>
                            </div>

                        </div>
                    </div>

                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => navigate("/branches")}
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
                                    ? "Update Branch"
                                    : "Create Branch"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
}

export default BranchForm;