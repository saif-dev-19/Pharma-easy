import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createMedicine,
    getMedicine,
    updateMedicine,
} from "../../api/medicineApi";
import { useAuth } from "../../context/AuthContext";

const MedicineForm = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: "",
        generic_name: "",
        strength: "",
        dosage_form: "",
        manufacturer: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isEditMode) {
            return;
        }

        const fetchMedicine = async () => {
            try {
                const data = await getMedicine(id);

                setFormData({
                    name: data.name || "",
                    generic_name: data.generic_name || "",
                    strength: data.strength || "",
                    dosage_form: data.dosage_form || "",
                    manufacturer: data.manufacturer || "",
                    is_active: data.is_active,
                });
            } catch (error) {
                console.error("Medicine Error:", error);

                setError(
                    error.response?.data?.detail ||
                    "Failed to load medicine."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMedicine();
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
                await updateMedicine(id, formData);
            } else {
                await createMedicine(formData);
            }

            navigate("/medicines");
        } catch (error) {
            console.error("Save Medicine Error:", error);

            const responseData = error.response?.data;

            if (typeof responseData === "object") {
                const firstError = Object.values(responseData)?.[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : firstError || "Failed to save medicine."
                );
            } else {
                setError("Failed to save medicine.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (user?.role !== "ADMIN") {
        return (
            <div className="page-error">
                You do not have permission to manage medicines.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-loading">
                Loading medicine...
            </div>
        );
    }

    return (
        <div className="medicine-form-page">

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>
                        {isEditMode
                            ? "Edit Medicine"
                            : "Add Medicine"}
                    </h2>

                    <p>
                        {isEditMode
                            ? "Update medicine information"
                            : "Add a new medicine to your pharmacy"}
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => navigate("/medicines")}
                >
                    ← Back
                </button>
            </div>

            {/* Form Card */}
            <div className="form-card">

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-section">
                        <div className="form-section-title">
                            <h3>Medicine Information</h3>
                            <p>
                                Enter the basic information of the medicine.
                            </p>
                        </div>

                        <div className="form-grid">

                            <div className="form-group">
                                <label>
                                    Medicine Name
                                    <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Napa"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Generic Name
                                </label>

                                <input
                                    type="text"
                                    name="generic_name"
                                    value={formData.generic_name}
                                    onChange={handleChange}
                                    placeholder="e.g. Paracetamol"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Strength
                                </label>

                                <input
                                    type="text"
                                    name="strength"
                                    value={formData.strength}
                                    onChange={handleChange}
                                    placeholder="e.g. 500mg"
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Dosage Form
                                </label>

                                <input
                                    type="text"
                                    name="dosage_form"
                                    value={formData.dosage_form}
                                    onChange={handleChange}
                                    placeholder="e.g. Tablet"
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>
                                    Manufacturer
                                </label>

                                <input
                                    type="text"
                                    name="manufacturer"
                                    value={formData.manufacturer}
                                    onChange={handleChange}
                                    placeholder="e.g. Beximco Pharmaceuticals"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Status */}
                    <div className="form-section status-section">

                        <div className="form-section-title">
                            <h3>Status</h3>
                            <p>
                                Control whether this medicine is available
                                in the system.
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
                                <strong>Active medicine</strong>
                                <span>
                                    This medicine can be used in inventory
                                    and sales.
                                </span>
                            </div>
                        </label>

                    </div>

                    {/* Actions */}
                    <div className="form-actions">

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => navigate("/medicines")}
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
                                ? "Update Medicine"
                                : "Save Medicine"}
                        </button>

                    </div>

                </form>
            </div>
        </div>
    );
};

export default MedicineForm;