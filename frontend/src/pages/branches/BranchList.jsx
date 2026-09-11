import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBranches, deleteBranch } from "../../api/branchApi";

function BranchList() {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchBranches = async () => {
        try {
            setLoading(true);
            const data = await getBranches();

            setBranches(data.results || data);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.detail ||
                "Failed to load branches."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this branch?"
        );

        if (!confirmed) return;

        try {
            await deleteBranch(id);
            fetchBranches();
        } catch (err) {
            alert(
                err.response?.data?.detail ||
                "Failed to delete branch."
            );
        }
    };

    if (loading) {
        return <div className="page-loading">Loading branches...</div>;
    }

    if (error) {
        return <div className="page-error">{error}</div>;
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Branches</h1>
                    <p>Manage pharmacy branches</p>
                </div>

                <Link
                    to="/branches/new"
                    className="primary-button"
                >
                    + Add Branch
                </Link>
            </div>

            <div className="data-card">

                <div className="data-card-header">
                    <h2>Branch List</h2>
                    <span>
                        {branches.length} branch
                        {branches.length !== 1 ? "es" : ""}
                    </span>
                </div>

                {branches.length === 0 ? (
                    <div className="empty-state">
                        No branches found.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Address</th>
                                    <th>Phone</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {branches.map((branch) => (
                                    <tr key={branch.id}>
                                        <td>
                                            <strong>
                                                {branch.name}
                                            </strong>
                                        </td>

                                        <td>
                                            {branch.address || "-"}
                                        </td>

                                        <td>
                                            {branch.phone || "-"}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    branch.is_active
                                                        ? "status-active"
                                                        : "status-inactive"
                                                }
                                            >
                                                {branch.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">
                                                <Link
                                                    to={`/branches/${branch.id}/edit`}
                                                    className="edit-button"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            branch.id
                                                        )
                                                    }
                                                >
                                                    Delete
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
}

export default BranchList;