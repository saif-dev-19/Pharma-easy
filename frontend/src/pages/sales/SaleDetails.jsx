import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getSale } from "../../api/saleApi";

const SaleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [sale, setSale] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadSale = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getSale(id);
                setSale(data);
            } catch (err) {
                console.error("Sale details error:", err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to load sale details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadSale();
    }, [id]);

    const getMedicineName = (item) => {
        return (
            item.batch?.medicine?.name ||
            item.batch?.medicine_name ||
            item.medicine_name ||
            item.batch?.medicine ||
            "Unknown Medicine"
        );
    };

    const getBatchNumber = (item) => {
        return (
            item.batch?.batch_number ||
            item.batch_number ||
            "-"
        );
    };

    if (loading) {
        return (
            <div className="page-loading">
                Loading sale details...
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="page-error">
                    {error}
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                        navigate("/sales/history")
                    }
                >
                    Back to Sales
                </button>
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    Sale not found.
                </div>
            </div>
        );
    }

    const items = Array.isArray(sale.items)
        ? sale.items
        : [];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Sale Details</h1>
                    <p>
                        Invoice:{" "}
                        <strong>
                            {sale.invoice_number}
                        </strong>
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                        navigate("/sales/history")
                    }
                >
                    Back to Sales
                </button>
            </div>

            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h2>
                            Invoice #
                            {sale.invoice_number}
                        </h2>
                    </div>
                </div>

                <div className="details-grid">
                    <div>
                        <span className="details-label">
                            Sale Date
                        </span>

                        <strong>
                            {sale.sale_date || "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Branch
                        </span>

                        <strong>
                            {sale.branch_name ||
                                sale.branch?.name ||
                                sale.branch ||
                                "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Sold By
                        </span>

                        <strong>
                            {sale.sold_by_name ||
                                sale.sold_by?.username ||
                                sale.sold_by ||
                                "-"}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h2>Sale Items</h2>

                        <p>
                            {items.length} item
                            {items.length !== 1
                                ? "s"
                                : ""}
                        </p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="empty-state">
                        No sale items found.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>
                                        Medicine
                                    </th>

                                    <th>
                                        Batch
                                    </th>

                                    <th>
                                        Quantity
                                    </th>

                                    <th>
                                        Selling Price
                                    </th>

                                    <th>
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item) => (
                                    <tr
                                        key={
                                            item.id
                                        }
                                    >
                                        <td>
                                            <strong>
                                                {getMedicineName(
                                                    item
                                                )}
                                            </strong>
                                        </td>

                                        <td>
                                            {getBatchNumber(
                                                item
                                            )}
                                        </td>

                                        <td>
                                            {
                                                item.quantity
                                            }
                                        </td>

                                        <td>
                                            ৳
                                            {Number(
                                                item.selling_price ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            ৳
                                            {Number(
                                                item.subtotal ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="data-card sale-summary-card">
                <div className="sale-summary">
                    <div className="summary-row">
                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ৳
                            {(
                                Number(
                                    sale.total_amount ||
                                        0
                                ) +
                                Number(
                                    sale.discount || 0
                                )
                            ).toFixed(2)}
                        </strong>
                    </div>

                    <div className="summary-row">
                        <span>
                            Discount
                        </span>

                        <strong>
                            ৳
                            {Number(
                                sale.discount || 0
                            ).toFixed(2)}
                        </strong>
                    </div>

                    <div className="summary-row total-row">
                        <span>
                            Total
                        </span>

                        <strong>
                            ৳
                            {Number(
                                sale.total_amount ||
                                    0
                            ).toFixed(2)}
                        </strong>
                    </div>

                    <div className="summary-row">
                        <span>
                            Paid
                        </span>

                        <strong>
                            ৳
                            {Number(
                                sale.paid_amount ||
                                    0
                            ).toFixed(2)}
                        </strong>
                    </div>

                    <div className="summary-row">
                        <span>
                            Due
                        </span>

                        <strong>
                            ৳
                            {Number(
                                sale.due_amount ||
                                    0
                            ).toFixed(2)}
                        </strong>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SaleDetails;