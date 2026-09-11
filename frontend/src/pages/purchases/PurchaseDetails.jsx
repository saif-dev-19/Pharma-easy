import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPurchase } from "../../api/purchaseApi";

const PurchaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchPurchase = async () => {
            try {
                setLoading(true);

                const data = await getPurchase(id);

                console.log("PURCHASE DETAILS:", data);

                setPurchase(data);
            } catch (err) {
                console.error("Purchase Details Error:", err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to load purchase details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchPurchase();
    }, [id]);

    if (loading) {
        return <div className="page-loading">Loading purchase...</div>;
    }

    if (error) {
        return (
            <div className="page-error">
                <p>{error}</p>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => navigate("/purchases")}
                >
                    Back to Purchases
                </button>
            </div>
        );
    }

    if (!purchase) {
        return (
            <div className="empty-state">
                Purchase not found.
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Purchase Details</h1>
                    <p>
                        Invoice:{" "}
                        <strong>
                            {purchase.invoice_number || "-"}
                        </strong>
                    </p>
                </div>

                <Link
                    to="/purchases"
                    className="secondary-button"
                >
                    Back to Purchases
                </Link>
            </div>

            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h2>Purchase Information</h2>
                    </div>
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label>Invoice Number</label>
                        <input
                            value={purchase.invoice_number || ""}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>Purchase Date</label>
                        <input
                            value={purchase.purchase_date || ""}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>Supplier</label>
                        <input
                            value={
                                purchase.supplier_name ||
                                purchase.supplier?.name ||
                                purchase.supplier ||
                                "-"
                            }
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>Branch</label>
                        <input
                            value={
                                purchase.branch_name ||
                                purchase.branch?.name ||
                                purchase.branch ||
                                "-"
                            }
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>Total Amount</label>
                        <input
                            value={`৳ ${Number(
                                purchase.total_amount || 0
                            ).toFixed(2)}`}
                            readOnly
                        />
                    </div>
                </div>
            </div>

            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h2>Purchase Items</h2>
                        <p>
                            {purchase.items?.length || 0} items
                        </p>
                    </div>
                </div>

                {!purchase.items?.length ? (
                    <div className="empty-state">
                        No items found.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Medicine / Batch</th>
                                    <th>Quantity</th>
                                    <th>Purchase Price</th>
                                    <th>Selling Price</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>

                            <tbody>
                                {purchase.items.map((item, index) => (
                                    <tr key={item.id || index}>
                                        <td>
                                            {item.medicine_name ||
                                                item.batch_name ||
                                                item.batch?.medicine?.name ||
                                                item.batch ||
                                                "-"}
                                        </td>

                                        <td>
                                            {item.quantity || 0}
                                        </td>

                                        <td>
                                            ৳{" "}
                                            {Number(
                                                item.purchase_price || 0
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            ৳{" "}
                                            {Number(
                                                item.selling_price || 0
                                            ).toFixed(2)}
                                        </td>

                                        <td>
                                            <strong>
                                                ৳{" "}
                                                {Number(
                                                    item.subtotal || 0
                                                ).toFixed(2)}
                                            </strong>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            <tfoot>
                                <tr>
                                    <td colSpan="4">
                                        <strong>Total</strong>
                                    </td>
                                    <td>
                                        <strong>
                                            ৳{" "}
                                            {Number(
                                                purchase.total_amount || 0
                                            ).toFixed(2)}
                                        </strong>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseDetails;