/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers, deleteUser } from "../../api/userApi";

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        try {
            setLoading(true);

            const data = await getUsers();

            setUsers(data.results || data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Failed to load users."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this user?"
        );

        if (!confirmed) return;

        try {
            await deleteUser(id);
            fetchUsers();
        } catch (err) {
            alert(
                err.response?.data?.detail ||
                "Failed to delete user."
            );
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                Loading users...
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-error">
                {error}
            </div>
        );
    }

    return (
        <div className="page-container">

            <div className="page-header">
                <div>
                    <h1>Users</h1>
                    <p>Manage pharmacy staff and managers</p>
                </div>

                <Link
                    to="/users/new"
                    className="primary-button"
                >
                    + Add User
                </Link>
            </div>

            <div className="data-card">

                <div className="data-card-header">
                    <h2>User List</h2>

                    <span>
                        {users.length} user
                        {users.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {users.length === 0 ? (
                    <div className="empty-state">
                        No users found.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="data-table">

                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Branch</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>

                                        <td>
                                            <strong>
                                                {user.username}
                                            </strong>
                                        </td>

                                        <td>
                                            {user.email || "-"}
                                        </td>

                                        <td>
                                            <span
                                                className={`user-role ${
                                                    user.role?.toLowerCase() || ""
                                                }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>

                                        <td>
                                            {user.branch_name || "-"}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    user.is_active
                                                        ? "status-active"
                                                        : "status-inactive"
                                                }
                                            >
                                                {user.is_active
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="action-buttons">

                                                <Link
                                                    to={`/users/${user.id}/edit`}
                                                    className="edit-button"
                                                >
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDelete(user.id)
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

export default UserList;