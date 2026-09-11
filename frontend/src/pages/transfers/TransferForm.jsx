import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getBranches } from "../../api/branchApi";
import { getBatches } from "../../api/batchApi";
import { createTransfer } from "../../api/transferApi";
import { useAuth } from "../../context/AuthContext";

const TransferForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [branches, setBranches] = useState([]);
    const [batches, setBatches] = useState([]);

    const [form, setForm] = useState({
        from_branch: user?.branch_id || "",
        to_branch: "",
        transfer_date: new Date()
            .toISOString()
            .split("T")[0],
    });

    const [items, setItems] = useState([
        {
            batch: "",
            quantity: 1,
        },
    ]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

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
                console.error(
                    "Transfer form error:",
                    err
                );

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

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleItemChange = (
        index,
        field,
        value
    ) => {
        setItems((previous) =>
            previous.map((item, itemIndex) =>
                itemIndex === index
                    ? {
                          ...item,
                          [field]: value,
                      }
                    : item
            )
        );
    };

    const addItem = () => {
        setItems((previous) => [
            ...previous,
            {
                batch: "",
                quantity: 1,
            },
        ]);
    };

    const removeItem = (index) => {
        if (items.length === 1) {
            return;
        }

        setItems((previous) =>
            previous.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );
    };

    const getMedicineName = (batch) => {
        return (
            batch.medicine_name ||
            batch.medicine?.name ||
            batch.medicine ||
            "Unknown Medicine"
        );
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!form.from_branch) {
            setError(
                "Please select source branch."
            );
            return;
        }

        if (!form.to_branch) {
            setError(
                "Please select destination branch."
            );
            return;
        }

        if (
            String(form.from_branch) ===
            String(form.to_branch)
        ) {
            setError(
                "Source and destination branches cannot be the same."
            );
            return;
        }

        const validItems = items.filter(
            (item) =>
                item.batch &&
                Number(item.quantity) > 0
        );

        if (!validItems.length) {
            setError(
                "Please add at least one valid item."
            );
            return;
        }

        const duplicateBatches =
            validItems.map(
                (item) => item.batch
            );

        if (
            new Set(duplicateBatches).size !==
            duplicateBatches.length
        ) {
            setError(
                "The same batch cannot be added multiple times."
            );
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                from_branch: Number(
                    form.from_branch
                ),

                to_branch: Number(
                    form.to_branch
                ),

                transfer_date:
                    form.transfer_date,

                items: validItems.map((item) => ({
                    batch: Number(item.batch),
                    quantity: Number(
                        item.quantity
                    ),
                })),
            };

            await createTransfer(payload);

            navigate("/transfers");
        } catch (err) {
            console.error(
                "Create transfer error:",
                err
            );

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
                    "Failed to create transfer."
                );
            } else {
                setError(
                    "Failed to create transfer."
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-loading">
                Loading transfer form...
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>New Stock Transfer</h1>
                    <p>
                        Transfer stock between branches
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

            {error && (
                <div className="page-error">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="form-card"
            >
                <div className="form-section">
                    <h2 className="form-section-title">
                        Transfer Information
                    </h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="from_branch">
                                From Branch
                            </label>

                            <select
                                id="from_branch"
                                name="from_branch"
                                value={
                                    form.from_branch
                                }
                                onChange={
                                    handleChange
                                }
                                disabled={
                                    user?.role ===
                                    "MANAGER"
                                }
                            >
                                <option value="">
                                    Select Source Branch
                                </option>

                                {branches.map(
                                    (branch) => (
                                        <option
                                            key={
                                                branch.id
                                            }
                                            value={
                                                branch.id
                                            }
                                        >
                                            {
                                                branch.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="to_branch">
                                To Branch
                            </label>

                            <select
                                id="to_branch"
                                name="to_branch"
                                value={
                                    form.to_branch
                                }
                                onChange={
                                    handleChange
                                }
                            >
                                <option value="">
                                    Select Destination Branch
                                </option>

                                {branches
                                    .filter(
                                        (branch) =>
                                            String(
                                                branch.id
                                            ) !==
                                            String(
                                                form.from_branch
                                            )
                                    )
                                    .map(
                                        (
                                            branch
                                        ) => (
                                            <option
                                                key={
                                                    branch.id
                                                }
                                                value={
                                                    branch.id
                                                }
                                            >
                                                {
                                                    branch.name
                                                }
                                            </option>
                                        )
                                    )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="transfer_date">
                                Transfer Date
                            </label>

                            <input
                                id="transfer_date"
                                type="date"
                                name="transfer_date"
                                value={
                                    form.transfer_date
                                }
                                onChange={
                                    handleChange
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <div className="form-section-header">
                        <h2 className="form-section-title">
                            Transfer Items
                        </h2>

                        <button
                            type="button"
                            className="secondary-button"
                            onClick={addItem}
                        >
                            + Add Item
                        </button>
                    </div>

                    <div className="purchase-items">
                        {items.map(
                            (item, index) => (
                                <div
                                    key={index}
                                    className="purchase-item-row"
                                >
                                    <div className="form-group">
                                        <label>
                                            Batch
                                        </label>

                                        <select
                                            value={
                                                item.batch
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleItemChange(
                                                    index,
                                                    "batch",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Select Batch
                                            </option>

                                            {batches.map(
                                                (
                                                    batch
                                                ) => (
                                                    <option
                                                        key={
                                                            batch.id
                                                        }
                                                        value={
                                                            batch.id
                                                        }
                                                    >
                                                        {getMedicineName(
                                                            batch
                                                        )}{" "}
                                                        -{" "}
                                                        {
                                                            batch.batch_number
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Quantity
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            value={
                                                item.quantity
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                handleItemChange(
                                                    index,
                                                    "quantity",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className="delete-button"
                                        onClick={() =>
                                            removeItem(
                                                index
                                            )
                                        }
                                        disabled={
                                            items.length ===
                                            1
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                </div>

                <div className="form-actions">
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
                            : "Create Transfer"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TransferForm;