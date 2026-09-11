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
import POS from "../pages/sales/POS";
import SalesList from "../pages/sales/SalesList";
import SaleDetails from "../pages/sales/SaleDetails";
import TransferList from "../pages/transfers/TransferList";
import TransferForm from "../pages/transfers/TransferForm";
import TransferDetails from "../pages/transfers/TransferDetails";
import BranchList from "../pages/branches/BranchList";
import BranchForm from "../pages/branches/BranchForm";
import UserList from "../pages/users/UserList";
import UserForm from "../pages/users/UserForm";
import QRMedicine from "../pages/qr/QRMedicine";




const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                {/* Public */}
                <Route
                    path="/login"
                    element={<Login />}
                />
                <Route
                    path="/qr/:qrCode"
                    element={<QRMedicine />}
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

                    <Route
                        path="/sales"
                        element={<POS />}
                    />
                    <Route
                        path="/sales/history"
                        element={<SalesList />}
                    />
                    <Route
                        path="/sales/:id"
                        element={<SaleDetails />}
                    />

                    <Route
                        path="/transfers"
                        element={<TransferList />}
                    />
                    <Route
                        path="/transfers/new"
                        element={<TransferForm />}
                    />
                    <Route
                        path="/transfers/:id"
                        element={<TransferDetails />}
                    />

                    <Route path="/branches" element={<BranchList />} />
                    <Route path="/branches/new" element={<BranchForm />} />
                    <Route path="/branches/:id/edit" element={<BranchForm />} />

                    <Route path="/users" element={<UserList />} />
                    <Route path="/users/new" element={<UserForm />} />
                    <Route path="/users/:id/edit" element={<UserForm />} />
                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;