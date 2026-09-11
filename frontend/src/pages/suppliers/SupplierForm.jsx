import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createSupplier,
    getSupplier,
    updateSupplier,
} from "../../api/supplierApi";
import { useAuth } from "../../context/AuthContext";

const SupplierForm = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: "",
        company_name: "",
        phone: "",
        address: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEditMode) return;

        const fetchSupplier = async () => {
            try {
                const data = await getSupplier(id);

                setFormData({
                    name: data.name || "",
                    company_name: data.company_name || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    is_active: data.is_active,
                });
            } catch (error) {
                console.error("Supplier Error:", error);

                setError(
                    error.response?.data?.detail ||
                    "Failed to load supplier."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSupplier();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSaving(true);

        try {
            if (isEditMode) {
                await updateSupplier(id, formData);
            } else {
                await createSupplier(formData);
            }

            navigate("/suppliers");
        } catch (error) {
            console.error("Save Supplier Error:", error);

            const responseData = error.response?.data;

            if (typeof responseData === "object") {
                const firstError = Object.values(responseData)?.[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : firstError || "Failed to save supplier."
                );
            } else {
                setError("Failed to save supplier.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (
        user?.role !== "ADMIN" &&
        user?.role !== "MANAGER"
    ) {
        return (
            <div className="page-error">
                You do not have permission to manage suppliers.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-loading">
                Loading supplier...
            </div>
        );
    }

    return (
        <div className="medicine-form-page">
            <div className="page-header">
                <div>
                    <h2>
                        {isEditMode
                            ? "Edit Supplier"
                            : "Add Supplier"}
                    </h2>

                    <p>
                        {isEditMode
                            ? "Update supplier information"
                            : "Add a new supplier"}
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => navigate("/suppliers")}
                >
                    ← Back
                </button>
            </div>

            <div className="form-card">
                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-section-title">
                            <h3>Supplier Information</h3>
                            <p>
                                Enter the supplier's contact and
                                company information.
                            </p>
                        </div>

                        <div className="form-grid">
                            <div className="form-group">
                                <label>
                                    Supplier Name <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Rahman Traders"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Company Name
                                </label>

                                <input
                                    type="text"
                                    name="company_name"
                                    value={
                                        formData.company_name
                                    }
                                    onChange={handleChange}
                                    placeholder="e.g. ABC Pharmaceuticals"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Phone <span>*</span>
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. 017XXXXXXXX"
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Address</label>

                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter supplier address"
                                    rows="4"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section status-section">
                        <div className="form-section-title">
                            <h3>Status</h3>
                            <p>
                                Control whether this supplier is
                                available for purchases.
                            </p>
                        </div>

                        <label className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />

                            <div>
                                <strong>
                                    Active supplier
                                </strong>

                                <span>
                                    This supplier can be selected
                                    when creating purchases.
                                </span>
                            </div>
                        </label>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate("/suppliers")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isEditMode
                                ? "Update Supplier"
                                : "Save Supplier"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierForm;