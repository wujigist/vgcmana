import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
// Import new API functions (assuming you put them in your api utility)
import { fetchUsers, updateWalletStatus, toggleWalletPermission } from "@/utils/api"; 

// --- Helper Functions (From previous fix) ---

const getRoleClasses = (role) => {
    const roleString = role ? String(role) : '';
    switch (roleString.toLowerCase()) {
        case 'admin':
            return 'text-white bg-red-600 font-bold';
        case 'superadmin':
            return 'text-white bg-purple-600 font-bold';
        case 'user':
        default:
            return 'text-gray-700 bg-gray-200';
    }
};

const getVerificationClasses = (level) => {
    const levelString = level ? String(level) : '';
    switch (levelString.toLowerCase()) {
        case 'verified':
            return 'text-green-700 bg-green-100 border border-green-300';
        case 'pending':
        case 'level_1':
            return 'text-yellow-700 bg-yellow-100 border border-yellow-300';
        case 'unverified':
        default:
            return 'text-red-700 bg-red-100 border border-red-300';
    }
};

// NEW: Helper for Wallet Status Colors
const getWalletStatusClasses = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'active') return 'text-green-700 bg-green-100';
    if (s === 'frozen') return 'text-yellow-700 bg-yellow-100';
    if (s === 'disabled' || s === 'wallet_missing') return 'text-red-700 bg-red-100';
    return 'text-gray-700 bg-gray-200';
};


export default function Users() {
    const { user, loading: authLoading, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // NEW: State for showing action result/feedback
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Note: Update fetchUsers in api.js to call the new admin/all endpoint
            const data = await fetchUsers(); 
            setUsers(data);
            setFeedback({ message: '', type: '' }); // Clear feedback on load
        } catch (err) {
            console.error(err);
            const detail = err.detail || err.response?.data?.detail || "Failed to fetch users";
            setError(detail);
            if (detail.includes("authenticated")) logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);


    // UPDATED: Handler for Status Update (added allow_purchases to state update)
    const handleStatusChange = async (userId, newStatus) => {
        if (!window.confirm(`Are you sure you want to set status for user ${userId} to ${newStatus}?`)) return;
        setLoading(true);
        try {
            const updatedWallet = await updateWalletStatus(userId, newStatus);
            // Update the user's data in the local state
            setUsers(prevUsers => prevUsers.map(u => 
                u.id === userId ? { 
                    ...u, 
                    wallet_status: updatedWallet.status,
                    allow_deposits: updatedWallet.allow_deposits,
                    allow_withdrawals: updatedWallet.allow_withdrawals,
                    allow_purchases: updatedWallet.allow_purchases, // ADDED
                } : u
            ));
            setFeedback({ message: `User ${userId} status updated to ${newStatus}.`, type: 'success' });
        } catch (err) {
            setFeedback({ message: err.detail || 'Failed to change status.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // UPDATED: Handler for Permission Toggle (added allow_purchases to state update)
    const handlePermissionToggle = async (userId, permission, isCurrentlyAllowed) => {
        const action = isCurrentlyAllowed ? 'disable' : 'enable';
        if (!window.confirm(`Are you sure you want to ${action} ${permission} for user ${userId}?`)) return;
        setLoading(true);
        try {
            const result = await toggleWalletPermission(userId, permission, action);
            const updatedWallet = result.wallet_status;

            // Update the user's data in the local state
            setUsers(prevUsers => prevUsers.map(u => 
                u.id === userId ? { 
                    ...u, 
                    wallet_status: updatedWallet.status,
                    allow_deposits: updatedWallet.allow_deposits,
                    allow_withdrawals: updatedWallet.allow_withdrawals,
                    allow_purchases: updatedWallet.allow_purchases, // ADDED
                } : u
            ));
            setFeedback({ message: result.message, type: 'success' });
        } catch (err) {
            setFeedback({ message: err.detail || 'Failed to toggle permission.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (authLoading || !user || user.role !== "admin") return;
        loadUsers();
    }, [user, authLoading, loadUsers]);

    if (authLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                <p className="mt-4 text-lg text-gray-600">Accessing User Registry...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 md:p-10 max-w-full mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
                    User Account Registry 🧑‍💻 (Admin)
                </h1>
                <div className="p-4 mb-4 rounded-lg bg-red-100 text-red-700 border border-red-300">
                    <p className="font-semibold">Error Loading Users:</p>
                    <p>{error}</p>
                    <button 
                        onClick={loadUsers} 
                        className="mt-2 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-full mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
                User Account Registry 🧑‍💻 (Admin)
            </h1>

            {/* NEW: Feedback Message */}
            {feedback.message && (
                <div className={`p-4 mb-4 rounded-lg text-white ${feedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {feedback.message}
                </div>
            )}
            
            <div className="overflow-x-auto shadow-xl rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username / Email</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Wallet Status</th>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th> {/* NEW COLUMN */}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{u.id}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                                    <div className="font-medium text-gray-900">{u.username}</div>
                                    <div className="text-xs text-gray-500">{u.email}</div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleClasses(u.role)}`}>
                                        {String(u.role).toUpperCase()}
                                    </span>
                                </td>
                                {/* NEW: Wallet Status */}
                                <td className="px-4 py-2 whitespace-nowrap text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getWalletStatusClasses(u.wallet_status)}`}>
                                        {u.wallet_status ? u.wallet_status.replace(/_/g, ' ').toUpperCase() : 'N/A'}
                                    </span>
                                </td>
                                {/* UPDATED: Action Buttons */}
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                    <div className="flex flex-col space-y-2">
                                        {/* Status Dropdown */}
                                        <select 
                                            className="p-1 border rounded text-xs bg-white cursor-pointer"
                                            value={u.wallet_status || ''}
                                            onChange={(e) => handleStatusChange(u.id, e.target.value)}
                                        >
                                            <option value="" disabled>Change Status</option>
                                            <option value="active">Activate</option>
                                            <option value="frozen">Freeze</option>
                                            <option value="disabled">Disable</option>
                                        </select>
                                        
                                        {/* Permission Toggles (Deposit) */}
                                        <button
                                            onClick={() => handlePermissionToggle(u.id, 'deposits', u.allow_deposits)}
                                            className={`px-2 py-1 text-xs rounded transition duration-150 ${
                                                u.allow_deposits 
                                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                            disabled={u.wallet_status === 'wallet_missing'}
                                        >
                                            {u.allow_deposits ? 'Disable Deposits' : 'Enable Deposits'}
                                        </button>
                                        
                                        {/* Permission Toggles (Withdrawal) */}
                                        <button
                                            onClick={() => handlePermissionToggle(u.id, 'withdrawals', u.allow_withdrawals)}
                                            className={`px-2 py-1 text-xs rounded transition duration-150 ${
                                                u.allow_withdrawals 
                                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                            disabled={u.wallet_status === 'wallet_missing'}
                                        >
                                            {u.allow_withdrawals ? 'Disable Withdrawals' : 'Enable Withdrawals'}
                                        </button>

                                        {/* NEW: Permission Toggles (Purchases) */}
                                        <button
                                            onClick={() => handlePermissionToggle(u.id, 'purchases', u.allow_purchases)}
                                            className={`px-2 py-1 text-xs rounded transition duration-150 ${
                                                u.allow_purchases 
                                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                                : 'bg-green-500 hover:bg-green-600 text-white'
                                            }`}
                                            disabled={u.wallet_status === 'wallet_missing'}
                                        >
                                            {u.allow_purchases ? 'Disable Purchases' : 'Enable Purchases'}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody >
                </table>
            </div>
        </div>
    );
}
