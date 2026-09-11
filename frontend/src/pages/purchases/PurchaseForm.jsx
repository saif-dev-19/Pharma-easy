import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPurchase } from "../../api/purchaseApi";
import { getBatches } from "../../api/batchApi";
import { useAuth } from "../../context/AuthContext";

const PurchaseForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [batches, setBatches] = useState([]);
    const [loadingBatches, setLoadingBatches] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        supplier: "",
        branch: user?.branch_id || "",
        invoice_number: "",
        purchase_date: new Date().toISOString().split("T")[0],
    });

    const [items, setItems] = useState([
        {
            batch: "",
            quantity: "",
            purchase_price: "",
            selling_price: "",
        },
    ]);

    useEffect(() => {
        const loadBatches = async () => {
            try {
                const data = await getBatches();
                setBatches(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setError("Failed to load batches.");
            } finally {
                setLoadingBatches(false);
            }
        };

        loadBatches();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;

        setItems((prev) =>
            prev.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          [name]: value,
                      }
                    : item
            )
        );
    };

    const addItem = () => {
        setItems((prev) => [
            ...prev,
            {
                batch: "",
                quantity: "",
                purchase_price: "",
                selling_price: "",
            },
        ]);
    };

    const removeItem = (index) => {
        if (items.length === 1) return;

        setItems((prev) => prev.filter((_, i) => i !== index));
    };

    const calculateSubtotal = (item) => {
        const quantity = Number(item.quantity || 0);
        const price = Number(item.purchase_price || 0);

        return quantity * price;
    };

    const totalAmount = items.reduce(
        (total, item) => total + calculateSubtotal(item),
        0
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!form.supplier) {
            setError("Please enter supplier ID.");
            return;
        }

        if (!form.branch) {
            setError("Branch is required.");
            return;
        }

        if (!form.invoice_number.trim()) {
            setError("Invoice number is required.");
            return;
        }

        const invalidItem = items.some(
            (item) =>
                !item.batch ||
                !item.quantity ||
                Number(item.quantity) <= 0 ||
                !item.purchase_price ||
                !item.selling_price
        );

        if (invalidItem) {
            setError("Please complete all purchase item fields.");
            return;
        }

        const payload = {
            supplier: Number(form.supplier),
            branch: Number(form.branch),
            invoice_number: form.invoice_number.trim(),
            purchase_date: form.purchase_date,
            total_amount: totalAmount.toFixed(2),
            items: items.map((item) => ({
                batch: Number(item.batch),
                quantity: Number(item.quantity),
                purchase_price: Number(item.purchase_price).toFixed(2),
                selling_price: Number(item.selling_price).toFixed(2),
                subtotal: calculateSubtotal(item).toFixed(2),
            })),
        };

        try {
            setSubmitting(true);

            console.log("PURCHASE PAYLOAD:", payload);

            await createPurchase(payload);

            navigate("/purchases");
        } catch (err) {
            console.error("Purchase Create Error:", err);

            const data = err.response?.data;

            setError(
                data?.detail ||
                data?.message ||
                "Failed to create purchase."
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingBatches) {
        return (
            <div className="page-loading">
                Loading batches...
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Add Purchase</h1>
                    <p>Create a new pharmacy purchase</p>
                </div>

                <Link
                    to="/purchases"
                    className="secondary-button"
                >
                    Back to Purchases
                </Link>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-card">
                    <div className="form-section">
                        <h2 className="form-section-title">
                            Purchase Information
                        </h2>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="supplier">
                                    Supplier ID
                                </label>

                                <input
                                    id="supplier"
                                    name="supplier"
                                    type="number"
                                    min="1"
                                    value={form.supplier}
                                    onChange={handleChange}
                                    placeholder="Enter supplier ID"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="branch">
                                    Branch
                                </label>

                                <input
                                    id="branch"
                                    name="branch"
                                    type="number"
                                    value={form.branch}
                                    onChange={handleChange}
                                    disabled={user?.role === "MANAGER"}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="invoice_number">
                                    Invoice Number
                                </label>

                                <input
                                    id="invoice_number"
                                    name="invoice_number"
                                    type="text"
                                    value={form.invoice_number}
                                    onChange={handleChange}
                                    placeholder="e.g. PUR-0006"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="purchase_date">
                                    Purchase Date
                                </label>

                                <input
                                    id="purchase_date"
                                    name="purchase_date"
                                    type="date"
                                    value={form.purchase_date}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-card">
                    <div className="data-card-header">
                        <div>
                            <h2>Purchase Items</h2>
                            <p>Add medicines and quantities</p>
                        </div>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={addItem}
                        >
                            + Add Item
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Batch</th>
                                    <th>Quantity</th>
                                    <th>Purchase Price</th>
                                    <th>Selling Price</th>
                                    <th>Subtotal</th>
                                    <th>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <select
                                                name="batch"
                                                value={item.batch}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        e
                                                    )
                                                }
                                            >
                                                <option value="">
                                                    Select Batch
                                                </option>

                                                {batches.map((batch) => (
                                                    <option
                                                        key={batch.id}
                                                        value={batch.id}
                                                    >
                                                        {batch.medicine_name ||
                                                            batch.medicine?.name ||
                                                            batch.medicine ||
                                                            "Medicine"}{" "}
                                                        -{" "}
                                                        {batch.batch_number}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                name="quantity"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        e
                                                    )
                                                }
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                name="purchase_price"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    item.purchase_price
                                                }
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        e
                                                    )
                                                }
                                            />
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                name="selling_price"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    item.selling_price
                                                }
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        e
                                                    )
                                                }
                                            />
                                        </td>

                                        <td>
                                            <strong>
                                                ৳{" "}
                                                {calculateSubtotal(
                                                    item
                                                ).toFixed(2)}
                                            </strong>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="delete-button"
                                                onClick={() =>
                                                    removeItem(index)
                                                }
                                                disabled={
                                                    items.length === 1
                                                }
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            <tfoot>
                                <tr>
                                    <td colSpan="4">
                                        <strong>
                                            Total Amount
                                        </strong>
                                    </td>

                                    <td>
                                        <strong>
                                            ৳{" "}
                                            {totalAmount.toFixed(2)}
                                        </strong>
                                    </td>

                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <div className="form-actions">
                    <Link
                        to="/purchases"
                        className="secondary-button"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Creating..."
                            : "Create Purchase"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PurchaseForm;