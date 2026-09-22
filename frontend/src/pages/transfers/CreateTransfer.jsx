import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBranches } from "../../api/branchApi";
import { getBatches } from "../../api/batchApi";
import { createTransfer } from "../../api/transferApi";

import "./CreateTransfer.css";

const CreateTransfer = () => {
    const navigate = useNavigate();

    const [branches, setBranches] = useState([]);
    const [batches, setBatches] = useState([]);

    const [fromBranch, setFromBranch] = useState("");
    const [toBranch, setToBranch] = useState("");
    const [transferDate, setTransferDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [selectedBatch, setSelectedBatch] = useState("");
    const [quantity, setQuantity] = useState("");

    const [items, setItems] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);

                const [branchData, batchData] =
                    await Promise.all([
                        getBranches(),
                        getBatches({
                            expired: false,
                        }),
                    ]);

                setBranches(
                    Array.isArray(branchData)
                        ? branchData
                        : branchData.results || []
                );

                setBatches(
                    Array.isArray(batchData)
                        ? batchData
                        : batchData.results || []
                );
            } catch (err) {
                console.error(err);

                setError(
                    err.response?.data?.detail ||
                        "Failed to load transfer data."
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const addItem = () => {
        setError("");

        if (!selectedBatch) {
            setError("Please select a batch.");
            return;
        }

        if (!quantity || Number(quantity) <= 0) {
            setError("Quantity must be greater than 0.");
            return;
        }

        const batch = batches.find(
            (item) => String(item.id) === String(selectedBatch)
        );

        if (!batch) {
            setError("Selected batch not found.");
            return;
        }

        const alreadyExists = items.some(
            (item) =>
                String(item.batch) === String(selectedBatch)
        );

        if (alreadyExists) {
            setError(
                "This batch has already been added."
            );
            return;
        }

        setItems((previous) => [
            ...previous,
            {
                batch: batch.id,
                batch_number:
                    batch.batch_number || "N/A",
                medicine_name:
                    batch.medicine_name ||
                    batch.medicine?.name ||
                    "Unknown Medicine",
                quantity: Number(quantity),
            },
        ]);

        setSelectedBatch("");
        setQuantity("");
    };

    const removeItem = (batchId) => {
        setItems((previous) =>
            previous.filter(
                (item) =>
                    String(item.batch) !== String(batchId)
            )
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!fromBranch) {
            setError("Please select the source branch.");
            return;
        }

        if (!toBranch) {
            setError(
                "Please select the destination branch."
            );
            return;
        }

        if (fromBranch === toBranch) {
            setError(
                "Source and destination branches must be different."
            );
            return;
        }

        if (!transferDate) {
            setError("Please select transfer date.");
            return;
        }

        if (items.length === 0) {
            setError(
                "Please add at least one transfer item."
            );
            return;
        }

        try {
            setSubmitting(true);

            await createTransfer({
                from_branch: Number(fromBranch),
                to_branch: Number(toBranch),
                transfer_date: transferDate,
                items: items.map((item) => ({
                    batch: item.batch,
                    quantity: item.quantity,
                })),
            });

            navigate("/transfers");
        } catch (err) {
            console.error(err);

            const data = err.response?.data;

            if (typeof data === "string") {
                setError(data);
            } else if (data?.detail) {
                setError(data.detail);
            } else {
                setError(
                    "Failed to create transfer request."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="transfer-form-page">
                <div className="transfer-loading">
                    Loading transfer data...
                </div>
            </div>
        );
    }

    return (
        <div className="transfer-form-page">
            <div className="transfer-form-header">
                <div>
                    <span className="transfer-eyebrow">
                        STOCK MANAGEMENT
                    </span>

                    <h1>Create Transfer Request</h1>

                    <p>
                        Request stock from one branch to
                        another branch.
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                        navigate("/transfers")
                    }
                >
                    Back to Transfers
                </button>
            </div>

            <form
                className="transfer-form"
                onSubmit={handleSubmit}
            >
                <div className="transfer-form-card">
                    <div className="card-heading">
                        <h2>Transfer Details</h2>

                        <span className="pending-label">
                            Request → Pending
                        </span>
                    </div>

                    <div className="transfer-form-grid">
                        <div className="form-field">
                            <label>
                                From Branch
                            </label>

                            <select
                                value={fromBranch}
                                onChange={(e) =>
                                    setFromBranch(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Select source branch
                                </option>

                                {branches.map((branch) => (
                                    <option
                                        key={branch.id}
                                        value={branch.id}
                                    >
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label>
                                To Branch
                            </label>

                            <select
                                value={toBranch}
                                onChange={(e) =>
                                    setToBranch(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Select destination branch
                                </option>

                                {branches.map((branch) => (
                                    <option
                                        key={branch.id}
                                        value={branch.id}
                                    >
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field">
                            <label>
                                Transfer Date
                            </label>

                            <input
                                type="date"
                                value={transferDate}
                                onChange={(e) =>
                                    setTransferDate(
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="transfer-form-card">
                    <div className="card-heading">
                        <div>
                            <h2>Transfer Items</h2>

                            <p>
                                Add the batches you want
                                to transfer.
                            </p>
                        </div>

                        <span className="item-count">
                            {items.length} item
                            {items.length !== 1
                                ? "s"
                                : ""}
                        </span>
                    </div>

                    <div className="item-add-row">
                        <div className="form-field item-batch-field">
                            <label>Batch</label>

                            <select
                                value={selectedBatch}
                                onChange={(e) =>
                                    setSelectedBatch(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    Select batch
                                </option>

                                {batches.map((batch) => (
                                    <option
                                        key={batch.id}
                                        value={batch.id}
                                    >
                                        {batch.medicine_name ||
                                            batch.medicine
                                                ?.name ||
                                            "Medicine"}{" "}
                                        —{" "}
                                        {batch.batch_number}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-field quantity-field">
                            <label>Quantity</label>

                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(
                                        e.target.value
                                    )
                                }
                                placeholder="0"
                            />
                        </div>

                        <button
                            type="button"
                            className="add-item-button"
                            onClick={addItem}
                        >
                            + Add Item
                        </button>
                    </div>

                    {items.length > 0 ? (
                        <div className="transfer-items-table">
                            <div className="items-table-header">
                                <span>
                                    Medicine
                                </span>

                                <span>
                                    Batch
                                </span>

                                <span>
                                    Quantity
                                </span>

                                <span>
                                    Action
                                </span>
                            </div>

                            {items.map((item) => (
                                <div
                                    className="items-table-row"
                                    key={item.batch}
                                >
                                    <span>
                                        {
                                            item.medicine_name
                                        }
                                    </span>

                                    <span className="batch-code">
                                        {
                                            item.batch_number
                                        }
                                    </span>

                                    <span>
                                        {
                                            item.quantity
                                        }
                                    </span>

                                    <button
                                        type="button"
                                        className="remove-item-button"
                                        onClick={() =>
                                            removeItem(
                                                item.batch
                                            )
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-items">
                            No items added yet.
                        </div>
                    )}
                </div>

                {error && (
                    <div className="transfer-error">
                        {error}
                    </div>
                )}

                <div className="transfer-form-actions">
                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                            navigate("/transfers")
                        }
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="primary-button"
                        disabled={submitting}
                    >
                        {submitting
                            ? "Creating..."
                            : "Create Transfer Request"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTransfer;