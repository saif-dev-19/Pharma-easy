import { useEffect, useState } from "react";

import { getDashboard } from "../../api/dashboardApi";

import "./Dashboard.css";


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


    const formatCurrency = (amount) => {
        return `৳ ${Number(amount || 0).toLocaleString("en-BD")}`;
    };


    if (loading) {
        return (
            <div className="dashboard-state">
                <div className="dashboard-loader"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }


    if (error) {
        return (
            <div className="dashboard-state dashboard-state-error">
                <div className="state-icon">!</div>

                <h3>Unable to load dashboard</h3>

                <p>{error}</p>
            </div>
        );
    }


    const recentSales = dashboard?.recent_sales || [];

    const totalSales =
        dashboard?.total_sales_amount ??
        dashboard?.total_sales ??
        0;

    const todaySales = dashboard?.today_sales_amount || 0;

    const todayTransactions =
        dashboard?.today_sales_count || 0;

    const averageSale = todayTransactions
        ? todaySales / todayTransactions
        : 0;


    return (
        <div className="dashboard">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="dashboard-topbar">

                <div>
                    <span className="dashboard-eyebrow">
                        PHARMACY MANAGEMENT
                    </span>

                    <h1>Dashboard</h1>

                    <p>
                        Monitor your pharmacy operations and sales
                        performance.
                    </p>
                </div>


                <div className="dashboard-date">
                    <span className="date-dot"></span>

                    <div>
                        <small>Today</small>

                        <strong>
                            {new Date().toLocaleDateString(
                                "en-BD",
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                }
                            )}
                        </strong>
                    </div>
                </div>

            </div>


            {/* =====================================================
                KPI SECTION
            ===================================================== */}

            <div className="kpi-grid">

                {/* Branches */}

                <div className="kpi-card">

                    <div className="kpi-content">

                        <div className="kpi-icon kpi-blue">
                            <span>⌂</span>
                        </div>

                        <div>
                            <span className="kpi-label">
                                Branches
                            </span>

                            <strong className="kpi-value">
                                {dashboard?.total_branches || 0}
                            </strong>

                            <small>
                                Active pharmacy branches
                            </small>
                        </div>

                    </div>

                    <div className="kpi-arrow">
                        →
                    </div>

                </div>


                {/* Medicines */}

                <div className="kpi-card">

                    <div className="kpi-content">

                        <div className="kpi-icon kpi-purple">
                            <span>✚</span>
                        </div>

                        <div>
                            <span className="kpi-label">
                                Medicines
                            </span>

                            <strong className="kpi-value">
                                {dashboard?.total_medicines || 0}
                            </strong>

                            <small>
                                Active medicines
                            </small>
                        </div>

                    </div>

                    <div className="kpi-arrow">
                        →
                    </div>

                </div>


                {/* Stock */}

                <div className="kpi-card">

                    <div className="kpi-content">

                        <div className="kpi-icon kpi-green">
                            <span>▣</span>
                        </div>

                        <div>
                            <span className="kpi-label">
                                Total Stock
                            </span>

                            <strong className="kpi-value">
                                {Number(
                                    dashboard?.total_stock_quantity || 0
                                ).toLocaleString()}
                            </strong>

                            <small>
                                Units currently available
                            </small>
                        </div>

                    </div>

                    <div className="kpi-arrow">
                        →
                    </div>

                </div>


                {/* Today's Sales */}

                <div className="kpi-card kpi-sales-card">

                    <div className="kpi-content">

                        <div className="kpi-icon kpi-orange">
                            <span>৳</span>
                        </div>

                        <div>
                            <span className="kpi-label">
                                Today's Sales
                            </span>

                            <strong className="kpi-value">
                                {formatCurrency(todaySales)}
                            </strong>

                            <small>
                                {todayTransactions} transactions today
                            </small>
                        </div>

                    </div>

                    <div className="kpi-arrow">
                        →
                    </div>

                </div>

            </div>


            {/* =====================================================
                MAIN ANALYTICS
            ===================================================== */}

            <div className="dashboard-main-grid">


                {/* =================================================
                    SALES PERFORMANCE
                ================================================= */}

                <section className="dashboard-card sales-performance">

                    <div className="card-header">

                        <div>
                            <span className="card-overline">
                                REVENUE
                            </span>

                            <h2>Sales Performance</h2>

                            <p>
                                Overall sales performance of your pharmacy
                            </p>
                        </div>


                        <div className="card-header-icon sales-header-icon">
                            ৳
                        </div>

                    </div>


                    <div className="sales-highlight">

                        <div>

                            <span>
                                Total Sales
                            </span>

                            <strong>
                                {formatCurrency(totalSales)}
                            </strong>

                        </div>


                        <div className="sales-today">

                            <span>Today</span>

                            <strong>
                                {formatCurrency(todaySales)}
                            </strong>

                        </div>

                    </div>


                    {/* Fake visual sales graph using available
                        dashboard data. No extra API required. */}

                    <div className="sales-chart">

                        <div className="chart-y-axis">
                            <span>High</span>
                            <span>Mid</span>
                            <span>Low</span>
                        </div>


                        <div className="chart-area">

                            <div className="chart-grid-line"></div>
                            <div className="chart-grid-line"></div>
                            <div className="chart-grid-line"></div>


                            <div className="chart-placeholder">

                                <div className="chart-line chart-line-one"></div>

                                <div className="chart-line chart-line-two"></div>

                                <div className="chart-point point-one"></div>
                                <div className="chart-point point-two"></div>
                                <div className="chart-point point-three"></div>
                                <div className="chart-point point-four"></div>
                                <div className="chart-point point-five"></div>

                            </div>


                            <div className="chart-days">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>

                        </div>

                    </div>


                    <div className="sales-metrics">

                        <div>
                            <span>
                                Today's Transactions
                            </span>

                            <strong>
                                {todayTransactions}
                            </strong>
                        </div>


                        <div>
                            <span>
                                Average Sale
                            </span>

                            <strong>
                                {formatCurrency(averageSale)}
                            </strong>
                        </div>

                    </div>

                </section>



                {/* =================================================
                    INVENTORY ALERTS
                ================================================= */}

                <section className="dashboard-card inventory-card">

                    <div className="card-header">

                        <div>
                            <span className="card-overline">
                                INVENTORY
                            </span>

                            <h2>Inventory Health</h2>

                            <p>
                                Current stock condition
                            </p>
                        </div>


                        <div className="card-header-icon inventory-header-icon">
                            ✓
                        </div>

                    </div>


                    <div className="inventory-status-list">


                        {/* Low Stock */}

                        <div className="inventory-status warning">

                            <div className="inventory-status-left">

                                <div className="status-icon">
                                    !
                                </div>

                                <div>
                                    <strong>
                                        Low Stock
                                    </strong>

                                    <span>
                                        Items need restocking
                                    </span>
                                </div>

                            </div>


                            <div className="status-count">
                                {dashboard?.low_stock_count || 0}
                            </div>

                        </div>



                        {/* Expired */}

                        <div className="inventory-status danger">

                            <div className="inventory-status-left">

                                <div className="status-icon">
                                    !
                                </div>

                                <div>
                                    <strong>
                                        Expired Stock
                                    </strong>

                                    <span>
                                        Expired items in inventory
                                    </span>
                                </div>

                            </div>


                            <div className="status-count">
                                {dashboard?.expired_stock_count || 0}
                            </div>

                        </div>



                        {/* Healthy */}

                        <div className="inventory-status healthy">

                            <div className="inventory-status-left">

                                <div className="status-icon">
                                    ✓
                                </div>

                                <div>
                                    <strong>
                                        Stock Available
                                    </strong>

                                    <span>
                                        Units currently available
                                    </span>
                                </div>

                            </div>


                            <div className="status-count">
                                {Number(
                                    dashboard?.total_stock_quantity || 0
                                ).toLocaleString()}
                            </div>

                        </div>

                    </div>


                    <div className="inventory-footer">

                        <div>

                            <span>
                                Suppliers
                            </span>

                            <strong>
                                {dashboard?.total_suppliers || 0}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Branches
                            </span>

                            <strong>
                                {dashboard?.total_branches || 0}
                            </strong>

                        </div>

                    </div>

                </section>

            </div>



            {/* =====================================================
                RECENT SALES
            ===================================================== */}

            <section className="dashboard-card recent-sales-card">

                <div className="recent-sales-header">

                    <div>

                        <span className="card-overline">
                            TRANSACTIONS
                        </span>

                        <h2>Recent Sales</h2>

                        <p>
                            Latest transactions across your pharmacy
                        </p>

                    </div>


                    <div className="recent-count">
                        {recentSales.length} Recent
                    </div>

                </div>


                <div className="sales-table-wrapper">

                    <table className="sales-table">

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

                            {recentSales.length > 0 ? (

                                recentSales.map((sale) => (

                                    <tr key={sale.id}>

                                        <td>

                                            <div className="invoice-cell">

                                                <div className="invoice-icon">
                                                    #
                                                </div>

                                                <strong>
                                                    {sale.invoice_number}
                                                </strong>

                                            </div>

                                        </td>


                                        <td>

                                            <span className="branch-tag">
                                                {sale.branch}
                                            </span>

                                        </td>


                                        <td className="date-cell">
                                            {sale.sale_date}
                                        </td>


                                        <td className="table-amount">
                                            {formatCurrency(
                                                sale.total_amount
                                            )}
                                        </td>


                                        <td className="paid-amount">
                                            {formatCurrency(
                                                sale.paid_amount
                                            )}
                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    Number(sale.due_amount) > 0
                                                        ? "payment-status due"
                                                        : "payment-status paid"
                                                }
                                            >
                                                {Number(sale.due_amount) > 0
                                                    ? `Due ${formatCurrency(
                                                        sale.due_amount
                                                    )}`
                                                    : "Paid"}
                                            </span>

                                        </td>

                                    </tr>

                                ))

                            ) : (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="empty-sales"
                                    >

                                        <div className="empty-icon">
                                            ✓
                                        </div>

                                        <strong>
                                            No recent sales
                                        </strong>

                                        <span>
                                            Sales transactions will appear here.
                                        </span>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </div>
    );
};


export default Dashboard;