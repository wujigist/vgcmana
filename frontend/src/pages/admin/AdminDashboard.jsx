import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchUsers,
  fetchWallets, // <-- Now used
  // Assumed:
  createAdminTransaction,
  fetchAdminTransactions,
} from "@/utils/api";

// --- Helper Functions ---
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "-";
  // Enforce sophisticated financial display
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
      return 'text-red-700 bg-red-100';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

// --- Component: Admin Transaction Form (Modularized) ---
const AdminTransactionForm = ({ users, userMap, loadTransactions }) => {
  const [amount, setAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [txType, setTxType] = useState("deposit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount || parseFloat(amount) <= 0) {
      setError("Please select a user and enter a valid positive amount.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await createAdminTransaction({
        user_id: selectedUser,
        type: txType,
        amount: parseFloat(amount),
      });

      setAmount("");
      setSelectedUser("");
      loadTransactions(); // Refresh the main transactions list and metrics
      // Note: A success toast/notification would be ideal here
    } catch (err) {
      console.error("Admin Tx failed:", err);
      setError(err.detail || "Failed to create transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Manual Ledger Adjustment</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
          Error: {error}
        </div>
      )}

      <form onSubmit={handleTransaction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="md:col-span-2">
            <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700 mb-1">Target User</label>
            <select
              id="userSelect"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2 rounded-lg transition"
              disabled={isSubmitting}
              required
            >
              <option value="">Select User Account</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {userMap[u.id]} (ID: {u.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="txType" className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
            <select
              id="txType"
              value={txType}
              onChange={(e) => setTxType(e.target.value)}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2 rounded-lg transition"
              disabled={isSubmitting}
            >
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="earning">Add Earnings</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-2 rounded-lg transition"
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-purple-700 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-purple-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isSubmitting || !selectedUser || !amount}
        >
          {isSubmitting ? "Processing..." : `Execute ${txType}`}
        </button>
      </form>
    </section>
  );
};


// --- Main Dashboard Component ---
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [wallets, setWallets] = useState([]); // <-- New state for wallets
  const [loading, setLoading] = useState(true);

  // Map user IDs to names for professional table display
  const userMap = {};
  users.forEach(u => {
    // Prioritize full name, then username, then email, then ID
    userMap[u.id] = u.full_name || u.username || u.email || `User #${u.id}`;
  });

  // --- Calculations for Metrics ---
  const pendingApprovals = transactions.filter(tx => tx.status === 'pending').length;
  
  const totalPlatformBalance = wallets.reduce((sum, wallet) => 
    sum + parseFloat(wallet.balance || 0), 0
  );
  
  const totalTransactionsCount = transactions.length;


  const loadUsers = useCallback(async () => {
    try {
      const usersData = await fetchUsers();
      setUsers(usersData);
    } catch (error) {
        console.error("Failed to load users:", error);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    try {
      const txData = await fetchAdminTransactions();
      setTransactions(txData);
    } catch (error) {
        console.error("Failed to load transactions:", error);
    }
  }, []);

  // New function to load wallets
  const loadWallets = useCallback(async () => {
    try {
      const walletsData = await fetchWallets();
      setWallets(walletsData);
    } catch (error) {
        console.error("Failed to load wallets:", error);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    // Fetch users, transactions, AND wallets concurrently
    await Promise.all([loadUsers(), loadTransactions(), loadWallets()]); 
    setLoading(false);
  }, [loadUsers, loadTransactions, loadWallets]);


  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);


  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-600">Loading system overview...</p>
      </div>
    );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 border-b pb-4">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Administrative Control Panel ⚙️
        </h1>
        <p className="text-gray-600 mt-1 text-lg">
          Logged in as <strong className="text-blue-700">{user?.username || "System Administrator"}</strong>.
          Maintain and manage platform operations.
        </p>
      </header>
      
      {/* Key Metrics - Updated to use Wallets and Transactions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Metric 1: Total Users */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-500">Total Registered Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
        </div>
        
        {/* Metric 2: Total Platform Balance */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-500">Total Platform Balance</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalPlatformBalance)}
          </p>
        </div>
        
        {/* Metric 3: Pending Approvals */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
          <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
             {pendingApprovals}
          </p>
        </div>

        {/* Metric 4: Total Transactions */}
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
          <p className="text-sm font-medium text-gray-500">Total Transactions Logged</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
             {totalTransactionsCount}
          </p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <a 
          href="/admin/users" 
          className="text-center bg-green-700 text-white py-3 px-4 rounded-lg font-semibold shadow hover:bg-green-800 transition"
        >
          Manage User Accounts
        </a>
        <a 
          href="/admin/wallets" 
          className="text-center bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold shadow hover:bg-blue-800 transition"
        >
          Review Wallets & Balances
        </a>
        <button
          onClick={logout}
          className="text-center bg-red-600 text-white py-3 px-4 rounded-lg font-semibold shadow hover:bg-red-700 transition"
        >
          Logout Securely
        </button>
      </div>

      {/* Transaction Form (Modularized) */}
      <div className="mb-10">
        <AdminTransactionForm 
            users={users} 
            userMap={userMap} 
            loadTransactions={loadDashboardData} // Load all data to refresh metrics
        />
      </div>

      {/* Recent Transactions Table */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Platform Transaction Log</h2>
        <div className="overflow-x-auto shadow-xl rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipient/Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                 <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">No recent transactions found.</td>
                </tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {userMap[tx.user_id] || tx.wallet_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{tx.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-800">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${getStatusClasses(tx.status)} font-medium px-2 py-0.5 rounded-full text-xs`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      
    </div>
  );
}