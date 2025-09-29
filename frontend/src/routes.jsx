import { Routes, Route, Navigate } from "react-router-dom";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Wallet from "@/pages/Wallet";
import Investments from "@/pages/Investments";
import NotFoundPage from "@/pages/NotFoundPage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Users from "@/pages/admin/Users";
import Wallets from "@/pages/admin/Wallets";
import Transactions from "@/pages/admin/Transactions";
import AdminInvestments from "@/pages/admin/Investments";
// import AdminControls from "@/pages/admin/AdminControls";

// Context / Guards
import { RequireAuth, RequireAdmin } from "@/context/AuthContext";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected: Users */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      <Route path="/wallet" element={<RequireAuth><Wallet /></RequireAuth>} />
      <Route path="/investments" element={<RequireAuth><Investments /></RequireAuth>} />

      {/* Protected: Admin */}
      <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
      <Route path="/admin/users" element={<RequireAdmin><Users /></RequireAdmin>} />
      <Route path="/admin/wallets" element={<RequireAdmin><Wallets /></RequireAdmin>} />
      <Route path="/admin/transactions" element={<RequireAdmin><Transactions /></RequireAdmin>} />
      <Route path="/admin/investments" element={<RequireAdmin><AdminInvestments /></RequireAdmin>} />
      {/*
      <Route path="/admin/controls" element={<RequireAdmin><AdminControls /></RequireAdmin>} />
      */}

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
