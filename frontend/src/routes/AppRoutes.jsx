import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import MedicineList from "../pages/medicines/MedicineList";
import MedicineForm from "../pages/medicines/MedicineForm";
import BatchList from "../pages/batches/BatchList";
import BatchForm from "../pages/batches/BatchForm";

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
                </Route>

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;