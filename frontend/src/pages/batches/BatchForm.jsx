import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createBatch,
    getBatch,
    updateBatch,
} from "../../api/batchApi";
import { getMedicines } from "../../api/medicineApi";
import { useAuth } from "../../context/AuthContext";

const BatchForm = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    const [medicines, setMedicines] = useState([]);

    const [formData, setFormData] = useState({
        medicine: "",
        batch_number: "",
        expiry_date: "",
        pack_size: "",
        purchase_price: "",
        selling_price: "",
    });

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadMedicines = async () => {
            try {
                const data = await getMedicines({
                    is_active: true,
                });

                setMedicines(data.results || data);
            } catch (error) {
                console.error("Medicine Error:", error);
                setError("Failed to load medicines.");
            }
        };

        loadMedicines();
    }, []);

    useEffect(() => {
        if (!isEditMode) return;

        const fetchBatch = async () => {
            try {
                const data = await getBatch(id);

                setFormData({
                    medicine: data.medicine || "",
                    batch_number: data.batch_number || "",
                    expiry_date: data.expiry_date || "",
                    pack_size: data.pack_size || "",
                    purchase_price: data.purchase_price || "",
                    selling_price: data.selling_price || "",
                });
            } catch (error) {
                console.error("Batch Error:", error);

                setError(
                    error.response?.data?.detail ||
                    "Failed to load batch."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBatch();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSaving(true);

        try {
            const payload = {
                ...formData,
                pack_size: Number(formData.pack_size),
                purchase_price: formData.purchase_price,
                selling_price: formData.selling_price,
            };

            if (isEditMode) {
                await updateBatch(id, payload);
            } else {
                await createBatch(payload);
            }

            navigate("/batches");
        } catch (error) {
            console.error("Save Batch Error:", error);

            const responseData = error.response?.data;

            if (typeof responseData === "object") {
                const firstError = Object.values(responseData)?.[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : firstError || "Failed to save batch."
                );
            } else {
                setError("Failed to save batch.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (user?.role !== "ADMIN") {
        return (
            <div className="page-error">
                You do not have permission to manage batches.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-loading">
                Loading batch...
            </div>
        );
    }

    return (
        <div className="medicine-form-page">
            <div className="page-header">
                <div>
                    <h2>
                        {isEditMode ? "Edit Batch" : "Add Batch"}
                    </h2>

                    <p>
                        {isEditMode
                            ? "Update batch information"
                            : "Add a new medicine batch"}
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => navigate("/batches")}
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
                            <h3>Batch Information</h3>
                            <p>
                                Enter medicine batch and expiry details.
                            </p>
                        </div>

                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>
                                    Medicine <span>*</span>
                                </label>

                                <select
                                    name="medicine"
                                    value={formData.medicine}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Select medicine
                                    </option>

                                    {medicines.map((medicine) => (
                                        <option
                                            key={medicine.id}
                                            value={medicine.id}
                                        >
                                            {medicine.name}
                                            {medicine.strength
                                                ? ` - ${medicine.strength}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>
                                    Batch Number <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    name="batch_number"
                                    value={formData.batch_number}
                                    onChange={handleChange}
                                    placeholder="e.g. BTH-2026-001"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Expiry Date <span>*</span>
                                </label>

                                <input
                                    type="date"
                                    name="expiry_date"
                                    value={formData.expiry_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Pack Size <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    name="pack_size"
                                    value={formData.pack_size}
                                    onChange={handleChange}
                                    placeholder="e.g. 10"
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Purchase Price <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    name="purchase_price"
                                    value={formData.purchase_price}
                                    onChange={handleChange}
                                    placeholder="e.g. 80.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Selling Price <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    name="selling_price"
                                    value={formData.selling_price}
                                    onChange={handleChange}
                                    placeholder="e.g. 100.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <div className="form-section-title">
                            <h3>QR Code</h3>
                            <p>
                                A unique QR code will be generated
                                automatically for this batch.
                            </p>
                        </div>

                        <div className="qr-info-box">
                            <strong>Automatic QR Generation</strong>
                            <span>
                                The backend will generate the QR code
                                after this batch is created.
                            </span>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() => navigate("/batches")}
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
                                ? "Update Batch"
                                : "Save Batch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchForm;