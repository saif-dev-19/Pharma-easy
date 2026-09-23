import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPurchase } from "../../api/purchaseApi";
import { getMedicines } from "../../api/medicineApi";
import { getBatches } from "../../api/batchApi";
import { useAuth } from "../../context/AuthContext";
import { getSuppliers } from "../../api/supplierApi";
import { getBranches } from "../../api/branchApi";


const PurchaseForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [medicines, setMedicines] = useState([]);
    const [batches, setBatches] = useState([]);
    const [loadingMedicines, setLoadingMedicines] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [suppliers, setSuppliers] = useState([]);
    const [branches, setBranches] = useState([]);

    const [form, setForm] = useState({
        supplier: "",
        branch: user?.branch_id || "",
        purchase_date: new Date().toISOString().split("T")[0],
    });

    const [items, setItems] = useState([
        {
            mode: "new",
            batch: "",
            medicine: "",
            supplier_batch_number: "",
            expiry_date: "",
            pack_size: "",
            quantity: "",
            purchase_price: "",
            selling_price: "",
        },
    ]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingMedicines(true);
                setError("");

                const [medicineData, batchData, supplierData, branchData] =
                    await Promise.all([
                        getMedicines({ is_active: true }),
                        getBatches(),
                        getSuppliers(),
                        getBranches(),
                    ]);

                setMedicines(
                    Array.isArray(medicineData)
                        ? medicineData
                        : medicineData.results || []
                );

                setBatches(
                    Array.isArray(batchData)
                        ? batchData
                        : batchData.results || []
                );

                setSuppliers(
                    Array.isArray(supplierData) ? supplierData : []
                );

                setBranches(
                    Array.isArray(branchData) ? branchData : []
                );
            } catch (err) {
                console.error("Purchase Form Error:", err);
                setError(
                    err.response?.data?.detail ||
                    "Failed to load purchase form data."
                );
            } finally {
                setLoadingMedicines(false);
            }
        };

        loadData();
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
                mode: "new",
                batch: "",
                medicine: "",
                supplier_batch_number: "",
                expiry_date: "",
                pack_size: "",
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
        const existingBatch = batches.find(
            (batch) => String(batch.id) === String(item.batch)
        );
        const price = Number(
            item.mode === "existing"
                ? existingBatch?.purchase_price || 0
                : item.purchase_price || 0
        );

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

        const invalidItem = items.some((item) => {
            if (!item.quantity || Number(item.quantity) <= 0) {
                return true;
            }

            if (item.mode === "existing") {
                return !item.batch;
            }

            return (
                !item.medicine ||
                !item.expiry_date ||
                !item.pack_size ||
                !item.purchase_price ||
                !item.selling_price
            );
        });

        if (invalidItem) {
            setError("Please complete all purchase item fields.");
            return;
        }

        const payload = {
            supplier: Number(form.supplier),
            branch: Number(form.branch),
            purchase_date: form.purchase_date,
            items: items.map((item) => {
                if (item.mode === "existing") {
                    return {
                        batch: Number(item.batch),
                        quantity: Number(item.quantity),
                    };
                }

                return {
                    medicine: Number(item.medicine),
                    expiry_date: item.expiry_date,
                    pack_size: Number(item.pack_size),
                    quantity: Number(item.quantity),
                    purchase_price: Number(item.purchase_price).toFixed(2),
                    selling_price: Number(item.selling_price).toFixed(2),
                };
            }),
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

    if (loadingMedicines) {
        return (
            <div className="page-loading">
                Loading medicines...
            </div>
        );
    }

    return (
        <div className="page-container purchase-form-page">
            <div className="page-header purchase-page-header">
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
                <div className="form-card purchase-info-card">
                    <div className="form-section">
                        <h2 className="form-section-title">
                            Purchase Information
                        </h2>

                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="supplier">
                                    Supplier ID
                                </label>

                                <select
                                    id="supplier"
                                    name="supplier"
                                    value={form.supplier}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Supplier</option>

                                    {suppliers.map((supplier) => (
                                        <option key={supplier.id} value={supplier.id}>
                                            {supplier.name}
                                            {supplier.company_name
                                                ? ` - ${supplier.company_name}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="branch">
                                    Branch
                                </label>

                                <select
                                    id="branch"
                                    name="branch"
                                    value={form.branch}
                                    onChange={handleChange}
                                    disabled={user?.role === "MANAGER"}
                                >
                                    <option value="">Select Branch</option>

                                    {branches.map((branch) => (
                                        <option key={branch.id} value={branch.id}>
                                            {branch.name}
                                        </option>
                                    ))}
                                </select>
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

                <div className="form-card purchase-items-card">
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

                    <div className="purchase-item-list">
                        {items.map((item, index) => {
                            const selectedBatch = batches.find(
                                (batch) => String(batch.id) === String(item.batch)
                            );

                            return (
                                <div className="purchase-item-card" key={index}>
                                    <div className="purchase-item-heading">
                                        <div>
                                            <span className="purchase-item-number">
                                                Item {String(index + 1).padStart(2, "0")}
                                            </span>
                                            <h3>
                                                {item.mode === "existing"
                                                    ? selectedBatch?.medicine_name || "Existing batch"
                                                    : "New medicine batch"}
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            className="purchase-remove-button"
                                            onClick={() => removeItem(index)}
                                            disabled={items.length === 1}
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div className="purchase-item-fields">
                                        <div className="purchase-field">
                                            <label>Batch mode</label>
                                            <select
                                                value={item.mode}
                                                onChange={(e) => handleItemChange(index, {
                                                    target: { name: "mode", value: e.target.value },
                                                })}
                                            >
                                                <option value="new">New Batch</option>
                                                <option value="existing">Existing Batch</option>
                                            </select>
                                        </div>

                                        <div className="purchase-field purchase-field-wide">
                                            <label>{item.mode === "existing" ? "Selected medicine" : "Medicine"}</label>
                                            {item.mode === "existing" ? (
                                                <select
                                                    name="batch"
                                                    value={item.batch}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                >
                                                    <option value="">Select existing batch</option>
                                                    {batches.map((batch) => (
                                                        <option key={batch.id} value={batch.id}>
                                                            {batch.medicine_name} - {batch.batch_number}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <select
                                                    name="medicine"
                                                    value={item.medicine}
                                                    onChange={(e) => handleItemChange(index, e)}
                                                >
                                                    <option value="">Select medicine</option>
                                                    {medicines.map((medicine) => (
                                                        <option key={medicine.id} value={medicine.id}>
                                                            {medicine.name}{medicine.strength ? ` - ${medicine.strength}` : ""}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>

                                        {item.mode === "new" ? (
                                            <>
                                                <div className="purchase-field">
                                                    <label htmlFor={`expiry-${index}`}>Expiry date</label>
                                                    <input
                                                        id={`expiry-${index}`}
                                                        type="date"
                                                        name="expiry_date"
                                                        value={item.expiry_date}
                                                        onChange={(e) => handleItemChange(index, e)}
                                                    />
                                                </div>
                                                <div className="purchase-field">
                                                    <label htmlFor={`pack-${index}`}>Pack size</label>
                                                    <input
                                                        id={`pack-${index}`}
                                                        type="number"
                                                        name="pack_size"
                                                        min="1"
                                                        value={item.pack_size}
                                                        onChange={(e) => handleItemChange(index, e)}
                                                        placeholder="e.g. 10"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="purchase-existing-summary">
                                                <span>Expiry: {selectedBatch?.expiry_date || "-"}</span>
                                                <span>Pack size: {selectedBatch?.pack_size || "-"}</span>
                                                <span>Default prices are editable</span>
                                            </div>
                                        )}

                                        <div className="purchase-field">
                                            <label htmlFor={`quantity-${index}`}>Quantity</label>
                                            <input
                                                id={`quantity-${index}`}
                                                type="number"
                                                name="quantity"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, e)}
                                                placeholder="0"
                                            />
                                        </div>

                                        <div className="purchase-field">
                                            <label htmlFor={`purchase-price-${index}`}>Purchase price</label>
                                            <input
                                                id={`purchase-price-${index}`}
                                                type="number"
                                                name="purchase_price"
                                                min="0"
                                                step="0.01"
                                                value={item.mode === "existing"
                                                    ? item.purchase_price || selectedBatch?.purchase_price || ""
                                                    : item.purchase_price}
                                                onChange={(e) => handleItemChange(index, e)}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div className="purchase-field">
                                            <label htmlFor={`selling-price-${index}`}>Selling price</label>
                                            <input
                                                id={`selling-price-${index}`}
                                                type="number"
                                                name="selling_price"
                                                min="0"
                                                step="0.01"
                                                value={item.mode === "existing"
                                                    ? item.selling_price || selectedBatch?.selling_price || ""
                                                    : item.selling_price}
                                                onChange={(e) => handleItemChange(index, e)}
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="purchase-item-footer">
                                        <span>Subtotal</span>
                                        <strong>৳ {calculateSubtotal(item).toFixed(2)}</strong>
                                    </div>
                                </div>
                            );
                        })}

                        <div className="purchase-total-bar">
                            <span>Total purchase amount</span>
                            <strong>৳ {totalAmount.toFixed(2)}</strong>
                        </div>
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