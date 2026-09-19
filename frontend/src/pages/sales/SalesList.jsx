import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getSales } from "../../api/saleApi";
import { useAuth } from "../../context/AuthContext";

const SalesList = () => {
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const { user } = useAuth();

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadSales = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getSales();

                setSales(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );
            } catch (err) {
                console.error("Sales Error:", err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to load sales."
                );
            } finally {
                setLoading(false);
            }
        };

        loadSales();
    }, []);

    const getBranchName = (sale) => {
        return (
            sale.branch_name ||
            sale.branch?.name ||
            sale.branch ||
            "-"
        );
    };

    const getSoldBy = (sale) => {
        return (
            sale.sold_by_name ||
            sale.sold_by?.username ||
            sale.sold_by ||
            "-"
        );
    };

    const getItemCount = (sale) => {
        if (Array.isArray(sale.items)) {
            return sale.items.length;
        }

        return sale.item_count || 0;
    };

    if (loading) {
        return (
            <div className="page-loading">
                Loading sales...
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Sales History</h1>
                    <p>
                        View completed pharmacy sales
                    </p>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={() => navigate("/sales")}
                >
                    New Sale
                </button>
            </div>

            {error && (
                <div className="page-error">
                    {error}
                </div>
            )}

            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h2>Sales</h2>
                        <p>
                            {sales.length} sale
                            {sales.length !== 1
                                ? "s"
                                : ""}{" "}
                            found
                        </p>
                    </div>
                </div>

                {sales.length === 0 ? (
                    <div className="empty-state">
                        No sales found.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>
                                        Invoice
                                    </th>

                                    <th>
                                        Branch
                                    </th>

                                    <th>
                                        Sold By
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Items
                                    </th>

                                    <th>
                                        Total
                                    </th>

                                    <th>
                                        Discount
                                    </th>

                                    <th>
                                        Paid
                                    </th>

                                    <th>
                                        Due
                                    </th>

                                    <th>
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {sales.map((sale) => (
                                    <tr
                                        key={
                                            sale.id
                                        }
                                    >
                                        <td>
                                            <strong>
                                                {
                                                    sale.invoice_number
                                                }
                                            </strong>
                                        </td>

                                        <td>
                                            {
                                                getBranchName(
                                                    sale
                                                )
                                            }
                                        </td>

                                        <td>
                                            {
                                                getSoldBy(
                                                    sale
                                                )
                                            }
                                        </td>

                                        <td>
                                            {
                                                sale.sale_date ||
                                                "-"
                                            }
                                        </td>

                                        <td>
                                            {
                                                getItemCount(
                                                    sale
                                                )
                                            }
                                        </td>

                                        <td>
                                            ৳
                                            {Number(
                                                sale.total_amount ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            ৳
                                            {Number(
                                                sale.discount ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            ৳
                                            {Number(
                                                sale.paid_amount ||
                                                    0
                                            ).toFixed(
                                                2
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    Number(
                                                        sale.due_amount ||
                                                            0
                                                    ) > 0
                                                        ? "status-inactive"
                                                        : "status-active"
                                                }
                                            >
                                                ৳
                                                {Number(
                                                    sale.due_amount ||
                                                        0
                                                ).toFixed(
                                                    2
                                                )}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    type="button"
                                                    className="edit-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/sales/${sale.id}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>
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

export default SalesList;