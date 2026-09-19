import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getTransfers } from "../../api/transferApi";
import { getBranches } from "../../api/branchApi";


const TransferList = () => {
    const navigate = useNavigate();

    const [transfers, setTransfers] = useState([]);
    const [branches, setBranches] = useState([]);

    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState("");

    const [fromBranch, setFromBranch] = useState("");
    const [toBranch, setToBranch] = useState("");
    const [status, setStatus] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const loadBranches = async () => {
        try {
            const data = await getBranches();

            setBranches(
                Array.isArray(data)
                    ? data
                    : data.results || []
            );
        } catch (err) {
            console.error("Branch error:", err);

            setError(
                err.response?.data?.detail ||
                "Failed to load branches."
            );
        }
    };

    const loadTransfers = async (filters = {}) => {
        try {
            setError("");

            const data = await getTransfers(filters);

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
        }
    };

    useEffect(() => {
        const initialLoad = async () => {
            try {
                setLoading(true);

                await Promise.all([
                    loadBranches(),
                    loadTransfers(),
                ]);
            } finally {
                setLoading(false);
            }
        };

        initialLoad();
    }, []);

    const handleSearch = async () => {
        if (dateFrom && dateTo && dateFrom > dateTo) {
            setError("From Date cannot be greater than To Date.");
            return;
        }

        try {
            setSearching(true);
            setError("");

            await loadTransfers({
                ...(fromBranch && {
                    from_branch: fromBranch,
                }),
                ...(toBranch && {
                    to_branch: toBranch,
                }),
                ...(status && {
                    status,
                }),
                ...(dateFrom && {
                    date_from: dateFrom,
                }),
                ...(dateTo && {
                    date_to: dateTo,
                }),
            });
        } finally {
            setSearching(false);
        }
    };

    const handleClear = async () => {
        setFromBranch("");
        setToBranch("");
        setStatus("");
        setDateFrom("");
        setDateTo("");

        try {
            setSearching(true);
            setError("");

            await loadTransfers();
        } finally {
            setSearching(false);
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                Loading transfers...
            </div>
        );
    }

    return (
        <div className="page-container">
            {/* Header */}
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
                    onClick={() => navigate("/transfers/new")}
                >
                    New Transfer
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="page-error">
                    {error}
                </div>
            )}

            {/* Main Card */}
            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h2>Transfer History</h2>
                        <p>
                            {transfers.length} transfer
                            {transfers.length !== 1 ? "s" : ""} found
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="transfer-filter">
                    {/* From Branch */}
                    <div className="transfer-filter-field">
                        <label htmlFor="fromBranch">
                            From Branch
                        </label>

                        <select
                            id="fromBranch"
                            value={fromBranch}
                            onChange={(e) =>
                                setFromBranch(e.target.value)
                            }
                        >
                            <option value="">
                                All Branches
                            </option>

                            {branches.map((branch) => (
                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* To Branch */}
                    <div className="transfer-filter-field">
                        <label htmlFor="toBranch">
                            To Branch
                        </label>

                        <select
                            id="toBranch"
                            value={toBranch}
                            onChange={(e) =>
                                setToBranch(e.target.value)
                            }
                        >
                            <option value="">
                                All Branches
                            </option>

                            {branches.map((branch) => (
                                <option
                                    key={branch.id}
                                    value={branch.id}
                                >
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div className="transfer-filter-field">
                        <label htmlFor="transferStatus">
                            Status
                        </label>

                        <select
                            id="transferStatus"
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                        >
                            <option value="">
                                All Status
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                            <option value="CANCELLED">
                                Cancelled
                            </option>
                        </select>
                    </div>

                    {/* From Date */}
                    <div className="transfer-filter-field">
                        <label htmlFor="transferDateFrom">
                            From Date
                        </label>

                        <input
                            id="transferDateFrom"
                            type="date"
                            value={dateFrom}
                            onChange={(e) =>
                                setDateFrom(e.target.value)
                            }
                        />
                    </div>

                    {/* To Date */}
                    <div className="transfer-filter-field">
                        <label htmlFor="transferDateTo">
                            To Date
                        </label>

                        <input
                            id="transferDateTo"
                            type="date"
                            value={dateTo}
                            onChange={(e) =>
                                setDateTo(e.target.value)
                            }
                        />
                    </div>

                    {/* Actions */}
                    <div className="transfer-filter-actions">
                        <button
                            type="button"
                            className="primary-button"
                            onClick={handleSearch}
                            disabled={searching}
                        >
                            {searching
                                ? "Searching..."
                                : "Search"}
                        </button>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={handleClear}
                            disabled={searching}
                        >
                            Clear
                        </button>
                    </div>
                </div>

                {/* Results */}
                {transfers.length === 0 ? (
                    <div className="empty-state">
                        No transfers found.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>From Branch</th>
                                    <th>To Branch</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Items</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {transfers.map((transfer) => (
                                    <tr key={transfer.id}>
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
                                            {transfer.transfer_date || "-"}
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
                                                {transfer.status || "-"}
                                            </span>
                                        </td>

                                        <td>
                                            {Array.isArray(
                                                transfer.items
                                            )
                                                ? transfer.items.length
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferList;