import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchWallets, updateWalletControls } from "@/utils/api";

// --- Helper Components ---

// Reusable Switch Component for professional controls
const ToggleSwitch = ({ checked, onChange, label, field }) => (
  <div className="flex items-center justify-center">
    <label htmlFor={`${field}-${label}`} className="sr-only">
      {label}
    </label>
    <input
      type="checkbox"
      id={`${field}-${label}`}
      checked={checked}
      onChange={onChange}
      className="hidden"
    />
    <div
      onClick={onChange}
      className={`relative w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${
        checked ? "bg-green-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      ></div>
    </div>
  </div>
);

// Helper for professional currency display
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "$0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
};


export default function Wallets() {
  const { user, loading: authLoading, logout } = useAuth();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWallets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming fetchWallets returns wallets with nested user info
      const w = await fetchWallets(); 
      setWallets(w);
    } catch (err) {
      console.error(err);
      const detail = err.detail || err.response?.data?.detail || "Failed to fetch wallets";
      setError(detail);
      if (detail.includes("authenticated")) logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (authLoading || !user || user.role !== "admin") return;
    loadWallets();
  }, [user, authLoading, loadWallets]);

  const toggleControl = async (walletId, field, value) => {
    // Optimistic UI Update
    setWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, [field]: value } : w))
    );

    try {
      await updateWalletControls(walletId, { [field]: value });
      // The state is already updated, no need to re-fetch unless server validation fails
    } catch (err) {
      // Rollback on failure
      setWallets((prev) =>
        prev.map((w) => (w.id === walletId ? { ...w, [field]: !value } : w))
      );
      console.error("Failed to update control:", err);
      alert(`Failed to update wallet control: ${err.detail || 'Server error'}`);
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg text-gray-600">Retrieving Financial Ledgers...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-8 max-w-lg mx-auto bg-red-50 rounded-lg shadow-lg mt-10">
        <h2 className="text-xl font-bold text-red-700">Access Error</h2>
        <p className="mt-2 text-red-600">{error}</p>
        <button onClick={loadWallets} className="mt-4 text-blue-600 hover:text-blue-800 font-medium">
            Attempt Reload
        </button>
      </div>
    );

  return (
    <div className="p-6 md:p-10 max-w-full mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
        Wallet Control Center 💳
      </h1>

      <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Wallet ID</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account Holder</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Current Balance</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Deposits</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Withdrawals</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Purchases</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {wallets.map((w) => (
              <tr key={w.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{w.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="font-semibold">{w.full_name || 'N/A'}</div>
                  <div className="text-xs text-gray-400">@{w.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-800">
                  <span className="font-bold text-lg">{formatCurrency(w.balance)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <ToggleSwitch
                    checked={w.allow_deposits}
                    onChange={(e) => toggleControl(w.id, "allow_deposits", e.target.checked)}
                    field={w.id}
                    label="Allow Deposits"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <ToggleSwitch
                    checked={w.allow_withdrawals}
                    onChange={(e) => toggleControl(w.id, "allow_withdrawals", e.target.checked)}
                    field={w.id}
                    label="Allow Withdrawals"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <ToggleSwitch
                    checked={w.allow_purchases}
                    onChange={(e) => toggleControl(w.id, "allow_purchases", e.target.checked)}
                    field={w.id}
                    label="Allow Purchases"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(w.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}