import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuItems = [
        {
            label: "Dashboard",
            path: "/dashboard",
            roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
            label: "Medicines",
            path: "/medicines",
            roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
            label: "Batches",
            path: "/batches",
            roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
            label: "Inventory",
            path: "/inventory",
            roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
            label: "Sales / POS",
            path: "/sales",
            roles: ["ADMIN", "MANAGER", "STAFF"],
        },
        {
            label: "Purchases",
            path: "/purchases",
            roles: ["ADMIN", "MANAGER"],
        },
        {
            label: "Suppliers",
            path: "/suppliers",
            roles: ["ADMIN", "MANAGER"],
        },
        {
            label: "Transfers",
            path: "/transfers",
            roles: ["ADMIN", "MANAGER"],
        },
        {
            label: "Branches",
            path: "/branches",
            roles: ["ADMIN"],
        },
        {
            label: "Users",
            path: "/users",
            roles: ["ADMIN"],
        },
    ];

    const visibleItems = menuItems.filter((item) =>
        item.roles.includes(user?.role)
    );

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <h2>Pharma Easy</h2>
                <p>Manage your Pharmacy Easily</p>
            </div>

            <div className="sidebar-user-info">
                <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Name</span>
                    <span className="sidebar-info-value">
                        {user?.username || "-"}
                    </span>
                </div>

                <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Role</span>
                    <span className="sidebar-info-value">
                        {user?.role || "-"}
                    </span>
                </div>

                <div className="sidebar-info-item">
                    <span className="sidebar-info-label">Branch</span>
                    <span className="sidebar-info-value">
                        {user?.branch_name || "All Branches"}
                    </span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {visibleItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <button
                className="logout-button"
                onClick={logout}
            >
                Logout
            </button>
        </aside>
    );
};

export default Sidebar;