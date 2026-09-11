import { useEffect, useState } from "react";
import { getExpiredStock } from "../../api/inventoryApi";

const ExpiredStock = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchExpiredStock = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getExpiredStock();

            setItems(data.results || data);
        } catch (error) {
            console.error("Expired Stock Error:", error);

            setError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to load expired stock."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpiredStock();
    }, []);

    const getMedicineName = (item) => {
        return (
            item.batch?.medicine?.name ||
            item.batch?.medicine_name ||
            item.medicine_name ||
            "-"
        );
    };

    const getBatchNumber = (item) => {
        return (
            item.batch?.batch_number ||
            item.batch_number ||
            "-"
        );
    };

    const getExpiryDate = (item) => {
        return (
            item.batch?.expiry_date ||
            item.expiry_date ||
            "-"
        );
    };

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h2>Expired Stock</h2>
                    <p>
                        Medicines that have passed their expiry date
                    </p>
                </div>

                <div className="inventory-danger-badge">
                    {items.length} Expired
                </div>
            </div>

            {error && (
                <div className="page-error">
                    {error}
                </div>
            )}

            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h3>Expired Items</h3>
                        <span>
                            Do not sell expired medicines
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="page-loading">
                        Loading expired stock...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Batch Number</th>
                                    <th>Expiry Date</th>
                                    <th>Current Stock</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.length > 0 ? (
                                    items.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>
                                                    {getMedicineName(
                                                        item
                                                    )}
                                                </strong>
                                            </td>

                                            <td>
                                                <code>
                                                    {getBatchNumber(
                                                        item
                                                    )}
                                                </code>
                                            </td>

                                            <td>
                                                <span className="status-inactive">
                                                    {getExpiryDate(
                                                        item
                                                    )}
                                                </span>
                                            </td>

                                            <td>
                                                <strong className="stock-zero">
                                                    {item.quantity}
                                                </strong>
                                            </td>

                                            <td>
                                                <span className="expired-badge">
                                                    Expired
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="empty-state"
                                        >
                                            No expired stock found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExpiredStock;