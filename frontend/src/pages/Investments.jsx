// Investments.js

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
// Ensure correct import path for your API functions
import { fetchInvestmentPackages, fetchMyInvestments, createInvestment } from "@/utils/api";

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
};

// Helper function to format percentage
const formatPercentage = (rate) => {
  if (rate === null || rate === undefined) return "-";
  // The logic here is correct for converting a decimal (e.g., 0.16) to a percentage string (16.00%)
  return `${(parseFloat(rate) * 100).toFixed(2)}%`;
};

// Component for a single Investment Package Card
const PackageCard = ({ pkg, selectedPackage, setSelectedPackage }) => {
  const isSelected = selectedPackage?.id === pkg.id;
  const cardClasses = isSelected
    ? "border-2 border-blue-600 bg-blue-50 shadow-lg scale-[1.02] transition duration-300"
    : "border border-gray-200 bg-white hover:shadow-md hover:border-blue-400 transition duration-300";

  // Calculate the decimal return rate for the formatting function
  // FIX APPLIED: We divide by 100 here to convert the whole number percentage (16)
  // from the database into the decimal fraction (0.16) expected by formatPercentage.
  const decimalDailyReturn = parseFloat(pkg.daily_return) / 100;

  return (
    <div key={pkg.id} className={`p-5 rounded-xl ${cardClasses} flex flex-col justify-between`}>
      <div>
        <h3 className="font-extrabold text-xl text-blue-800 mb-1">{pkg.name}</h3>
        <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
        <div className="space-y-1 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Min Investment:</span> {formatCurrency(pkg.min_amount)}
          </p>
          {pkg.max_amount && (
            <p>
              <span className="font-semibold">Max Investment:</span> {formatCurrency(pkg.max_amount)}
            </p>
          )}
          <p className="font-medium text-green-700">
            <span className="font-semibold text-gray-700">Daily Return:</span> <span className="text-green-600 font-bold">{formatPercentage(decimalDailyReturn)}</span>
          </p>
          <p>
            <span className="font-semibold">Duration:</span> <span className="font-medium">{pkg.duration_days} days</span>
          </p>
        </div>
      </div>
      <button
        onClick={() => setSelectedPackage(pkg)}
        className={`mt-4 w-full py-2 px-4 rounded-lg font-semibold transition duration-200 ${
          isSelected
            ? "bg-blue-700 text-white shadow-md cursor-default"
            : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg"
        }`}
        disabled={isSelected}
      >
        {isSelected ? "Package Selected" : "Select Package"}
      </button>
    </div>
  );
};


export default function Investments() {
  // const { user } = useAuth(); // Keeping for context, but not used in the logic provided
  const [packages, setPackages] = useState([]);
  const [myInvestments, setMyInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [amount, setAmount] = useState("");
  const [isInvesting, setIsInvesting] = useState(false);

  // Simple Notification State (replace with a real toast/modal later)
  const [notification, setNotification] = useState({ message: null, type: null });

  // Utility to find package name by ID
  const getPackageName = useCallback((packageId) => {
    return packages.find((p) => p.id === packageId)?.name || "N/A";
  }, [packages]);


  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use Promise.all to fetch data concurrently for better performance
      const [pkgs, invs] = await Promise.all([
        fetchInvestmentPackages(),
        fetchMyInvestments()
      ]);

      setPackages(pkgs);
      setMyInvestments(invs);
    } catch (err) {
      console.error("Investment data load error:", err);
      // Assuming 'detail' is a common error message field from your API
      setError(err.detail || "Failed to load investment data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleInvest = async () => {
    if (isInvesting) return;

    if (!selectedPackage) {
      return setNotification({ message: "Please select an investment package first.", type: "error" });
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return setNotification({ message: "Please enter a valid amount.", type: "error" });
    }

    const minAmount = parseFloat(selectedPackage.min_amount);
    const maxAmount = selectedPackage.max_amount ? parseFloat(selectedPackage.max_amount) : Infinity;

    if (amt < minAmount || amt > maxAmount) {
      const maxDisplay = selectedPackage.max_amount ? formatCurrency(selectedPackage.max_amount) : "∞";
      return setNotification({
        message: `Amount must be between ${formatCurrency(minAmount)} and ${maxDisplay}.`,
        type: "error"
      });
    }

    setIsInvesting(true);
    setNotification({ message: "Processing investment...", type: "info" });

    try {
      // API call to create investment
      const newInvestment = await createInvestment(selectedPackage.id, amt);

      // Update local state with the new investment
      setMyInvestments((prev) => [newInvestment, ...prev]);
      setAmount(""); // Clear input
      setSelectedPackage(null); // Optional: deselect package after investment

      setNotification({ message: "Investment successful! 🎉", type: "success" });
    } catch (err) {
      console.error("Investment creation error:", err);

      // 🌟 START OF LOGIC CHANGE
      let errorMessage = "Investment failed. Please try again.";

      // Check if the error object contains a response with a 'detail' field
      if (err.detail) {
        // Use the specific 'detail' message directly
        errorMessage = err.detail;
      } else if (err.response?.data?.detail) {
        // Fallback for axios error structure with a response body 'detail' field
        errorMessage = err.response.data.detail;
      }
      
      setNotification({ message: errorMessage, type: "error" });
      // 🌟 END OF LOGIC CHANGE

    } finally {
      setIsInvesting(false);
      // Clear info/success/error notification after 5 seconds
      if (notification.type !== 'info') {
          setTimeout(() => setNotification({ message: null, type: null }), 5000);
      }
    }
  };

  // Custom status color logic for better UX in the table
  const getStatusClasses = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-700 bg-green-100 font-medium px-2 py-0.5 rounded-full text-xs';
      case 'completed':
        return 'text-blue-700 bg-blue-100 font-medium px-2 py-0.5 rounded-full text-xs';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 font-medium px-2 py-0.5 rounded-full text-xs';
      case 'cancelled':
        return 'text-red-700 bg-red-100 font-medium px-2 py-0.5 rounded-full text-xs';
      default:
        return 'text-gray-700 bg-gray-100 font-medium px-2 py-0.5 rounded-full text-xs';
    }
  };

  // Notification UI element
  const NotificationToast = () => {
    if (!notification.message) return null;

    let classes = "";
    switch (notification.type) {
      case "success":
        classes = "bg-green-500 border-green-700";
        break;
      case "error":
        classes = "bg-red-500 border-red-700";
        break;
      case "info":
      default:
        classes = "bg-blue-500 border-blue-700";
        break;
    }

    return (
      <div
        className={`fixed top-4 right-4 z-50 p-4 text-white rounded-lg shadow-xl border-b-4 ${classes}`}
        role="alert"
      >
        <p className="font-semibold">{notification.message}</p>
      </div>
    );
  };


  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="ml-4 text-lg text-gray-600">Loading investment data...</p>
    </div>
  );

  // Note: The UI for error is fine, but we'll wrap it in the main professional layout
  if (error) return (
    <div className="p-10 text-center">
      <p className="text-red-600 font-semibold text-xl">
        Error Loading Data: {error} 🙁
      </p>
      <button
        onClick={loadData}
        className="mt-4 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
      >
        Try Again
      </button>
    </div>
  );


  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <NotificationToast />

      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Investment Dashboard 📈
        </h1>
        <p className="text-gray-600 mt-1">
          Explore available packages and review your current portfolio.
        </p>
      </header>

      {/* ----------------- */}

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-2">
          Available Investment Packages
        </h2>

        {/* Investment Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              selectedPackage={selectedPackage}
              setSelectedPackage={setSelectedPackage}
            />
          ))}
        </div>

        {/* ----------------- */}

        {/* Invest Form */}
        {selectedPackage && (
          <div className="mt-8 p-6 border-2 border-green-300 rounded-xl bg-green-50 shadow-lg">
            <h3 className="font-bold text-xl text-green-800 mb-3">
              Initiate Investment in <span className="underline">{selectedPackage.name}</span>
            </h3>
            <p className="text-sm text-green-700 mb-4">
              Range: {formatCurrency(selectedPackage.min_amount)}
              - {selectedPackage.max_amount ? formatCurrency(selectedPackage.max_amount) : "No Max"}
            </p>

            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="number"
                step="0.01"
                placeholder={`Enter amount (e.g., ${parseFloat(selectedPackage.min_amount) * 2})`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-green-400 focus:border-green-600 focus:ring-1 focus:ring-green-600 px-4 py-2 rounded-lg flex-1 transition duration-150"
                disabled={isInvesting}
              />
              <button
                onClick={handleInvest}
                className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
                disabled={isInvesting}
              >
                {isInvesting ? "Investing..." : "Confirm Investment"}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ----------------- */}

      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-2">
          My Active & Completed Investments
        </h2>

        {myInvestments.length === 0 ? (
          <div className="p-6 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 font-medium">
              You haven't made any investments yet. Select a package above to start!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-xl rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Package
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myInvestments.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getPackageName(inv.package_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {formatCurrency(inv.amount_invested)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusClasses(inv.status)}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(inv.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {inv.end_date ? new Date(inv.end_date).toLocaleDateString() : <span className="text-gray-400">- N/A -</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-green-600">
                      {formatCurrency(inv.total_earnings)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}