import { useEffect, useState, useCallback } from "react";
import { fetchAdminTransactions, approveTransaction, rejectTransaction, pendTransaction } from "@/utils/api";

// --- Helper Functions ---

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "$0.00";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
};

const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'pending':
      case 'processing':
        return 'text-yellow-700 bg-yellow-100';
      case 'rejected':
      case 'failed':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };


export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTransactions();
      // Sort by creation date or pending status for easier review
      const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setTransactions(sortedData);
    } catch (err) {
      console.error(err);
      setError(err.detail || err.response?.data?.detail || "Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleAction = async (txnId, action) => {
    // Optimistic update
    setTransactions((prev) => 
        prev.map(tx => tx.id === txnId ? { ...tx, status: 'Processing' } : tx)
    );

    try {
      let updated;
      if (action === "approve") updated = await approveTransaction(txnId);
      else if (action === "reject") updated = await rejectTransaction(txnId);
      else if (action === "pend") updated = await pendTransaction(txnId);

      // Final update
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === txnId ? updated : tx))
      );
    } catch (err) {
      console.error(err);
      alert(`Failed to update transaction status: ${err.detail || 'Server error'}`);
      // Reload on failure to revert optimistic update
      loadTransactions();
    }
  };

  if (loading) 
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-lg text-gray-600">Loading Transaction Audit Log...</p>
      </div>
    );
  
  if (error) 
    return (
      <div className="p-8 max-w-lg mx-auto bg-red-50 rounded-lg shadow-lg mt-10">
        <h2 className="text-xl font-bold text-red-700">Data Retrieval Error</h2>
        <p className="mt-2 text-red-600">{error}</p>
        <button onClick={loadTransactions} className="mt-4 text-blue-600 hover:text-blue-800 font-medium">
            Attempt Reload
        </button>
      </div>
    );

  return (
    <div className="p-6 md:p-10 max-w-full mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
        Transaction Review Portal 🛠️
      </h1>

      <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Txn ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Wallet ID</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submission Date</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap text-sm font-mono text-gray-900">{tx.id}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">{tx.wallet_id}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 capitalize">{tx.type}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold text-gray-800">
                    {formatCurrency(tx.amount)}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClasses(tx.status)}`}>
                        {tx.status}
                    </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap space-x-2">
                    {tx.status?.toLowerCase() === 'pending' || tx.status?.toLowerCase() === 'processing' ? (
                        <>
                            <button
                                onClick={() => handleAction(tx.id, "approve")}
                                className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-700 transition"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleAction(tx.id, "reject")}
                                className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-red-700 transition"
                            >
                                Reject
                            </button>
                        </>
                    ) : (
                        <span className="text-gray-400 text-xs">Finalized</span>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}