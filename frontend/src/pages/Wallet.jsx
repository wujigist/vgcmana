// src/pages/Wallet.jsx

import { useEffect, useState } from "react";
import { fetchMyWallet, fetchMyTransactions } from "@/utils/api";

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
};

// Helper function to format date
const formatDate = (dateString) => {
    if (!dateString) return "-";
    // Check if it's already a Date object or a valid string
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadWallet() {
      setLoading(true);
      setError(null);
      try {
        const [w, t] = await Promise.all([
            fetchMyWallet(),
            fetchMyTransactions()
        ]);
        setWallet(w);
        setTransactions(t);
      } catch (err) {
        console.error("Failed to load wallet data:", err);
        // The error object might have a 'detail' field from the FastAPI HTTPException
        setError(err.detail || "Failed to load wallet data.");
      } finally {
        setLoading(false);
      }
    }
    loadWallet();
  }, []);
  
  const getStatusClasses = (status) => {
    switch (String(status).toLowerCase()) {
      case 'approved':
      case 'active':
        return 'text-green-700 bg-green-100 font-medium px-2 py-0.5 rounded-full text-xs';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 font-medium px-2 py-0.5 rounded-full text-xs';
      case 'rejected':
      case 'cancelled':
      case 'disabled': // Added disabled for completeness
      case 'frozen': // Added frozen for completeness
        return 'text-red-700 bg-red-100 font-medium px-2 py-0.5 rounded-full text-xs';
      default:
        return 'text-gray-700 bg-gray-100 font-medium px-2 py-0.5 rounded-full text-xs';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-600">Loading wallet data...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-10 text-center">
        <p className="text-red-600 font-semibold text-xl">Error: {error}</p>
    </div>
  );

  if (!wallet) return <p className="p-4 text-center text-xl text-gray-500">No wallet found for your account.</p>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Wallet 💳</h1>

      {/* Wallet Summary */}
      <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border-b-4 border-blue-600">
        <div className="flex justify-between items-center mb-4 border-b pb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Account Summary</h2>
            <span className={getStatusClasses(wallet.status)}>{wallet.status}</span>
        </div>
        
        {/* Main Details Grid - Only contains Balance now */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-6">
            
            {/* Balance (Top-left, spans 2 columns on small screens) */}
            <div className="sm:col-span-2">
                <p className="text-sm font-medium text-gray-500">Balance</p>
                <p className="text-4xl font-extrabold text-blue-600 mt-1">
                    {formatCurrency(wallet.balance)} <span className="text-base text-gray-500">{wallet.currency}</span>
                </p>
            </div>
            
            {/* Wallet ID and User ID removed from here */}
        </div>
        
        {/* Capabilities Section */}
        <div className="pt-4 border-t mt-6">
            <p className="text-sm font-medium text-gray-500 mb-2">Capabilities</p>
            <div className="flex flex-wrap gap-4">
                <span className={`px-3 py-1 text-sm rounded-full ${wallet.allow_deposits ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {wallet.allow_deposits ? 'Deposits Allowed' : 'Deposits Disabled'}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${wallet.allow_withdrawals ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {wallet.allow_withdrawals ? 'Withdrawals Allowed' : 'Withdrawals Disabled'}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${wallet.allow_purchases ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {wallet.allow_purchases ? 'Purchases Allowed' : 'Purchases Disabled'}
                </span>
            </div>
        </div>
      </div>

      {/* Transactions Table */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Transaction History</h2>
      <div className="overflow-x-auto shadow-xl rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Note</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                  <tr>
                      <td colSpan="5" className="text-center py-4 text-gray-500">No transactions recorded.</td>
                  </tr>
                ) : (
                transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{t.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-700">
                          {formatCurrency(t.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getStatusClasses(t.status)}>
                              {t.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{t.note || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(t.created_at)}
                        </td>
                    </tr>
                ))
              )}
            </tbody>
        </table>
      </div>
    </div>
  );
}