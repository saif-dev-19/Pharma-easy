import { useEffect, useState } from "react";
import { getInventory } from "../../api/inventoryApi";

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [search, setSearch] = useState("");
    const [stockFilter, setStockFilter] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchInventory = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (search.trim()) {
                params.search = search.trim();
            }

            const data = await getInventory(params);

            setInventory(data.results || data);
        } catch (error) {
            console.error("Inventory Error:", error);

            setError(
                error.response?.data?.detail ||
                error.response?.data?.message ||
                "Failed to load inventory."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchInventory();
    };

    const getStockStatus = (item) => {
        if (item.quantity === 0) {
            return {
                label: "Out of Stock",
                className: "status-inactive",
            };
        }

        if (item.quantity <= item.minimum_stock) {
            return {
                label: "Low Stock",
                className: "stock-warning",
            };
        }

        return {
            label: "In Stock",
            className: "status-active",
        };
    };

    const getMedicineName = (item) => {
        return (
            item.batch?.medicine?.name ||
            item.batch?.medicine_name ||
            item.medicine_name ||
            "-"
        );
    };

    const getBatchNumber = (item) => {
        return item.batch?.batch_number || item.batch_number || "-";
    };

    const getExpiryDate = (item) => {
        return item.batch?.expiry_date || item.expiry_date || "-";
    };

    const isExpired = (date) => {
        if (!date || date === "-") return false;

        return new Date(date) < new Date();
    };

    const filteredInventory = inventory.filter((item) => {
        const status = getStockStatus(item);

        if (
            stockFilter === "low" &&
            status.label !== "Low Stock"
        ) {
            return false;
        }

        if (
            stockFilter === "out" &&
            status.label !== "Out of Stock"
        ) {
            return false;
        }

        if (
            stockFilter === "available" &&
            status.label !== "In Stock"
        ) {
            return false;
        }

        return true;
    });

    return (
        <div className="inventory-page">
            <div className="page-header">
                <div>
                    <h2>Inventory</h2>
                    <p>
                        Monitor medicine stock across your pharmacy
                    </p>
                </div>
            </div>

            <div className="filter-card">
                <form
                    className="medicine-filters"
                    onSubmit={handleSearch}
                >
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Search medicine or batch..."
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
                        value={stockFilter}
                        onChange={(e) =>
                            setStockFilter(e.target.value)
                        }
                    >
                        <option value="">
                            All Stock
                        </option>
                        <option value="available">
                            In Stock
                        </option>
                        <option value="low">
                            Low Stock
                        </option>
                        <option value="out">
                            Out of Stock
                        </option>
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
                        <h3>Stock Inventory</h3>
                        <span>
                            {filteredInventory.length} item
                            {filteredInventory.length !== 1
                                ? "s"
                                : ""}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="page-loading">
                        Loading inventory...
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Medicine</th>
                                    <th>Batch Number</th>
                                    <th>Expiry Date</th>
                                    <th>Stock</th>
                                    <th>Minimum Stock</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredInventory.length > 0 ? (
                                    filteredInventory.map((item) => {
                                        const stockStatus =
                                            getStockStatus(item);

                                        const expired =
                                            isExpired(
                                                getExpiryDate(item)
                                            );

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>
                                                        {getMedicineName(
                                                            item
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <code>
                                                        {getBatchNumber(
                                                            item
                                                        )}
                                                    </code>
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            expired
                                                                ? "status-inactive"
                                                                : ""
                                                        }
                                                    >
                                                        {getExpiryDate(
                                                            item
                                                        )}
                                                    </span>

                                                    {expired && (
                                                        <span className="expiry-label">
                                                            Expired
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    <strong
                                                        className={
                                                            item.quantity ===
                                                            0
                                                                ? "stock-zero"
                                                                : item.quantity <=
                                                                  item.minimum_stock
                                                                ? "stock-low"
                                                                : "stock-good"
                                                        }
                                                    >
                                                        {item.quantity}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        item.minimum_stock
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            stockStatus.className
                                                        }
                                                    >
                                                        {
                                                            stockStatus.label
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {item.updated_at
                                                        ? new Date(
                                                              item.updated_at
                                                          ).toLocaleDateString(
                                                              "en-BD"
                                                          )
                                                        : "-"}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="empty-state"
                                        >
                                            No inventory items
                                            found.
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

export default Inventory;