import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getTransfer } from "../../api/transferApi";

const TransferDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [transfer, setTransfer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadTransfer = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getTransfer(id);
                setTransfer(data);
                console.log("Transfer details:", data);
            } catch (err) {
                console.error(
                    "Transfer details error:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Failed to load transfer details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTransfer();
    }, [id]);

    const getMedicineName = (item) => {
        return (
            item.batch?.medicine_name ||
            item.batch?.medicine?.name ||
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
                Loading transfer details...
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
                        navigate("/transfers")
                    }
                >
                    Back to Transfers
                </button>
            </div>
        );
    }

    if (!transfer) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    Transfer not found.
                </div>
            </div>
        );
    }

    const items = Array.isArray(transfer.items)
        ? transfer.items
        : [];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Transfer Details</h1>
                    <p>
                        Transfer #
                        {transfer.id}
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                        navigate("/transfers")
                    }
                >
                    Back to Transfers
                </button>
            </div>

            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h2>
                            Transfer Information
                        </h2>
                    </div>
                </div>

                <div className="details-grid">
                    <div>
                        <span className="details-label">
                            From Branch
                        </span>

                        <strong>
                            {transfer.from_branch_name ||
                                transfer.from_branch?.name ||
                                transfer.from_branch ||
                                "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            To Branch
                        </span>

                        <strong>
                            {transfer.to_branch_name ||
                                transfer.to_branch?.name ||
                                transfer.to_branch ||
                                "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Transfer Date
                        </span>

                        <strong>
                            {transfer.transfer_date ||
                                "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Status
                        </span>

                        <strong>
                            {transfer.status ||
                                "-"}
                        </strong>
                    </div>

                    <div>
                        <span className="details-label">
                            Created By
                        </span>

                        <strong>
                            {transfer.created_by_name ||
                                transfer.created_by
                                    ?.username ||
                                transfer.created_by ||
                                "-"}
                        </strong>
                    </div>
                </div>
            </div>

            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h2>
                            Transfer Items
                        </h2>

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
                        No transfer items found.
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
                                </tr>
                            </thead>

                            <tbody>
                                {items.map(
                                    (item) => (
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

export default TransferDetails;