/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    getMedicines,
    deleteMedicine,
} from "../../api/medicineApi";
import { useAuth } from "../../context/AuthContext";

const MedicineList = () => {
    const { user } = useAuth();

    const [medicines, setMedicines] = useState([]);
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchMedicines = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            if (activeFilter !== "") {
                params.is_active = activeFilter;
            }

            const data = await getMedicines(params);

            setMedicines(data.results || data);
        } catch (error) {
            console.error("Medicine Error:", error);

            setError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to load medicines."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFilter]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchMedicines();
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this medicine?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteMedicine(id);
            fetchMedicines();
        } catch (error) {
            console.error("Delete Error:", error);

            alert(
                error.response?.data?.detail ||
                "Failed to delete medicine."
            );
        }
    };

    return (
        <div className="medicine-page">

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Medicines</h2>
                    <p>Manage your pharmacy medicines</p>
                </div>

                {user?.role === "ADMIN" && (
                    <Link
                        to="/medicines/new"
                        className="primary-button"
                    >
                        + Add Medicine
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="filter-card">
                <form
                    className="medicine-filters"
                    onSubmit={handleSearch}
                >
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Search medicine, generic name or manufacturer..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        <button type="submit">
                            Search
                        </button>
                    </div>

                    <select
                        value={activeFilter}
                        onChange={(e) =>
                            setActiveFilter(e.target.value)
                        }
                    >
                        <option value="">All Medicines</option>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                    </select>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div className="page-error">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="data-card">

                <div className="data-card-header">
                    <div>
                        <h3>Medicine List</h3>
                        <span>
                            {medicines.length} medicine
                            {medicines.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="page-loading">
                        Loading medicines...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Generic Name</th>
                                    <th>Strength</th>
                                    <th>Dosage Form</th>
                                    <th>Manufacturer</th>
                                    <th>Status</th>
                                    <th>Details</th>

                                    {user?.role === "ADMIN" && (
                                        
                                        <th>Actions</th>
                                    )}
                                </tr>
                            </thead>

                            <tbody>
                                {medicines.length > 0 ? (
                                    medicines.map((medicine) => (
                                        <tr key={medicine.id}>
                                            <td>
                                                {medicine.image ? (
                                                    <img
                                                        src={medicine.image}
                                                        alt={medicine.name}
                                                        style={{
                                                            width: "50px",
                                                            height: "50px",
                                                            objectFit: "cover",
                                                            borderRadius: "8px",
                                                        }}
                                                    />
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td>
                                                <strong>
                                                    {medicine.name}
                                                </strong>
                                            </td>

                                            <td>
                                                {medicine.generic_name ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {medicine.strength ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {medicine.dosage_form ||
                                                    "-"}
                                            </td>

                                            <td>
                                                {medicine.manufacturer ||
                                                    "-"}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        medicine.is_active
                                                            ? "status-active"
                                                            : "status-inactive"
                                                    }
                                                >
                                                    {medicine.is_active
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>
                                            </td>

                                            <td>
                                                <Link
                                                    to={`/medicines/${medicine.id}`}
                                                    className="secondary-button"
                                                >
                                                    Details
                                                </Link>
                                            </td>

                                            {user?.role === "ADMIN" && (
                                                <td>
                                                    <div className="action-buttons">

                                                        <Link
                                                            to={`/medicines/${medicine.id}/edit`}
                                                            className="edit-button"
                                                        >
                                                            Edit
                                                        </Link>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    medicine.id
                                                                )
                                                            }
                                                            className="delete-button"
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
                                                    ? 9
                                                    : 8
                                            }
                                            className="empty-state"
                                        >
                                            No medicines found.
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

export default MedicineList;