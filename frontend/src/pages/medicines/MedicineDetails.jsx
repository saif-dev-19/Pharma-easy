import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMedicine } from "../../api/medicineApi";

const MedicineDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [medicine, setMedicine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMedicine = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMedicine(id);

                setMedicine(data);
            } catch (error) {
                console.error("Medicine Details Error:", error);

                setError(
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    "Failed to load medicine details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMedicine();
    }, [id]);

    if (loading) {
        return (
            <div className="page-loading">
                Loading medicine details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-error">
                {error}
            </div>
        );
    }

    if (!medicine) {
        return (
            <div className="page-error">
                Medicine not found.
            </div>
        );
    }

    return (
        <div className="medicine-page">

            <div className="page-header">
                <div>
                    <h2>Medicine Details</h2>
                    <p>
                        View complete medicine information
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

            <div className="data-card">

                <div className="data-card-header">
                    <h3>{medicine.name}</h3>
                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "30px",
                        padding: "25px",
                        alignItems: "flex-start",
                    }}
                >
                    <div>
                        {medicine.image ? (
                            <img
                                src={medicine.image}
                                alt={medicine.name}
                                style={{
                                    width: "220px",
                                    height: "220px",
                                    objectFit: "cover",
                                    borderRadius: "12px",
                                }}
                            />
                        ) : (
                            <div>
                                No image available
                            </div>
                        )}
                    </div>

                    <div className="details-grid">

                        <div>
                            <span className="details-label">
                                Medicine Name
                            </span>

                            <strong>
                                {medicine.name || "-"}
                            </strong>
                        </div>

                        <div>
                            <span className="details-label">
                                Generic Name
                            </span>

                            <strong>
                                {medicine.generic_name || "-"}
                            </strong>
                        </div>

                        <div>
                            <span className="details-label">
                                Strength
                            </span>

                            <strong>
                                {medicine.strength || "-"}
                            </strong>
                        </div>

                        <div>
                            <span className="details-label">
                                Dosage Form
                            </span>

                            <strong>
                                {medicine.dosage_form || "-"}
                            </strong>
                        </div>

                        <div>
                            <span className="details-label">
                                Manufacturer
                            </span>

                            <strong>
                                {medicine.manufacturer || "-"}
                            </strong>
                        </div>

                        <div>
                            <span className="details-label">
                                Status
                            </span>

                            <strong>
                                {medicine.is_active
                                    ? "Active"
                                    : "Inactive"}
                            </strong>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default MedicineDetails;