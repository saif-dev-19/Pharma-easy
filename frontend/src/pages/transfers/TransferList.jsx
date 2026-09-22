import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {    getTransfers ,
            approveTransfer,
            rejectTransfer,
        } from "../../api/transferApi";
import { getBranches } from "../../api/branchApi";

import "./TransferList.css";

const TransferList = () => {
    const navigate = useNavigate();
    const user = JSON.parse(
    localStorage.getItem("user") || "null"
    );  

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
            setError(
                "From Date cannot be greater than To Date."
            );
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

    const handleApprove = async (transferId) => {
        const confirmed = window.confirm(
            "Are you sure you want to approve this transfer?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setSearching(true);
            setError("");

            await approveTransfer(transferId);

            await loadTransfers();
        } catch (err) {
            console.error("Approve transfer error:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to approve transfer."
            );
        } finally {
            setSearching(false);
        }
    };

    const handleReject = async (transferId) => {
        const confirmed = window.confirm(
            "Are you sure you want to reject this transfer?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setSearching(true);
            setError("");

            await rejectTransfer(transferId);

            await loadTransfers();
        } catch (err) {
            console.error("Reject transfer error:", err);

            setError(
                err.response?.data?.detail ||
                    "Failed to reject transfer."
            );
        } finally {
            setSearching(false);
        }
    };

    const getStatusClass = (transferStatus) => {
        switch (transferStatus) {
            case "COMPLETED":
                return "transfer-status completed";

            case "CANCELLED":
                return "transfer-status cancelled";

            case "PENDING":
                return "transfer-status pending";

            default:
                return "transfer-status";
        }
    };

    const getStatusLabel = (transferStatus) => {
        switch (transferStatus) {
            case "COMPLETED":
                return "Completed";

            case "CANCELLED":
                return "Cancelled";

            case "PENDING":
                return "Pending";

            default:
                return transferStatus || "Unknown";
        }
    };

    const getItemCount = (transfer) => {
        if (Array.isArray(transfer.items)) {
            return transfer.items.length;
        }

        return transfer.item_count || 0;
    };

    const getBranchName = (branch, fallback) => {
        if (branch?.name) {
            return branch.name;
        }

        if (typeof branch === "string") {
            return branch;
        }

        if (typeof branch === "number") {
            return `Branch #${branch}`;
        }

        return fallback;
    };

    if (loading) {
        return (
            <div className="transfer-page">
                <div className="transfer-loading">
                    <div className="transfer-loading-spinner"></div>

                    <p>
                        Loading transfer history...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="transfer-page">

            {/* ================= HEADER ================= */}

            <div className="transfer-page-header">
                <div className="transfer-title-section">
                    <div className="transfer-title-icon">
                        ⇄
                    </div>

                    <div>
                        <span className="transfer-overline">
                            INVENTORY MANAGEMENT
                        </span>

                        <h1>
                            Stock Transfers
                        </h1>

                        <p>
                            Move medicine stock between
                            pharmacy branches.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="transfer-new-button"
                    onClick={() =>
                        navigate("/transfers/new")
                    }
                >
                    <span className="transfer-button-icon">
                        +
                    </span>

                    New Transfer
                </button>
            </div>

            {/* ================= ERROR ================= */}

            {error && (
                <div className="transfer-error">
                    <div className="transfer-error-icon">
                        !
                    </div>

                    <div>
                        <strong>
                            Something went wrong
                        </strong>

                        <p>{error}</p>
                    </div>
                </div>
            )}

            {/* ================= SUMMARY ================= */}

            <div className="transfer-summary-grid">

                <div className="transfer-summary-card">
                    <div className="summary-icon total">
                        ⇄
                    </div>

                    <div>
                        <span>
                            Total Transfers
                        </span>

                        <strong>
                            {transfers.length}
                        </strong>
                    </div>
                </div>

                <div className="transfer-summary-card">
                    <div className="summary-icon pending">
                        ◷
                    </div>

                    <div>
                        <span>
                            Pending
                        </span>

                        <strong>
                            {
                                transfers.filter(
                                    (item) =>
                                        item.status ===
                                        "PENDING"
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <div className="transfer-summary-card">
                    <div className="summary-icon completed">
                        ✓
                    </div>

                    <div>
                        <span>
                            Completed
                        </span>

                        <strong>
                            {
                                transfers.filter(
                                    (item) =>
                                        item.status ===
                                        "COMPLETED"
                                ).length
                            }
                        </strong>
                    </div>
                </div>

                <div className="transfer-summary-card">
                    <div className="summary-icon cancelled">
                        ×
                    </div>

                    <div>
                        <span>
                            Cancelled
                        </span>

                        <strong>
                            {
                                transfers.filter(
                                    (item) =>
                                        item.status ===
                                        "CANCELLED"
                                ).length
                            }
                        </strong>
                    </div>
                </div>

            </div>

            {/* ================= MAIN CARD ================= */}

            <div className="transfer-main-card">

                {/* CARD HEADER */}

                <div className="transfer-card-header">
                    <div>
                        <span className="transfer-card-label">
                            TRANSFER ACTIVITY
                        </span>

                        <h2>
                            Transfer History
                        </h2>

                        <p>
                            Review and manage stock
                            movement between branches.
                        </p>
                    </div>

                    <div className="transfer-count">
                        {transfers.length}{" "}
                        {transfers.length === 1
                            ? "transfer"
                            : "transfers"}
                    </div>
                </div>

                {/* ================= FILTERS ================= */}

                <div className="transfer-filter-box">

                    <div className="filter-heading">
                        <div className="filter-heading-icon">
                            ≡
                        </div>

                        <div>
                            <strong>
                                Filter Transfers
                            </strong>

                            <span>
                                Narrow down transfer
                                history
                            </span>
                        </div>
                    </div>

                    <div className="transfer-filter-grid">

                        {/* FROM BRANCH */}

                        <div className="transfer-field">
                            <label>
                                From Branch
                            </label>

                            <div className="transfer-input-wrapper">
                                <span className="input-icon">
                                    ↗
                                </span>

                                <select
                                    value={fromBranch}
                                    onChange={(e) =>
                                        setFromBranch(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        All Branches
                                    </option>

                                    {branches.map(
                                        (branch) => (
                                            <option
                                                key={
                                                    branch.id
                                                }
                                                value={
                                                    branch.id
                                                }
                                            >
                                                {
                                                    branch.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* TO BRANCH */}

                        <div className="transfer-field">
                            <label>
                                To Branch
                            </label>

                            <div className="transfer-input-wrapper">
                                <span className="input-icon">
                                    ↙
                                </span>

                                <select
                                    value={toBranch}
                                    onChange={(e) =>
                                        setToBranch(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        All Branches
                                    </option>

                                    {branches.map(
                                        (branch) => (
                                            <option
                                                key={
                                                    branch.id
                                                }
                                                value={
                                                    branch.id
                                                }
                                            >
                                                {
                                                    branch.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        {/* STATUS */}

                        <div className="transfer-field">
                            <label>
                                Status
                            </label>

                            <div className="transfer-input-wrapper">
                                <span className="input-icon">
                                    ●
                                </span>

                                <select
                                    value={status}
                                    onChange={(e) =>
                                        setStatus(
                                            e.target.value
                                        )
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
                        </div>

                        {/* FROM DATE */}

                        <div className="transfer-field">
                            <label>
                                From Date
                            </label>

                            <div className="transfer-input-wrapper">
                                <span className="input-icon">
                                    ▣
                                </span>

                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {/* TO DATE */}

                        <div className="transfer-field">
                            <label>
                                To Date
                            </label>

                            <div className="transfer-input-wrapper">
                                <span className="input-icon">
                                    ▣
                                </span>

                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) =>
                                        setDateTo(
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="transfer-filter-actions">

                            <button
                                type="button"
                                className="transfer-search-button"
                                onClick={handleSearch}
                                disabled={searching}
                            >
                                <span>
                                    ⌕
                                </span>

                                {searching
                                    ? "Searching..."
                                    : "Search"}
                            </button>

                            <button
                                type="button"
                                className="transfer-clear-button"
                                onClick={handleClear}
                                disabled={searching}
                            >
                                Clear
                            </button>

                        </div>

                    </div>
                </div>

                {/* ================= TABLE ================= */}

                <div className="transfer-results-header">
                    <div>
                        <strong>
                            Recent Transfers
                        </strong>

                        <span>
                            Latest stock movement
                            requests
                        </span>
                    </div>
                </div>

                {transfers.length === 0 ? (
                    <div className="transfer-empty">

                        <div className="empty-icon">
                            ⇄
                        </div>

                        <h3>
                            No transfers found
                        </h3>

                        <p>
                            There are no stock transfers
                            matching your current filters.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    "/transfers/new"
                                )
                            }
                        >
                            Create Transfer
                        </button>

                    </div>
                ) : (
                    <div className="transfer-table-wrapper">

                        <table className="transfer-table">

                            <thead>
                                <tr>
                                    <th>
                                        Transfer
                                    </th>

                                    <th>
                                        Route
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Items
                                    </th>

                                    <th>
                                        Status
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

                                            {/* TRANSFER */}

                                            <td>
                                                <div className="transfer-id-cell">

                                                    <div className="transfer-id-icon">
                                                        ⇄
                                                    </div>

                                                    <div>
                                                        <strong>
                                                            Transfer #
                                                            {
                                                                transfer.id
                                                            }
                                                        </strong>

                                                        <span>
                                                            Request
                                                            #{transfer.id}
                                                        </span>
                                                    </div>

                                                </div>
                                            </td>

                                            {/* ROUTE */}

                                            <td>
                                                <div className="transfer-route">

                                                    <span>
                                                        {getBranchName(
                                                            transfer.from_branch_name
                                                                ? {
                                                                      name: transfer.from_branch_name,
                                                                  }
                                                                : transfer.from_branch,
                                                            "-"
                                                        )}
                                                    </span>

                                                    <div className="route-arrow">
                                                        →
                                                    </div>

                                                    <span>
                                                        {getBranchName(
                                                            transfer.to_branch_name
                                                                ? {
                                                                      name: transfer.to_branch_name,
                                                                  }
                                                                : transfer.to_branch,
                                                            "-"
                                                        )}
                                                    </span>

                                                </div>
                                            </td>

                                            {/* DATE */}

                                            <td>
                                                <div className="transfer-date">

                                                    <strong>
                                                        {transfer.transfer_date ||
                                                            "-"}
                                                    </strong>

                                                    <span>
                                                        Transfer date
                                                    </span>

                                                </div>
                                            </td>

                                            {/* ITEMS */}

                                            <td>
                                                <div className="transfer-items">

                                                    <strong>
                                                        {
                                                            getItemCount(
                                                                transfer
                                                            )
                                                        }
                                                    </strong>

                                                    <span>
                                                        {getItemCount(
                                                            transfer
                                                        ) === 1
                                                            ? "item"
                                                            : "items"}
                                                    </span>

                                                </div>
                                            </td>

                                            {/* STATUS */}

                                            <td>
                                                <span
                                                    className={getStatusClass(
                                                        transfer.status
                                                    )}
                                                >
                                                    <span className="status-dot"></span>

                                                    {getStatusLabel(
                                                        transfer.status
                                                    )}
                                                </span>
                                            </td>

                                            {/* ACTION */}

                                            
                                            <td>
                                                        <div className="transfer-action-buttons">

                                                            <button
                                                                type="button"
                                                                className="transfer-view-button"
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/transfers/${transfer.id}`
                                                                    )
                                                                }
                                                            >
                                                                View
                                                                <span>
                                                                    →
                                                                </span>
                                                            </button>

                                                            {transfer.status === "PENDING" &&
                                                                (
                                                                    user?.role === "ADMIN" ||
                                                                    (
                                                                        user?.role === "MANAGER" &&
                                                                        Number(user?.branch_id) ===
                                                                            Number(transfer.to_branch)
                                                                    )
                                                                ) && (
                                                                    <div className="transfer-decision-buttons">

                                                                        <button
                                                                            type="button"
                                                                            className="transfer-approve-button"
                                                                            onClick={() =>
                                                                                handleApprove(
                                                                                    transfer.id
                                                                                )
                                                                            }
                                                                            disabled={searching}
                                                                        >
                                                                            ✓ Approve
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            className="transfer-reject-button"
                                                                            onClick={() =>
                                                                                handleReject(
                                                                                    transfer.id
                                                                                )
                                                                            }
                                                                            disabled={searching}
                                                                        >
                                                                            × Reject
                                                                        </button>

                                                                    </div>
                                                                )}

                                                        </div>
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