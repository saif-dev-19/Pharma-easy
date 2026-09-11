import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPurchases } from "../../api/purchaseApi";
import { useAuth } from "../../context/AuthContext";

const PurchaseList = () => {
    const { user } = useAuth();

    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getPurchases();

            console.log("PURCHASES:", data);

            setPurchases(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Purchase Error:", err);
            setError(
                err.response?.data?.detail ||
                "Failed to load purchases."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, []);

    const handleDelete = async () => {
        // Delete will be added after confirming backend behavior.
        alert("Delete action will be implemented next.");
    };

    if (loading) {
        return <div className="page-loading">Loading purchases...</div>;
    }

    if (error) {
        return (
            <div className="page-error">
                <p>{error}</p>
                <button
                    type="button"
                    className="primary-button"
                    onClick={fetchPurchases}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Purchases</h1>
                    <p>Manage pharmacy purchases and stock entries</p>
                </div>

                {(user?.role === "ADMIN" || user?.role === "MANAGER") && (
                    <Link
                        to="/purchases/new"
                        className="primary-button"
                    >
                        + Add Purchase
                    </Link>
                )}
            </div>

            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h2>Purchase List</h2>
                        <p>
                            {purchases.length}{" "}
                            {purchases.length === 1
                                ? "purchase"
                                : "purchases"}
                        </p>
                    </div>
                </div>

                {purchases.length === 0 ? (
                    <div className="empty-state">
                        No purchases found.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Invoice</th>
                                    <th>Supplier</th>
                                    <th>Branch</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {purchases.map((purchase) => (
                                    <tr key={purchase.id}>
                                        <td>
                                            <strong>
                                                {purchase.invoice_number || "-"}
                                            </strong>
                                        </td>

                                        <td>
                                            {purchase.supplier_name ||
                                                purchase.supplier?.name ||
                                                purchase.supplier ||
                                                "-"}
                                        </td>

                                        <td>
                                            {purchase.branch_name ||
                                                purchase.branch?.name ||
                                                purchase.branch ||
                                                "-"}
                                        </td>

                                        <td>
                                            {purchase.purchase_date || "-"}
                                        </td>

                                        <td>
                                            {purchase.items?.length || 0}
                                        </td>

                                        <td>
                                            <strong>
                                                ৳{" "}
                                                {Number(
                                                    purchase.total_amount || 0
                                                ).toFixed(2)}
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/purchases/${purchase.id}`}
                                                    className="edit-button"
                                                >
                                                    View
                                                </Link>

                                                {(user?.role === "ADMIN" ||
                                                    user?.role === "MANAGER") && (
                                                    <button
                                                        type="button"
                                                        className="delete-button"
                                                        onClick={handleDelete}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseList;