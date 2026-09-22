/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getMedicines,
    deleteMedicine,
} from "../../api/medicineApi";

import { useAuth } from "../../context/AuthContext";

import "./MedicineList.css";

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

            {/* Page Header */}
            <div className="medicine-header">
                <div className="medicine-header-content">
                    <span className="medicine-eyebrow">
                        PHARMACY CATALOG
                    </span>

                    <h1>Medicines</h1>

                    <p>
                        Manage and organize your pharmacy medicine catalog.
                    </p>
                </div>

                {user?.role === "ADMIN" && (
                    <Link
                        to="/medicines/new"
                        className="medicine-add-button"
                    >
                        <span>+</span>
                        Add Medicine
                    </Link>
                )}
            </div>

            {/* Search / Filters */}
            <div className="medicine-toolbar">
                <form
                    className="medicine-search-form"
                    onSubmit={handleSearch}
                >
                    <div className="medicine-search-box">
                        <span className="medicine-search-icon">
                            ⌕
                        </span>

                        <input
                            type="text"
                            placeholder="Search medicine, generic name or manufacturer..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                className="medicine-search-clear"
                                onClick={() => setSearch("")}
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <select
                        value={activeFilter}
                        onChange={(e) =>
                            setActiveFilter(e.target.value)
                        }
                        className="medicine-status-filter"
                    >
                        <option value="">
                            All Medicines
                        </option>

                        <option value="true">
                            Active
                        </option>

                        <option value="false">
                            Inactive
                        </option>
                    </select>

                    <button
                        type="submit"
                        className="medicine-search-button"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Error */}
            {error && (
                <div className="medicine-error">
                    <span>!</span>
                    {error}
                </div>
            )}

            {/* Catalog Header */}
            <div className="medicine-catalog-header">
                <div>
                    <h2>Medicine Catalog</h2>

                    <p>
                        Browse all available medicines
                    </p>
                </div>

                <div className="medicine-count">
                    <strong>{medicines.length}</strong>
                    <span>
                        {medicines.length === 1
                            ? " medicine"
                            : " medicines"}
                    </span>
                </div>
            </div>

            {/* Loading */}
            {loading ? (
                <div className="medicine-loading">
                    <div className="medicine-loading-spinner"></div>

                    <p>Loading medicines...</p>
                </div>
            ) : medicines.length > 0 ? (

                /* Medicine Grid */
                <div className="medicine-grid">

                    {medicines.map((medicine) => (
                        <div
                            className="medicine-card"
                            key={medicine.id}
                        >

                            {/* Image */}
                            <div className="medicine-card-image">

                                {medicine.image ? (
                                    <img
                                        src={medicine.image}
                                        alt={medicine.name}
                                    />
                                ) : (
                                    <div className="medicine-image-placeholder">
                                        <span>+</span>
                                    </div>
                                )}

                                <span
                                    className={
                                        medicine.is_active
                                            ? "medicine-status active"
                                            : "medicine-status inactive"
                                    }
                                >
                                    <span className="status-dot"></span>

                                    {medicine.is_active
                                        ? "Active"
                                        : "Inactive"}
                                </span>
                            </div>

                            {/* Card Content */}
                            <div className="medicine-card-content">

                                <div className="medicine-card-title">
                                    <h3>
                                        {medicine.name}
                                    </h3>

                                    <span>
                                        {medicine.strength || "—"}
                                    </span>
                                </div>

                                <p className="medicine-generic">
                                    {medicine.generic_name ||
                                        "Generic name not available"}
                                </p>

                                <div className="medicine-info-list">

                                    <div className="medicine-info-item">
                                        <span>
                                            Dosage Form
                                        </span>

                                        <strong>
                                            {medicine.dosage_form ||
                                                "—"}
                                        </strong>
                                    </div>

                                    <div className="medicine-info-item">
                                        <span>
                                            Manufacturer
                                        </span>

                                        <strong
                                            title={
                                                medicine.manufacturer ||
                                                "—"
                                            }
                                        >
                                            {medicine.manufacturer ||
                                                "—"}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                            {/* Card Actions */}
                            <div className="medicine-card-actions">

                                <Link
                                    to={`/medicines/${medicine.id}`}
                                    className="medicine-details-button"
                                >
                                    View Details
                                </Link>

                                {user?.role === "ADMIN" && (
                                    <>
                                        <Link
                                            to={`/medicines/${medicine.id}/edit`}
                                            className="medicine-edit-button"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleDelete(
                                                    medicine.id
                                                )
                                            }
                                            className="medicine-delete-button"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}

                            </div>

                        </div>
                    ))}

                </div>

            ) : (

                /* Empty State */
                <div className="medicine-empty">

                    <div className="medicine-empty-icon">
                        +
                    </div>

                    <h3>No medicines found</h3>

                    <p>
                        Try changing your search or filter,
                        or add a new medicine.
                    </p>

                    {user?.role === "ADMIN" && (
                        <Link
                            to="/medicines/new"
                            className="medicine-empty-button"
                        >
                            Add Medicine
                        </Link>
                    )}

                </div>
            )}

        </div>
    );
};

export default MedicineList;