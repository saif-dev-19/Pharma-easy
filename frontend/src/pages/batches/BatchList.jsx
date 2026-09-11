import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBatches, deleteBatch, getBatchQR } from "../../api/batchApi";
import { useAuth } from "../../context/AuthContext";

const BatchList = () => {
    const { user } = useAuth();

    const [batches, setBatches] = useState([]);
    const [search, setSearch] = useState("");
    const [expiryFilter, setExpiryFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBatches = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            if (expiryFilter !== "") {
                params.expired = expiryFilter;
            }

            const data = await getBatches(params);

            setBatches(data.results || data);
        } catch (error) {
            console.error("Batch Error:", error);

            setError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to load batches."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBatches();
    }, [expiryFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchBatches();
    };

    const handleShowQR = async (batch) => {
    try {
        const data = await getBatchQR(batch.id);

        window.open(data.qr_image, "_blank");
    } catch (error) {
        console.error("QR Error:", error);

        alert(
            error.response?.data?.detail ||
            "Failed to load QR code."
        );
    }
};

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this batch?"
        );

        if (!confirmed) return;

        try {
            await deleteBatch(id);
            fetchBatches();
        } catch (error) {
            console.error("Delete Batch Error:", error);

            alert(
                error.response?.data?.detail ||
                "Failed to delete batch."
            );
        }
    };

    const isExpired = (expiryDate) => {
        return new Date(expiryDate) < new Date();
    };

    return (
        <div className="medicine-page">
            <div className="page-header">
                <div>
                    <h2>Batches</h2>
                    <p>Manage medicine batches and expiry information</p>
                </div>

                {user?.role === "ADMIN" && (
                    <Link
                        to="/batches/new"
                        className="primary-button"
                    >
                        + Add Batch
                    </Link>
                )}
            </div>

            <div className="filter-card">
                <form
                    className="medicine-filters"
                    onSubmit={handleSearch}
                >
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Search batch number or medicine..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <button type="submit">
                            Search
                        </button>
                    </div>

                    <select
                        value={expiryFilter}
                        onChange={(e) =>
                            setExpiryFilter(e.target.value)
                        }
                    >
                        <option value="">All Batches</option>
                        <option value="false">Valid Batches</option>
                        <option value="true">Expired Batches</option>
                    </select>
                </form>
            </div>

            {error && (
                <div className="page-error">
                    {error}
                </div>
            )}

            <div className="data-card">
                <div className="data-card-header">
                    <div>
                        <h3>Batch List</h3>
                        <span>
                            {batches.length} batch
                            {batches.length !== 1 ? "es" : ""}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="page-loading">
                        Loading batches...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Batch Number</th>
                                    <th>Expiry Date</th>
                                    <th>Pack Size</th>
                                    <th>Purchase Price</th>
                                    <th>Selling Price</th>
                                    <th>QR Code</th>
                                    {user?.role === "ADMIN" && (
                                        <th>Actions</th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {batches.length > 0 ? (
                                    batches.map((batch) => (
                                        <tr key={batch.id}>
                                            <td>
                                                <strong>
                                                    {batch.medicine_name ||
                                                        batch.medicine}
                                                </strong>
                                            </td>

                                            <td>
                                                {batch.batch_number}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        isExpired(
                                                            batch.expiry_date
                                                        )
                                                            ? "status-inactive"
                                                            : "status-active"
                                                    }
                                                >
                                                    {batch.expiry_date}
                                                </span>
                                            </td>

                                            <td>
                                                {batch.pack_size}
                                            </td>

                                            <td>
                                                ৳ {batch.purchase_price}
                                            </td>

                                            <td>
                                                ৳ {batch.selling_price}
                                            </td>

                                            <td>
                                                <div className="qr-cell">
                                                    <code>{batch.qr_code}</code>

                                                    <button
                                                        type="button"
                                                        className="qr-button"
                                                        onClick={() => handleShowQR(batch)}
                                                    >
                                                        View QR
                                                    </button>
                                                </div>
                                            </td>

                                            {user?.role === "ADMIN" && (
                                                <td>
                                                    <div className="action-buttons">
                                                        <Link
                                                            to={`/batches/${batch.id}/edit`}
                                                            className="edit-button"
                                                        >
                                                            Edit
                                                        </Link>

                                                        <button
                                                            className="delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    batch.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={
                                                user?.role === "ADMIN"
                                                    ? 8
                                                    : 7
                                            }
                                            className="empty-state"
                                        >
                                            No batches found.
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

export default BatchList;