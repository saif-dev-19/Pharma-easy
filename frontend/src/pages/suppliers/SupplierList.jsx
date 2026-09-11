import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getSuppliers,
    deleteSupplier,
} from "../../api/supplierApi";
import { useAuth } from "../../context/AuthContext";

const SupplierList = () => {
    const { user } = useAuth();

    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            const data = await getSuppliers(params);

            setSuppliers(data.results || data);
            console.log("SUPPLIERS:", data);
        } catch (error) {
            console.error("Supplier Error:", error);

            setError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to load suppliers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchSuppliers();
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this supplier?"
        );

        if (!confirmed) return;

        try {
            await deleteSupplier(id);
            fetchSuppliers();
        } catch (error) {
            console.error("Delete Supplier Error:", error);

            alert(
                error.response?.data?.detail ||
                "Failed to delete supplier."
            );
        }
    };

    return (
        <div className="supplier-page">
            <div className="page-header">
                <div>
                    <h2>Suppliers</h2>
                    <p>Manage your pharmacy suppliers</p>
                </div>

                {(user?.role === "ADMIN" ||
                    user?.role === "MANAGER") && (
                    <Link
                        to="/suppliers/new"
                        className="primary-button"
                    >
                        + Add Supplier
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
                            placeholder="Search supplier, company or phone..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        <button type="submit">
                            Search
                        </button>
                    </div>
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
                        <h3>Supplier List</h3>
                        <span>
                            {suppliers.length} supplier
                            {suppliers.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="page-loading">
                        Loading suppliers...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Company</th>
                                    <th>Phone</th>
                                    <th>Address</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {suppliers.length > 0 ? (
                                    suppliers.map((supplier) => (
                                        <tr key={supplier.id}>
                                            <td>
                                                <strong>
                                                    {supplier.name}
                                                </strong>
                                            </td>

                                            <td>
                                                {supplier.company_name ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {supplier.phone}
                                            </td>

                                            <td>
                                                {supplier.address ||
                                                    "-"}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        supplier.is_active
                                                            ? "status-active"
                                                            : "status-inactive"
                                                    }
                                                >
                                                    {supplier.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td>
                                                {(user?.role ===
                                                    "ADMIN" ||
                                                    user?.role ===
                                                        "MANAGER") && (
                                                    <div className="action-buttons">
                                                        <Link
                                                            to={`/suppliers/${supplier.id}/edit`}
                                                            className="edit-button"
                                                        >
                                                            Edit
                                                        </Link>

                                                        <button
                                                            className="delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    supplier.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            className="empty-state"
                                        >
                                            No suppliers found.
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

export default SupplierList;