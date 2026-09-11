import { useEffect, useState } from "react";
import { getLowStock } from "../../api/inventoryApi";

const LowStock = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchLowStock = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getLowStock();

            setItems(data.results || data);
        } catch (error) {
            console.error("Low Stock Error:", error);

            setError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to load low stock items."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLowStock();
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
        return item.batch?.batch_number || item.batch_number || "-";
    };

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h2>Low Stock</h2>
                    <p>
                        Medicines that need to be restocked
                    </p>
                </div>

                <div className="inventory-alert-badge">
                    {items.length} Low Stock
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
                        <h3>Low Stock Items</h3>
                        <span>
                            Review items that are below the
                            minimum stock level
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="page-loading">
                        Loading low stock items...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Batch Number</th>
                                    <th>Current Stock</th>
                                    <th>Minimum Stock</th>
                                    <th>Shortage</th>
                                    <th>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.length > 0 ? (
                                    items.map((item) => {
                                        const shortage =
                                            Math.max(
                                                item.minimum_stock -
                                                    item.quantity,
                                                0
                                            );

                                        return (
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
                                                    <strong className="stock-low">
                                                        {item.quantity}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        item.minimum_stock
                                                    }
                                                </td>

                                                <td>
                                                    <strong className="shortage-number">
                                                        {shortage}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="stock-warning">
                                                        Low Stock
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="empty-state"
                                        >
                                            No low stock items.
                                            Your inventory is
                                            healthy.
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

export default LowStock;