import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBatches } from "../../api/batchApi";
import { createSale } from "../../api/saleApi";
import { useAuth } from "../../context/AuthContext";

import "./POS.css";

const POS = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [batches, setBatches] = useState([]);
    const [cart, setCart] = useState([]);

    const [search, setSearch] = useState("");
    const [discount, setDiscount] = useState("");
    const [paidAmount, setPaidAmount] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadBatches = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getBatches({
                    expired: false,
                });

                setBatches(
                    Array.isArray(data)
                        ? data
                        : data.results || []
                );
            } catch (err) {
                console.error("POS batch error:", err);

                setError(
                    err.response?.data?.detail ||
                    "Failed to load medicines."
                );
            } finally {
                setLoading(false);
            }
        };

        loadBatches();
    }, []);

    const getMedicineName = (batch) => {
        return (
            batch.medicine?.name ||
            batch.medicine_name ||
            batch.medicine ||
            "Unknown Medicine"
        );
    };

    const getMedicineDisplayName = (batch) => {
        const medicine = getMedicineName(batch);

        if (batch.medicine?.strength) {
            return `${medicine} ${batch.medicine.strength}`;
        }

        return medicine;
    };

    const filteredBatches = useMemo(() => {
        const value = search.trim().toLowerCase();

        if (!value) {
            return batches.slice(0, 20);
        }

        return batches
            .filter((batch) => {
                const medicineName =
                    getMedicineName(batch).toLowerCase();

                const batchNumber = (
                    batch.batch_number || ""
                ).toLowerCase();

                const qrCode = (
                    batch.qr_code || ""
                ).toLowerCase();

                return (
                    medicineName.includes(value) ||
                    batchNumber.includes(value) ||
                    qrCode.includes(value)
                );
            })
            .slice(0, 20);
    }, [batches, search]);

    const addToCart = (batch) => {
        const existingItem = cart.find(
            (item) => item.batch === batch.id
        );

        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.batch === batch.id
                        ? {
                              ...item,
                              quantity: item.quantity + 1,
                              subtotal: (
                                  (item.quantity + 1) *
                                  Number(item.selling_price)
                              ).toFixed(2),
                          }
                        : item
                )
            );

            return;
        }

        const sellingPrice = Number(
            batch.selling_price || 0
        );

        setCart([
            ...cart,
            {
                batch: batch.id,
                medicine_name:
                    getMedicineDisplayName(batch),
                batch_number: batch.batch_number,
                quantity: 1,
                selling_price:
                    sellingPrice.toFixed(2),
                subtotal:
                    sellingPrice.toFixed(2),
            },
        ]);
    };

    const updateQuantity = (batchId, quantity) => {
        const newQuantity = Math.max(
            1,
            Number(quantity) || 1
        );

        setCart(
            cart.map((item) =>
                item.batch === batchId
                    ? {
                          ...item,
                          quantity: newQuantity,
                          subtotal: (
                              newQuantity *
                              Number(item.selling_price)
                          ).toFixed(2),
                      }
                    : item
            )
        );
    };

    const removeFromCart = (batchId) => {
        setCart(
            cart.filter(
                (item) => item.batch !== batchId
            )
        );
    };

    const subtotal = useMemo(() => {
        return cart.reduce(
            (total, item) =>
                total + Number(item.subtotal || 0),
            0
        );
    }, [cart]);

    const discountAmount = Number(discount || 0);

    const totalAmount = Math.max(
        0,
        subtotal - discountAmount
    );

    const paid = Number(paidAmount || 0);

    const dueAmount = Math.max(
        0,
        totalAmount - paid
    );

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!cart.length) {
            setError(
                "Please add at least one medicine."
            );
            return;
        }

        if (
            !user?.branch_id &&
            user?.role !== "ADMIN"
        ) {
            setError(
                "Your account is not assigned to a branch."
            );
            return;
        }

        if (discountAmount > subtotal) {
            setError(
                "Discount cannot be greater than subtotal."
            );
            return;
        }

        if (paid < 0) {
            setError(
                "Paid amount cannot be negative."
            );
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                invoice_number: `POS-${Date.now()}`,
                branch: user.branch_id || 1,
                sale_date: new Date()
                    .toISOString()
                    .split("T")[0],

                discount: discountAmount.toFixed(2),
                paid_amount: paid.toFixed(2),

                items: cart.map((item) => ({
                    batch: item.batch,
                    quantity: item.quantity,
                    selling_price: Number(
                        item.selling_price
                    ).toFixed(2),
                    subtotal: Number(
                        item.subtotal
                    ).toFixed(2),
                })),
            };

            const sale = await createSale(payload);

            setSuccess(
                `Sale completed successfully. Invoice: ${
                    sale.invoice_number || "Created"
                }`
            );

            setCart([]);
            setSearch("");
            setDiscount("");
            setPaidAmount("");
        } catch (err) {
            console.error("Sale error:", err);

            const responseData =
                err.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {
                const messages = Object.values(
                    responseData
                )
                    .flat()
                    .join(" ");

                setError(
                    messages ||
                        "Failed to complete sale."
                );
            } else {
                setError(
                    "Failed to complete sale."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="pos-page-loading">
                <div className="pos-loading-spinner" />
                <span>Loading POS...</span>
            </div>
        );
    }

    return (
        <div className="pos-page">
            {/* HEADER */}
            <div className="pos-header">
                <div>
                    <h1>Sales / POS</h1>
                    <p>
                        Create a new pharmacy sale
                    </p>
                </div>

                <button
                    type="button"
                    className="pos-history-btn"
                    onClick={() =>
                        navigate(
                            "/sales/history"
                        )
                    }
                >
                    Sales History
                </button>
            </div>

            {/* ALERTS */}
            {error && (
                <div className="pos-alert pos-alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="pos-alert pos-alert-success">
                    {success}
                </div>
            )}

            {/* MAIN POS */}
            <div className="pos-main-grid">
                {/* PRODUCTS */}
                <section className="pos-panel pos-products-panel">
                    <div className="pos-panel-header">
                        <div>
                            <h2>Select Medicine</h2>
                            <p>
                                Search medicine,
                                batch or QR code
                            </p>
                        </div>

                        <span className="pos-count">
                            {filteredBatches.length}
                        </span>
                    </div>

                    <div className="pos-search-box">
                        <span className="pos-search-icon">
                            🔍
                        </span>

                        <input
                            type="text"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Search medicine, batch or QR code..."
                        />

                        {search && (
                            <button
                                type="button"
                                className="pos-clear-search"
                                onClick={() =>
                                    setSearch("")
                                }
                            >
                                ×
                            </button>
                        )}
                    </div>

                    <div className="pos-product-list">
                        {filteredBatches.length ===
                        0 ? (
                            <div className="pos-empty">
                                <div className="pos-empty-icon">
                                    +
                                </div>

                                <strong>
                                    No medicine found
                                </strong>

                                <span>
                                    Try another
                                    medicine name
                                    or batch
                                </span>
                            </div>
                        ) : (
                            filteredBatches.map(
                                (batch) => (
                                    <div
                                        key={
                                            batch.id
                                        }
                                        className="pos-product"
                                    >
                                        <div className="pos-product-main">
                                        

                                            <div className="pos-product-info">
                                                <h3>
                                                    {getMedicineDisplayName(
                                                        batch
                                                    )}
                                                </h3>

                                                <div className="pos-product-meta">
                                                    <span>
                                                        Batch:{" "}
                                                        <strong>
                                                            {batch.batch_number ||
                                                                "-"}
                                                        </strong>
                                                    </span>

                                                    {batch.qr_code && (
                                                        <span>
                                                            QR:{" "}
                                                            {
                                                                batch.qr_code
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pos-product-right">
                                            <strong className="pos-product-price">
                                                ৳
                                                {Number(
                                                    batch.selling_price ||
                                                        0
                                                ).toFixed(
                                                    2
                                                )}
                                            </strong>

                                            <button
                                                type="button"
                                                className="pos-add-btn"
                                                onClick={() =>
                                                    addToCart(
                                                        batch
                                                    )
                                                }
                                            >
                                                + Add
                                            </button>
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </div>
                </section>

                {/* CART */}
                <section className="pos-panel pos-cart-panel">
                    <div className="pos-panel-header">
                        <div>
                            <h2>Current Sale</h2>

                            <p>
                                Branch{" "}
                                {user?.branch_id ||
                                    "-"}
                            </p>
                        </div>

                        <div className="pos-cart-badge">
                            {cart.length}{" "}
                            {cart.length === 1
                                ? "item"
                                : "items"}
                        </div>
                    </div>

                    <div className="pos-cart-content">
                        {cart.length === 0 ? (
                            <div className="pos-cart-empty">
                                <div className="pos-cart-empty-icon">
                                    🛒
                                </div>

                                <strong>
                                    Cart is empty
                                </strong>

                                <span>
                                    Add medicines
                                    from the left
                                    panel
                                </span>
                            </div>
                        ) : (
                            <div className="pos-cart-list">
                                {cart.map(
                                    (item) => (
                                        <div
                                            key={
                                                item.batch
                                            }
                                            className="pos-cart-product"
                                        >
                                            <div className="pos-cart-product-info">
                                                <h3>
                                                    {
                                                        item.medicine_name
                                                    }
                                                </h3>

                                                <span>
                                                    Batch:{" "}
                                                    {
                                                        item.batch_number
                                                    }
                                                </span>

                                                <small>
                                                    ৳
                                                    {Number(
                                                        item.selling_price
                                                    ).toFixed(
                                                        2
                                                    )}{" "}
                                                    / unit
                                                </small>
                                            </div>

                                            <div className="pos-cart-controls">
                                                <div className="pos-quantity">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.batch,
                                                                item.quantity -
                                                                    1
                                                            )
                                                        }
                                                    >
                                                        −
                                                    </button>

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            item.quantity
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateQuantity(
                                                                item.batch,
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    />

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQuantity(
                                                                item.batch,
                                                                item.quantity +
                                                                    1
                                                            )
                                                        }
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                <strong>
                                                    ৳
                                                    {Number(
                                                        item.subtotal
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </strong>

                                                <button
                                                    type="button"
                                                    className="pos-remove-btn"
                                                    onClick={() =>
                                                        removeFromCart(
                                                            item.batch
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* SUMMARY */}
                    <form
                        onSubmit={handleSubmit}
                        className="pos-checkout"
                    >
                        <div className="pos-summary-row">
                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ৳
                                {subtotal.toFixed(
                                    2
                                )}
                            </strong>
                        </div>

                        <div className="pos-input-row">
                            <label htmlFor="discount">
                                Discount
                            </label>

                            <div className="pos-money-input">
                                <span>৳</span>

                                <input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        discount
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDiscount(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="pos-total-row">
                            <span>
                                Total
                            </span>

                            <strong>
                                ৳
                                {totalAmount.toFixed(
                                    2
                                )}
                            </strong>
                        </div>

                        <div className="pos-input-row">
                            <label htmlFor="paidAmount">
                                Paid Amount
                            </label>

                            <div className="pos-money-input">
                                <span>৳</span>

                                <input
                                    id="paidAmount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        paidAmount
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setPaidAmount(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="pos-due-row">
                            <span>Due</span>

                            <strong>
                                ৳
                                {dueAmount.toFixed(
                                    2
                                )}
                            </strong>
                        </div>

                        <button
                            type="submit"
                            className="pos-complete-btn"
                            disabled={
                                submitting ||
                                cart.length === 0
                            }
                        >
                            {submitting
                                ? "Processing..."
                                : "Complete Sale"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default POS;