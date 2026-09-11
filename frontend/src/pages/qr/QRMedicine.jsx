import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

function QRMedicine() {
    const { qrCode } = useParams();

    const [medicineData, setMedicineData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMedicine = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get(`/qr/${qrCode}/`);

                if (!response.data.success) {
                    setError(
                        response.data.message ||
                        "Medicine information not found."
                    );
                    return;
                }

                setMedicineData(response.data.data);

            } catch (error) {
                console.error("QR Lookup Error:", error);

                setError(
                    error.response?.data?.message ||
                    "Medicine information not found."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchMedicine();
    }, [qrCode]);

    if (loading) {
        return (
            <div className="page-loading">
                Loading medicine information...
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

    if (!medicineData) {
        return (
            <div className="page-error">
                Medicine information not found.
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Medicine Information</h1>
                    <p>
                        QR Code: {medicineData.qr_code}
                    </p>
                </div>
            </div>

            <div className="data-card">
                <div className="data-card-header">
                    <h2>
                        {medicineData.medicine_name || "-"}
                    </h2>
                </div>

                <div className="details-grid">

                    <div>
                        <span className="details-label">
                            Generic Name
                        </span>

                        <strong>
                            {medicineData.generic_name || "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Strength
                        </span>

                        <strong>
                            {medicineData.strength || "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Dosage Form
                        </span>

                        <strong>
                            {medicineData.dosage_form || "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Manufacturer
                        </span>

                        <strong>
                            {medicineData.manufacturer || "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Batch Number
                        </span>

                        <strong>
                            {medicineData.batch_number || "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Expiry Date
                        </span>

                        <strong>
                            {medicineData.expiry_date || "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Pack Size
                        </span>

                        <strong>
                            {medicineData.pack_size || "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Selling Price
                        </span>

                        <strong>
                            ৳ {medicineData.selling_price || "0.00"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Status
                        </span>

                        <strong>
                            {medicineData.is_expired
                                ? "Expired"
                                : "Active"}
                        </strong>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default QRMedicine;