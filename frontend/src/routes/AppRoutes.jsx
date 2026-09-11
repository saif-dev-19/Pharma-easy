import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import MedicineList from "../pages/medicines/MedicineList";
import MedicineForm from "../pages/medicines/MedicineForm";
import BatchList from "../pages/batches/BatchList";
import BatchForm from "../pages/batches/BatchForm";
import Inventory from "../pages/inventory/Inventory";
import LowStock from "../pages/inventory/LowStock";
import ExpiredStock from "../pages/inventory/ExpiredStock";
import SupplierList from "../pages/suppliers/SupplierList";
import SupplierForm from "../pages/suppliers/SupplierForm";
import PurchaseList from "../pages/purchases/PurchaseList";
import PurchaseDetails from "../pages/purchases/PurchaseDetails";
import PurchaseForm from "../pages/purchases/PurchaseForm";




const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public */}
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Protected */}
                <Route
                    element={
                        <ProtectedRoute>
                            <MainLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/medicines"
                        element={<MedicineList />}
                    />
                    <Route
                        path="/medicines/new"
                        element={<MedicineForm />}
                    />
                    <Route
                        path="/medicines/:id/edit"
                        element={<MedicineForm />}
                    />
                    <Route
                        path="/batches"
                        element={<BatchList />}
                    />
                    <Route
                        path="/batches/new"
                        element={<BatchForm />}
                    />
                    <Route
                        path="/batches/:id/edit"
                        element={<BatchForm />}
                    />
                    <Route
                        path="/inventory"
                        element={<Inventory />}
                    />
                    <Route path="/inventory/low-stock" element={<LowStock />} />
                    <Route
                        path="/inventory/expired"
                        element={<ExpiredStock />}
                    />
                    <Route
                        path="/suppliers"
                        element={<SupplierList />}
                    />
                    <Route
                        path="/suppliers/new"
                        element={<SupplierForm />}
                    />

                    <Route
                        path="/suppliers/:id/edit"
                        element={<SupplierForm />}
                    />

                    <Route path="/purchases" element={<PurchaseList />} />
                    <Route path="/purchases/:id" element={<PurchaseDetails />} />
                    <Route path="/purchases/new" element={<PurchaseForm />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;