import { useEffect, useState, useCallback } from "react";
// Assuming these API functions are correctly defined and use your provided API key implicitly
import {
  fetchAllUserInvestments,
  fetchInvestmentPackages,
  createInvestmentPackage,
  updateUserInvestment,
  updateInvestmentPackage,
} from "@/utils/api";

// Custom Toast/Message Box Component
const MessageToast = ({ message, isError, onClose }) => {
  if (!message) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl text-white max-w-sm w-full transition-opacity duration-300 transform ${isError ? 'bg-red-600' : 'bg-green-600'} flex justify-between items-center`}
      role="alert"
    >
      <div>
        <div className="font-bold">{isError ? 'Error' : 'Success'}</div>
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-4 text-white opacity-70 hover:opacity-100 transition"
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
};

export default function AdminInvestments() {
  const [investments, setInvestments] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Message Box state
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  // Form state for creating a new package
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dailyReturn, setDailyReturn] = useState("");
  const [durationDays, setDurationDays] = useState("");

  // Track edits using object maps { id: { field: value } }
  const [investmentEdits, setInvestmentEdits] = useState({});
  const [packageEdits, setPackageEdits] = useState({});

  // Function to show custom message toast
  const showMessage = useCallback((msg, error = false) => {
    setIsError(error);
    setMessage(msg);
    // Auto-hide after 4 seconds
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer); // Cleanup function for good measure
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Ensure we explicitly wait for a list of data, not single objects
      const [invs, pkgs] = await Promise.all([
        fetchAllUserInvestments(),
        fetchInvestmentPackages()
      ]);
      setInvestments(invs || []); // Default to empty array if API returns null/undefined
      setPackages(pkgs || []);
      setError(null);
    } catch (err) {
      console.error("Data loading error:", err);
      // Handle potential API errors that return JSON response structure { "detail": "message" }
      const errorMessage = err.detail || err.message || "Failed to fetch data";
      setError(errorMessage);
      showMessage(`Loading failed: ${errorMessage}`, true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Handlers for Package Creation ------------------------------------
  const handleCreatePackage = async () => {
    if (!name || !minAmount || !dailyReturn || !durationDays) {
      return showMessage("Please fill in all required fields (Name, Min Amount, Daily Return, Duration)", true);
    }

    try {
      const payload = {
        name,
        description,
        min_amount: parseFloat(minAmount),
        // Use null if maxAmount is empty string, otherwise parse
        max_amount: maxAmount ? parseFloat(maxAmount) : null,
        daily_return: parseFloat(dailyReturn),
        duration_days: parseInt(durationDays, 10),
      };

      const pkg = await createInvestmentPackage(payload);
      setPackages((prev) => [pkg, ...prev]);

      // Reset form fields
      setName(""); setDescription(""); setMinAmount(""); setMaxAmount("");
      setDailyReturn(""); setDurationDays("");

      showMessage(`Package "${pkg.name}" created successfully!`);
    } catch (err) {
      console.error("Package creation error:", err);
      showMessage(err.detail || "Failed to create package", true);
    }
  };

  // --- Handlers for User Investment Edits --------------------------------
  const handleInvestmentChange = (id, field, value) => {
    setInvestmentEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSaveInvestment = async (id) => {
    const payload = investmentEdits[id];
    if (!payload) return;

    try {
      const parsedPayload = { ...payload };

      // Ensure amount_invested is a float if present in edits
      if (parsedPayload.amount_invested !== undefined) {
        parsedPayload.amount_invested = parseFloat(parsedPayload.amount_invested);
      }
      // Ensure end_date is formatted correctly if present in edits
      if (parsedPayload.end_date !== undefined) {
        // Assuming the backend expects a standard date string (e.g., ISO format)
        // If the value is a YYYY-MM-DD string from the input, it should be fine.
        // If it needs to be an ISO date with time, this may need adjustment based on the API spec.
        // For now, we pass the date string directly from the input.
      }
      
      const updated = await updateUserInvestment(id, parsedPayload);

      // Update the main state with the response
      setInvestments((prev) => prev.map((inv) => (inv.id === id ? updated : inv)));
      // Clear the edit state for this ID
      setInvestmentEdits((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      showMessage(`Investment ${id} updated successfully!`);
    } catch (err) {
      console.error("Investment update error:", err);
      showMessage(err.detail || "Failed to update investment", true);
    }
  };

  // --- Handlers for Package Edits ----------------------------------------
  const handlePackageChange = (id, field, value) => {
    setPackageEdits((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleSavePackage = async (id) => {
    const payload = packageEdits[id];
    if (!payload) return;

    try {
      const parsedPayload = { ...payload };

      // Ensure numerical fields are parsed correctly if they are being edited
      if (parsedPayload.min_amount !== undefined) {
        parsedPayload.min_amount = parseFloat(parsedPayload.min_amount);
      }
      if (parsedPayload.max_amount !== undefined && parsedPayload.max_amount !== null) {
        // Handle max_amount input being empty string (set to null)
        parsedPayload.max_amount = parsedPayload.max_amount === "" ? null : parseFloat(parsedPayload.max_amount);
      } else if (parsedPayload.max_amount === "") {
        // If the user explicitly clears the input, send null to the API
        parsedPayload.max_amount = null;
      }
      if (parsedPayload.daily_return !== undefined) {
        parsedPayload.daily_return = parseFloat(parsedPayload.daily_return);
      }
      if (parsedPayload.duration_days !== undefined) {
        parsedPayload.duration_days = parseInt(parsedPayload.duration_days, 10);
      }

      const updated = await updateInvestmentPackage(id, parsedPayload);
      setPackages((prev) => prev.map((pkg) => (pkg.id === id ? updated : pkg)));
      setPackageEdits((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
      showMessage(`Package ${updated.name} updated successfully!`);
    } catch (err) {
      console.error("Package update error:", err);
      showMessage(err.detail || "Failed to update package", true);
    }
  };

  if (loading) return <p className="p-6 text-lg font-medium text-blue-600">Loading investment data...</p>;
  if (error) return <p className="p-6 text-red-500 text-lg font-medium">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <MessageToast
        message={message}
        isError={isError}
        onClose={() => setMessage(null)}
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 border-b-4 border-blue-500 pb-2">
          Admin Investment Management Dashboard
        </h1>

        {/* ----------------- Create New Package Section ----------------- */}
        <div className="mb-10 p-6 border-2 border-green-200 rounded-xl bg-white shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-green-700">Create New Investment Package</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input type="text" placeholder="Package Name *" value={name} onChange={(e) => setName(e.target.value)} className="border border-gray-300 px-4 py-2 rounded-lg focus:ring-green-500 focus:border-green-500 transition duration-150" required/>
            <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="border border-gray-300 px-4 py-2 rounded-lg" />
            <input type="number" placeholder="Min Amount * ($)" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} className="border border-gray-300 px-4 py-2 rounded-lg" required/>
            <input type="number" placeholder="Max Amount (optional) ($)" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} className="border border-gray-300 px-4 py-2 rounded-lg" />
            <input type="number" placeholder="Daily Return (%) *" value={dailyReturn} onChange={(e) => setDailyReturn(e.target.value)} className="border border-gray-300 px-4 py-2 rounded-lg" required/>
            <input type="number" placeholder="Duration (days) *" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} className="border border-gray-300 px-4 py-2 rounded-lg" required/>
          </div>
          <button onClick={handleCreatePackage} className="mt-6 bg-green-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-green-700 transition duration-300 shadow-md transform hover:scale-[1.01] active:scale-95">
            Create Package
          </button>
        </div>

        {/* ----------------- Existing Packages Section ----------------- */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Existing Investment Packages</h2>
          {packages.length === 0 ? <p className="text-gray-500 p-4 bg-white rounded-lg shadow-sm">No packages created yet.</p> :
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const isEditing = packageEdits[pkg.id] !== undefined;
              // Use edit state if available, otherwise use original package data
              const currentName = packageEdits[pkg.id]?.name ?? pkg.name;
              const currentDesc = packageEdits[pkg.id]?.description ?? pkg.description;

              // Ensure we display numbers nicely or fall back to original value/empty string
              const currentMinAmount = packageEdits[pkg.id]?.min_amount ?? pkg.min_amount;
              const currentMaxAmount = packageEdits[pkg.id]?.max_amount !== undefined
                ? packageEdits[pkg.id].max_amount
                : pkg.max_amount ?? "";
              const currentDailyReturn = packageEdits[pkg.id]?.daily_return ?? pkg.daily_return;
              const currentDuration = packageEdits[pkg.id]?.duration_days ?? pkg.duration_days;
              const currentIsActive = packageEdits[pkg.id]?.is_active ?? pkg.is_active;

              return (
                <div key={pkg.id} className={`border p-5 rounded-xl shadow-lg transition duration-300 hover:shadow-xl ${currentIsActive ? 'border-blue-400 bg-blue-50' : 'border-red-400 bg-red-50'}`}>
                  <input
                    type="text"
                    value={currentName}
                    onChange={(e) => handlePackageChange(pkg.id, "name", e.target.value)}
                    className="font-extrabold text-xl text-gray-800 border-b border-gray-300 px-2 py-1 rounded w-full mb-2 bg-transparent focus:bg-white"
                  />
                  <textarea
                    value={currentDesc || ''}
                    onChange={(e) => handlePackageChange(pkg.id, "description", e.target.value)}
                    className="border border-gray-300 px-2 py-1 rounded w-full mb-3 h-16 resize-none text-sm focus:border-blue-500"
                    placeholder="Package Description"
                  />
                  <div className="space-y-2 text-sm mb-4">
                    <label className="block">Min Amount ($):
                        <input type="number" value={currentMinAmount} onChange={(e) => handlePackageChange(pkg.id, "min_amount", e.target.value)} className="border px-2 py-1 rounded w-full mt-1 focus:border-blue-500"/>
                    </label>
                    <label className="block">Max Amount ($):
                        {/* Note: Max amount can be set to null/empty string for no maximum */}
                        <input type="number" value={currentMaxAmount} onChange={(e) => handlePackageChange(pkg.id, "max_amount", e.target.value !== "" ? e.target.value : null)} className="border px-2 py-1 rounded w-full mt-1 focus:border-blue-500"/>
                    </label>
                    <label className="block">Daily Return (%):
                        <input type="number" value={currentDailyReturn} onChange={(e) => handlePackageChange(pkg.id, "daily_return", e.target.value)} className="border px-2 py-1 rounded w-full mt-1 focus:border-blue-500"/>
                    </label>
                    <label className="block">Duration (days):
                        <input type="number" value={currentDuration} onChange={(e) => handlePackageChange(pkg.id, "duration_days", e.target.value)} className="border px-2 py-1 rounded w-full mt-1 focus:border-blue-500"/>
                    </label>
                  </div>
                  <select
                    value={currentIsActive}
                    onChange={(e) => handlePackageChange(pkg.id, "is_active", e.target.value === "true")}
                    className={`border px-3 py-2 rounded-lg w-full mb-4 font-semibold appearance-none transition ${currentIsActive ? 'bg-green-100 border-green-500 text-green-800' : 'bg-red-100 border-red-500 text-red-800'}`}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                  <button
                    onClick={() => handleSavePackage(pkg.id)}
                    disabled={!isEditing}
                    className={`w-full py-2 rounded-lg font-semibold transition duration-200 shadow ${isEditing ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md transform hover:scale-[1.01] active:scale-95' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                  >
                    {isEditing ? 'Save Package Changes' : 'No Edits'}
                  </button>
                </div>
              );
            })}
          </div>}
        </div>

        {/* ----------------- User Investments Table Section ----------------- */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">All User Investments</h2>
          {investments.length === 0 ? <p className="text-gray-500 p-4 bg-white rounded-lg shadow-sm">No user investments found.</p> :
          <div className="overflow-x-auto bg-white rounded-xl shadow-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Package</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount ($)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Earnings ($)</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {investments.map((inv) => {
                  const isEditing = investmentEdits[inv.id] !== undefined;

                  // Date formatting helper
                  const formatDateForInput = (dateString) => {
                    if (!dateString) return '';
                    try {
                      // Attempt to create a date and format to YYYY-MM-DD
                      return new Date(dateString).toISOString().split('T')[0];
                    } catch {
                      return '';
                    }
                  };
                  
                  // Determine display values for editable fields
                  const displayAmount = investmentEdits[inv.id]?.amount_invested ?? inv.amount_invested;
                  const displayStatus = investmentEdits[inv.id]?.status ?? inv.status;
                  const displayEndDate = investmentEdits[inv.id]?.end_date ?? formatDateForInput(inv.end_date);
                  
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition">
                      {/* FIX APPLIED HERE: Convert ID to string before using substring */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {String(inv.id).substring(0, 8)}...
                      </td>
                      {/* FIX APPLIED HERE: Convert User ID to string before using substring */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {String(inv.user_id).substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-800">
                        {packages.find((p) => p.id === inv.package_id)?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <input
                          type="number"
                          value={displayAmount}
                          onChange={(e)=>handleInvestmentChange(inv.id, 'amount_invested', e.target.value)}
                          className="border px-2 py-1 rounded w-24 text-sm focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <select
                          value={displayStatus}
                          onChange={(e)=>handleInvestmentChange(inv.id, 'status', e.target.value)}
                          className={`border px-2 py-1 rounded w-28 text-sm font-medium ${displayStatus === 'active' ? 'bg-green-100 text-green-800' : displayStatus === 'matured' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                        >
                          <option value="active">Active</option>
                          <option value="matured">Matured</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(inv.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <input
                          type="date"
                          value={displayEndDate}
                          onChange={(e)=>handleInvestmentChange(inv.id, 'end_date', e.target.value)}
                          className="border px-2 py-1 rounded w-32 text-sm focus:border-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                        ${(parseFloat(inv.total_earnings) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={()=>handleSaveInvestment(inv.id)}
                          disabled={!isEditing}
                          className={`px-4 py-2 rounded-lg transition duration-200 text-white text-sm font-semibold ${isEditing ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md active:scale-95' : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>}
        </div>
      </div>
    </div>
  );
}
