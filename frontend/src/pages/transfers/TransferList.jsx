import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTransfers } from "../../api/transferApi";

const TransferList = () => {
    const navigate = useNavigate();

    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTransfers = async () => {
            try {
                setLoading(true);

                const data = await getTransfers();

                setTransfers(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );
            } catch (err) {
                console.error("Transfer error:", err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to load transfers."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTransfers();
    }, []);

    if (loading) {
        return (
            <div className="page-loading">
                Loading transfers...
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Stock Transfers</h1>
                    <p>
                        Transfer medicine stock between branches
                    </p>
                </div>

                <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                        navigate("/transfers/new")
                    }
                >
                    New Transfer
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
                        <h2>Transfer History</h2>
                    </div>
                </div>

                {transfers.length === 0 ? (
                    <div className="empty-state">
                        No transfers found.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>
                                        From Branch
                                    </th>
                                    <th>
                                        To Branch
                                    </th>
                                    <th>
                                        Date
                                    </th>
                                    <th>
                                        Status
                                    </th>
                                    <th>
                                        Items
                                    </th>
                                    <th>
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {transfers.map(
                                    (transfer) => (
                                        <tr
                                            key={
                                                transfer.id
                                            }
                                        >
                                            <td>
                                                {transfer.from_branch_name ||
                                                    transfer.from_branch?.name ||
                                                    transfer.from_branch ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {transfer.to_branch_name ||
                                                    transfer.to_branch?.name ||
                                                    transfer.to_branch ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {transfer.transfer_date ||
                                                    "-"}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        transfer.status ===
                                                        "COMPLETED"
                                                            ? "status-active"
                                                            : transfer.status ===
                                                              "CANCELLED"
                                                            ? "status-inactive"
                                                            : "status-warning"
                                                    }
                                                >
                                                    {transfer.status ||
                                                        "-"}
                                                </span>
                                            </td>

                                            <td>
                                                {Array.isArray(
                                                    transfer.items
                                                )
                                                    ? transfer.items
                                                          .length
                                                    : transfer.item_count ||
                                                      0}
                                            </td>

                                            <td>
                                                <button
                                                    type="button"
                                                    className="edit-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/transfers/${transfer.id}`
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferList;