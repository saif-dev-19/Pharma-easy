import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createBatch,
    getBatch,
    updateBatch,
    generateBatchNumber,
} from "../../api/batchApi";
import { getMedicines } from "../../api/medicineApi";
import { useAuth } from "../../context/AuthContext";

const BatchForm = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    const isEditMode = Boolean(id);

    const [medicines, setMedicines] = useState([]);
    const [medicineSearch, setMedicineSearch] = useState("");
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
    const [medicineLoading, setMedicineLoading] = useState(false);
    const [batchNumberGenerated, setBatchNumberGenerated] = useState(false);
    const [generatingBatchNumber, setGeneratingBatchNumber] = useState(false);

    const medicineDropdownRef = useRef(null);

    const [formData, setFormData] = useState({
        medicine: "",
        batch_number: "",
        expiry_date: "",
        pack_size: "",
        purchase_price: "",
        selling_price: "",
    });

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /*
     * Load medicines when user searches
     */
    useEffect(() => {
        const searchMedicines = async () => {
            try {
                setMedicineLoading(true);

                const data = await getMedicines({
                    search: medicineSearch.trim(),
                    is_active: true,
                });

                setMedicines(data.results || data);
            } catch (error) {
                console.error("Medicine Search Error:", error);
            } finally {
                setMedicineLoading(false);
            }
        };

        const timer = setTimeout(() => {
            searchMedicines();
        }, 300);

        return () => clearTimeout(timer);
    }, [medicineSearch]);

    /*
     * Load batch when editing
     */
    useEffect(() => {
        if (!isEditMode) return;

        const fetchBatch = async () => {
            try {
                const data = await getBatch(id);

                setFormData({
                    medicine: data.medicine || "",
                    batch_number: data.batch_number || "",
                    expiry_date: data.expiry_date || "",
                    pack_size: data.pack_size || "",
                    purchase_price: data.purchase_price || "",
                    selling_price: data.selling_price || "",
                });

                /*
                 * Load selected medicine information
                 * so edit mode can display the current medicine.
                 */
                if (data.medicine) {
                    try {
                        const medicineData = await getMedicines({
                            search: data.medicine_name || "",
                            is_active: true,
                        });

                        const medicineList =
                            medicineData.results || medicineData;

                        const currentMedicine = medicineList.find(
                            (medicine) =>
                                Number(medicine.id) === Number(data.medicine)
                        );

                        if (currentMedicine) {
                            setSelectedMedicine(currentMedicine);
                            setMedicineSearch(currentMedicine.name);
                        }
                    } catch (medicineError) {
                        console.error(
                            "Selected Medicine Error:",
                            medicineError
                        );
                    }
                }
            } catch (error) {
                console.error("Batch Error:", error);

                setError(
                    error.response?.data?.detail ||
                    "Failed to load batch."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBatch();
    }, [id, isEditMode]);

    /*
     * Close medicine dropdown when clicking outside
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                medicineDropdownRef.current &&
                !medicineDropdownRef.current.contains(event.target)
            ) {
                setShowMedicineDropdown(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);


    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleGenerateBatchNumber = async () => {
        if (batchNumberGenerated || generatingBatchNumber) {
            return;
        }

        try {
            setGeneratingBatchNumber(true);
            setError("");

            const data = await generateBatchNumber();

            setFormData((previous) => ({
                ...previous,
                batch_number: data.batch_number,
            }));

            setBatchNumberGenerated(true);
        } catch (error) {
            console.error(
                "Generate Batch Number Error:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Failed to generate batch number."
            );
        } finally {
            setGeneratingBatchNumber(false);
        }
    };

    const handleMedicineSearch = (e) => {
        const value = e.target.value;

        setMedicineSearch(value);
        setShowMedicineDropdown(true);

        /*
         * If user changes the selected medicine manually,
         * remove the previous selection.
         */
        if (
            selectedMedicine &&
            value !== selectedMedicine.name
        ) {
            setSelectedMedicine(null);

            setFormData((previous) => ({
                ...previous,
                medicine: "",
            }));
        }
    };

    const handleMedicineSelect = (medicine) => {
        setSelectedMedicine(medicine);
        setMedicineSearch(
            `${medicine.name}${
                medicine.strength
                    ? ` - ${medicine.strength}`
                    : ""
            }`
        );

        setFormData((previous) => ({
            ...previous,
            medicine: medicine.id,
        }));

        setShowMedicineDropdown(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        /*
         * Make sure medicine is selected.
         */
        if (!formData.medicine) {
            setError("Please select a medicine.");
            return;
        }

        setSaving(true);

        try {
            const payload = {
                ...formData,
                medicine: Number(formData.medicine),
                pack_size: Number(formData.pack_size),
                purchase_price: formData.purchase_price,
                selling_price: formData.selling_price,
            };

            if (isEditMode) {
                await updateBatch(id, payload);
            } else {
                await createBatch(payload);
            }

            navigate("/batches");
        } catch (error) {
            console.error("Save Batch Error:", error);

            const responseData = error.response?.data;

            if (typeof responseData === "object") {
                const firstError = Object.values(responseData)?.[0];

                setError(
                    Array.isArray(firstError)
                        ? firstError[0]
                        : firstError ||
                          "Failed to save batch."
                );
            } else {
                setError("Failed to save batch.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (user?.role !== "ADMIN") {
        return (
            <div className="page-error">
                You do not have permission to manage batches.
            </div>
        );
    }

    if (loading) {
        return (
            <div className="page-loading">
                Loading batch...
            </div>
        );
    }

    return (
        <div className="medicine-form-page">
            <div className="page-header">
                <div>
                    <h2>
                        {isEditMode
                            ? "Edit Batch"
                            : "Add Batch"}
                    </h2>

                    <p>
                        {isEditMode
                            ? "Update batch information"
                            : "Add a new medicine batch"}
                    </p>
                </div>

                <button
                    type="button"
                    className="secondary-button"
                    onClick={() => navigate("/batches")}
                >
                    ← Back
                </button>
            </div>

            <div className="form-card">
                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-section">
                        <div className="form-section-title">
                            <h3>Batch Information</h3>

                            <p>
                                Enter medicine batch and expiry details.
                            </p>
                        </div>

                        <div className="form-grid">

                            {/* Medicine Search */}
                            <div
                                className="form-group full-width"
                                ref={medicineDropdownRef}
                                style={{
                                    position: "relative",
                                }}
                            >
                                <label>
                                    Medicine <span>*</span>
                                </label>

                                <input
                                    type="text"
                                    value={medicineSearch}
                                    onChange={handleMedicineSearch}
                                    onFocus={() =>
                                        setShowMedicineDropdown(true)
                                    }
                                    placeholder="Search medicine..."
                                    autoComplete="off"
                                    required={!formData.medicine}
                                />

                                {showMedicineDropdown && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            right: 0,
                                            zIndex: 1000,
                                            background: "#fff",
                                            border: "1px solid #ddd",
                                            borderRadius: "8px",
                                            marginTop: "4px",
                                            maxHeight: "250px",
                                            overflowY: "auto",
                                            boxShadow:
                                                "0 4px 12px rgba(0,0,0,0.12)",
                                        }}
                                    >
                                        {medicineLoading ? (
                                            <div
                                                style={{
                                                    padding: "12px",
                                                    color: "#666",
                                                }}
                                            >
                                                Searching...
                                            </div>
                                        ) : medicines.length > 0 ? (
                                            medicines.map(
                                                (medicine) => (
                                                    <button
                                                        type="button"
                                                        key={medicine.id}
                                                        onClick={() =>
                                                            handleMedicineSelect(
                                                                medicine
                                                            )
                                                        }
                                                        style={{
                                                            width: "100%",
                                                            border: "none",
                                                            background:
                                                                "transparent",
                                                            padding:
                                                                "12px 14px",
                                                            textAlign:
                                                                "left",
                                                            cursor: "pointer",
                                                            borderBottom:
                                                                "1px solid #eee",
                                                        }}
                                                    >
                                                        <strong>
                                                            {
                                                                medicine.name
                                                            }
                                                        </strong>

                                                        {medicine.strength && (
                                                            <span
                                                                style={{
                                                                    marginLeft:
                                                                        "8px",
                                                                    color: "#666",
                                                                }}
                                                            >
                                                                {
                                                                    medicine.strength
                                                                }
                                                            </span>
                                                        )}

                                                        {medicine.generic_name && (
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "13px",
                                                                    color: "#888",
                                                                    marginTop:
                                                                        "3px",
                                                                }}
                                                            >
                                                                {
                                                                    medicine.generic_name
                                                                }
                                                            </div>
                                                        )}
                                                    </button>
                                                )
                                            )
                                        ) : (
                                            <div
                                                style={{
                                                    padding: "12px",
                                                    color: "#666",
                                                }}
                                            >
                                                No medicine found.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedMedicine && (
                                    <small
                                        style={{
                                            display: "block",
                                            marginTop: "6px",
                                            color: "#666",
                                        }}
                                    >
                                        Selected:{" "}
                                        <strong>
                                            {selectedMedicine.name}
                                            {selectedMedicine.strength
                                                ? ` - ${selectedMedicine.strength}`
                                                : ""}
                                        </strong>
                                    </small>
                                )}
                            </div>

                            {/* Batch Number */}
                            <div className="form-group">
                                <label>
                                    Batch Number <span>*</span>
                                </label>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                    }}
                                >
                                    <input
                                        type="text"
                                        name="batch_number"
                                        value={formData.batch_number}
                                        placeholder="Click Generate"
                                        readOnly
                                        required
                                        style={{
                                            flex: 1,
                                        }}
                                    />

                                    {!isEditMode && (
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={handleGenerateBatchNumber}
                                            disabled={
                                                batchNumberGenerated ||
                                                generatingBatchNumber
                                            }
                                        >
                                            {generatingBatchNumber
                                                ? "Generating..."
                                                : batchNumberGenerated
                                                ? "Generated"
                                                : "Generate"}
                                        </button>
                                    )}
                                </div>

                                <small
                                    style={{
                                        display: "block",
                                        marginTop: "6px",
                                        color: "#666",
                                    }}
                                >
                                    Batch number is generated automatically.
                                </small>
                            </div>                                      

                            {/* Expiry Date */}
                            <div className="form-group">
                                <label>
                                    Expiry Date <span>*</span>
                                </label>

                                <input
                                    type="date"
                                    name="expiry_date"
                                    value={formData.expiry_date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Pack Size */}
                            <div className="form-group">
                                <label>
                                    Pack Size <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    name="pack_size"
                                    value={formData.pack_size}
                                    onChange={handleChange}
                                    placeholder="e.g. 10"
                                    min="1"
                                    required
                                />
                            </div>

                            {/* Purchase Price */}
                            <div className="form-group">
                                <label>
                                    Purchase Price <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    name="purchase_price"
                                    value={formData.purchase_price}
                                    onChange={handleChange}
                                    placeholder="e.g. 80.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            {/* Selling Price */}
                            <div className="form-group">
                                <label>
                                    Selling Price <span>*</span>
                                </label>

                                <input
                                    type="number"
                                    name="selling_price"
                                    value={formData.selling_price}
                                    onChange={handleChange}
                                    placeholder="e.g. 100.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* QR */}
                    <div className="form-section">
                        <div className="form-section-title">
                            <h3>QR Code</h3>

                            <p>
                                A unique QR code will be generated
                                automatically for this batch.
                            </p>
                        </div>

                        <div className="qr-info-box">
                            <strong>
                                Automatic QR Generation
                            </strong>

                            <span>
                                The backend will generate the QR
                                code after this batch is created.
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="secondary-button"
                            onClick={() =>
                                navigate("/batches")
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isEditMode
                                ? "Update Batch"
                                : "Save Batch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BatchForm;