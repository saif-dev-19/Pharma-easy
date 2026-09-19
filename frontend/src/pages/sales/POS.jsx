import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBatches } from "../../api/batchApi";
import { createSale } from "../../api/saleApi";
import { useAuth } from "../../context/AuthContext";

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
                const medicineName = getMedicineName(batch).toLowerCase();

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
                              subtotal:
                                  (
                                      (item.quantity + 1) *
                                      Number(item.selling_price)
                                  ).toFixed(2),
                          }
                        : item
                )
            );

            return;
        }

        const sellingPrice = Number(batch.selling_price || 0);

        setCart([
            ...cart,
            {
                batch: batch.id,
                medicine_name: getMedicineDisplayName(batch),
                batch_number: batch.batch_number,
                quantity: 1,
                selling_price: sellingPrice.toFixed(2),
                subtotal: sellingPrice.toFixed(2),
            },
        ]);
    };

    const updateQuantity = (batchId, quantity) => {
        const newQuantity = Math.max(1, Number(quantity) || 1);

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
            setError("Please add at least one medicine.");
            return;
        }

        if (!user?.branch_id && user.role != "ADMIN") {
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
            setError("Paid amount cannot be negative.");
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                invoice_number: `POS-${Date.now()}`,
                branch: user.branch_id || 1, // Default to 1 if user has no branch
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

            const responseData = err.response?.data;

            if (typeof responseData === "object") {
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
            <div className="page-loading">
                Loading POS...
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Sales / POS</h1>
                    <p>
                        Create a new pharmacy sale
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                        navigate("/sales/history")
                    }
                >
                    Sales History
                </button>
            </div>

            {error && (
                <div className="page-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="success-message">
                    {success}
                </div>
            )}

            <div className="pos-layout">
                {/* LEFT SIDE */}
                <div className="pos-products">
                    <div className="data-card">
                        <div className="data-card-header">
                            <div>
                                <h2>
                                    Select Medicine
                                </h2>
                                <p>
                                    Search by medicine,
                                    batch or QR code
                                </p>
                            </div>
                        </div>

                        <div className="pos-search">
                            <input
                                type="text"
                                placeholder="Search medicine, batch or QR code..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="pos-product-list">
                            {filteredBatches.length === 0 ? (
                                <div className="empty-state">
                                    No medicine found.
                                </div>
                            ) : (
                                filteredBatches.map(
                                    (batch) => (
                                        <div
                                            key={batch.id}
                                            className="pos-product-card"
                                        >
                                            <div>
                                                <h3>
                                                    {getMedicineDisplayName(
                                                        batch
                                                    )}
                                                </h3>

                                                <p>
                                                    Batch:{" "}
                                                    {batch.batch_number ||
                                                        "-"}
                                                </p>

                                                <p>
                                                    Price: ৳
                                                    {Number(
                                                        batch.selling_price ||
                                                            0
                                                    ).toFixed(
                                                        2
                                                    )}
                                                </p>

                                                {batch.qr_code && (
                                                    <code>
                                                        {
                                                            batch.qr_code
                                                        }
                                                    </code>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                className="primary-button"
                                                onClick={() =>
                                                    addToCart(
                                                        batch
                                                    )
                                                }
                                            >
                                                Add
                                            </button>
                                        </div>
                                    )
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="pos-cart">
                    <div className="data-card">
                        <div className="data-card-header">
                            <div>
                                <h2>
                                    Current Sale
                                </h2>
                                <p>
                                    Branch:{" "}
                                    {user?.branch_id ||
                                        "-"}
                                </p>
                            </div>
                        </div>

                        {cart.length === 0 ? (
                            <div className="empty-state">
                                Cart is empty.
                            </div>
                        ) : (
                            <div className="pos-cart-items">
                                {cart.map((item) => (
                                    <div
                                        key={item.batch}
                                        className="pos-cart-item"
                                    >
                                        <div className="pos-cart-info">
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

                                            <span>
                                                ৳
                                                {Number(
                                                    item.selling_price
                                                ).toFixed(
                                                    2
                                                )}{" "}
                                                / unit
                                            </span>
                                        </div>

                                        <div className="pos-cart-actions">
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
                                                className="delete-button"
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
                                ))}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="pos-summary"
                        >
                            <div className="summary-row">
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

                            <div className="form-group">
                                <label htmlFor="discount">
                                    Discount
                                </label>

                                <input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discount}
                                    onChange={(event) =>
                                        setDiscount(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="summary-row total-row">
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

                            <div className="form-group">
                                <label htmlFor="paidAmount">
                                    Paid Amount
                                </label>

                                <input
                                    id="paidAmount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={
                                        paidAmount
                                    }
                                    onChange={(event) =>
                                        setPaidAmount(
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="summary-row">
                                <span>
                                    Due
                                </span>

                                <strong>
                                    ৳
                                    {dueAmount.toFixed(
                                        2
                                    )}
                                </strong>
                            </div>

                            <button
                                type="submit"
                                className="primary-button pos-submit"
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default POS;