import { useEffect, useState } from "react";
import { getDashboard } from "../../api/dashboardApi";

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const data = await getDashboard();
                setDashboard(data);
            } catch (error) {
                console.error("Dashboard Error:", error);

                setError(
                    error.response?.data?.detail ||
                    error.response?.data?.message ||
                    "Failed to load dashboard data."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="loading-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <h3>Unable to load dashboard</h3>
                <p>{error}</p>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        return `৳ ${Number(amount || 0).toLocaleString("en-BD")}`;
    };

    return (
        <div className="dashboard">
            {/* Page Header */}
            <div className="dashboard-header">
                <div>
                    <h2>Overview</h2>
                    <p>Monitor your pharmacy business at a glance</p>
                </div>

                <div className="today-badge">
                    <span className="today-dot"></span>
                    Today
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">

                <div className="stat-card blue-card">
                    <div className="stat-card-top">
                        <div className="stat-icon blue-icon">
                            <span>⌂</span>
                        </div>
                        <span className="stat-label">Branches</span>
                    </div>

                    <div className="stat-value">
                        {dashboard.total_branches}
                    </div>

                    <p className="stat-description">
                        Active pharmacy branches
                    </p>
                </div>

                <div className="stat-card purple-card">
                    <div className="stat-card-top">
                        <div className="stat-icon purple-icon">
                            <span>+</span>
                        </div>
                        <span className="stat-label">Medicines</span>
                    </div>

                    <div className="stat-value">
                        {dashboard.total_medicines}
                    </div>

                    <p className="stat-description">
                        Active medicines
                    </p>
                </div>

                <div className="stat-card green-card">
                    <div className="stat-card-top">
                        <div className="stat-icon green-icon">
                            <span>▣</span>
                        </div>
                        <span className="stat-label">Total Stock</span>
                    </div>

                    <div className="stat-value">
                        {dashboard.total_stock_quantity}
                    </div>

                    <p className="stat-description">
                        Units currently available
                    </p>
                </div>

                <div className="stat-card orange-card">
                    <div className="stat-card-top">
                        <div className="stat-icon orange-icon">
                            <span>৳</span>
                        </div>
                        <span className="stat-label">Today's Sales</span>
                    </div>

                    <div className="stat-value currency-value">
                        {formatCurrency(dashboard.today_sales_amount)}
                    </div>

                    <p className="stat-description">
                        {dashboard.today_sales_count} transactions today
                    </p>
                </div>

            </div>

            {/* Middle Section */}
            <div className="dashboard-middle">

                {/* Sales Summary */}
                <div className="dashboard-panel sales-summary">
                    <div className="panel-header">
                        <div>
                            <h3>Sales Overview</h3>
                            <p>Today's sales performance</p>
                        </div>

                        <div className="sales-icon">
                            ৳
                        </div>
                    </div>

                    <div className="sales-main">
                        <span>Total Sales</span>
                        <strong>
                            {formatCurrency(dashboard.today_sales_amount)}
                        </strong>
                    </div>

                    <div className="sales-divider"></div>

                    <div className="sales-footer">
                        <div>
                            <span>Transactions</span>
                            <strong>{dashboard.today_sales_count}</strong>
                        </div>

                        <div>
                            <span>Average Sale</span>
                            <strong>
                                {formatCurrency(
                                    dashboard.today_sales_count
                                        ? dashboard.today_sales_amount /
                                              dashboard.today_sales_count
                                        : 0
                                )}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Inventory Health */}
                <div className="dashboard-panel inventory-health">
                    <div className="panel-header">
                        <div>
                            <h3>Inventory Health</h3>
                            <p>Current stock condition</p>
                        </div>

                        <div className="inventory-icon">
                            ✓
                        </div>
                    </div>

                    <div className="health-item">
                        <div className="health-left">
                            <div className="health-dot warning-dot"></div>

                            <div>
                                <strong>Low Stock</strong>
                                <span>Items need restocking</span>
                            </div>
                        </div>

                        <strong className="health-number warning-number">
                            {dashboard.low_stock_count}
                        </strong>
                    </div>

                    <div className="health-item">
                        <div className="health-left">
                            <div className="health-dot danger-dot"></div>

                            <div>
                                <strong>Expired Stock</strong>
                                <span>Expired items in inventory</span>
                            </div>
                        </div>

                        <strong className="health-number danger-number">
                            {dashboard.expired_stock_count}
                        </strong>
                    </div>
                </div>

            </div>

            {/* Recent Sales */}
            <div className="dashboard-panel recent-sales">
                <div className="panel-header">
                    <div>
                        <h3>Recent Sales</h3>
                        <p>Latest transactions from your pharmacy</p>
                    </div>

                    <div className="sales-count">
                        {dashboard.recent_sales.length} Recent
                    </div>
                </div>

                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>Invoice</th>
                                <th>Branch</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Paid</th>
                                <th>Due</th>
                            </tr>
                        </thead>

                        <tbody>
                            {dashboard.recent_sales.length > 0 ? (
                                dashboard.recent_sales.map((sale) => (
                                    <tr key={sale.id}>
                                        <td>
                                            <strong className="invoice-number">
                                                {sale.invoice_number}
                                            </strong>
                                        </td>

                                        <td>
                                            <span className="branch-badge">
                                                {sale.branch}
                                            </span>
                                        </td>

                                        <td>{sale.sale_date}</td>

                                        <td className="amount-cell">
                                            {formatCurrency(sale.total_amount)}
                                        </td>

                                        <td className="paid-cell">
                                            {formatCurrency(sale.paid_amount)}
                                        </td>

                                        <td>
                                            <span
                                                className={
                                                    Number(sale.due_amount) > 0
                                                        ? "due-badge"
                                                        : "paid-badge"
                                                }
                                            >
                                                {formatCurrency(sale.due_amount)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-sales">
                                        No recent sales found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;