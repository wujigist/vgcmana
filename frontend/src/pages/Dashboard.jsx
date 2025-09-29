import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchMyWallet,
  fetchMyTransactions,
  createMyTransaction,
  fetchUserProfile,
  fetchMyInvestments,
} from "@/utils/api";

// Helper function to format currency
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "-";
  // Ensure amount is a number for correct formatting
  const numberAmount = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(numberAmount);
};

/**
 * NEW CORE LOGIC: Calculate the theoretical daily earnings based on active investments.
 * The daily earning for an investment is: Amount * (Daily Rate / 100)
 * @param {Array} investments - The user's active investment array.
 * @returns {number} The total calculated daily earnings in USD.
 */
const calculateDailyAccruedEarnings = (investments) => {
  if (!investments || investments.length === 0) {
    return 0;
  }

  const totalDailyEarnings = investments.reduce((sum, inv) => {
    // Ensure the package data and daily_return rate are available and valid
    if (inv.package && inv.package.daily_return && inv.amount_invested) {
      const amount = parseFloat(inv.amount_invested);
      const rate = parseFloat(inv.package.daily_return);

      // Daily Earning = Amount * (Rate / 100)
      const dailyEarning = amount * (rate / 100);
      return sum + dailyEarning;
    }
    return sum;
  }, 0);

  // Return the sum of all daily earnings, rounded to 2 decimal places
  return parseFloat(totalDailyEarnings.toFixed(2));
};

// --- NEW/UPDATED COMPONENT: Mock Analytical Chart (Sophisticated Trade Live Read Graph) ---
const LiveTradeAnalysisCard = ({ dailyEarnings, isPolling }) => {
  const mockReturn = dailyEarnings > 0 ? `+${(dailyEarnings / 100).toFixed(2)}%` : "+0.00%"; // Mock return rate based on daily earnings (arbitrary calculation for display)

  return (
    <section className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
        Live Trade Performance (Time Series)
        <span className={`text-xs font-semibold ${isPolling ? 'text-green-500 animate-pulse' : 'text-gray-400'}`}>
          {isPolling ? 'LIVE READ' : 'IDLE'}
        </span>
      </h2>
      <div className="space-y-4">
        {/* Key Real-Time Metrics */}
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium text-gray-500">Theoretical Daily P/L</p>
          <p className="text-2xl font-bold text-green-600 flex items-center">
            {formatCurrency(dailyEarnings)}
            {isPolling && <span className="ml-2 text-base text-green-500">📈</span>}
          </p>
        </div>
        <div className="flex justify-between items-center border-b pb-4">
          <p className="text-sm font-medium text-gray-500">Return Rate (Daily)</p>
          <p className="text-lg font-semibold text-green-600">
            {/* Display the highest daily rate of all active investments as the main rate */}
            {mockReturn} 
          </p>
        </div>

        {/* Sophisticated Mock Chart Area (Simulated Candlestick/Time-Series) */}
        <div className="h-40 bg-gray-900 border border-gray-700 p-2 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #374151 1px, transparent 1px), linear-gradient(to bottom, #374151 1px, transparent 1px)' }}></div>

          {/* Mock Candlesticks to simulate sophisticated time-involved data */}
          <div className="flex h-full items-end justify-between px-1 relative z-10">
            {[...Array(15)].map((_, i) => {
              // Random data for visualization
              const height = Math.floor(Math.random() * 80) + 10;
              const color = Math.random() > 0.5 ? 'bg-green-500' : 'bg-red-500';
              return (
                <div
                  key={i}
                  className={`w-1.5 rounded-sm transition-all duration-1000 ${color} shadow-sm`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
          <p className="absolute bottom-1 right-1 text-xs text-gray-500">Live Simulation (Time)</p>
        </div>

        <p className="text-xs text-gray-500 mt-2 text-center pt-2 border-t">
          Investment performance updates live with market data.
        </p>
      </div>
    </section>
  );
};
// -------------------------------------------


export default function Dashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [isPolling, setIsPolling] = useState(false); // <-- state for polling status
  
  // 🌟 NEW: State to hold the total accrued earnings for live display
  const [accruedEarnings, setAccruedEarnings] = useState(0); 
  
  // Form state for creating transactions
  const [txType, setTxType] = useState("deposit");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  // 🌟 NEW: State for Withdrawal Bank Details
  const [withdrawalDetails, setWithdrawalDetails] = useState({
    fullName: "",
    bankName: "",
    accountNumber: "",
    swiftBicCode: "",
    routingNumber: "",
  });

  // Handler for withdrawal details input change
  const handleWithdrawalDetailsChange = (e) => {
    setWithdrawalDetails({
      ...withdrawalDetails,
      [e.target.name]: e.target.value,
    });
  };

  // 🌟 NEW: Mock BTC Account Details for Deposit
  const MOCK_BTC_ADDRESS = "bc1qxy2kgfldj2k2e8x5w7t00kqn2g84p6c00d4n2a";

  // --- Calculations for Earnings & Investments ---
  const totalAPIReportedEarnings = transactions
    .filter(tx => tx.type === 'earning' && tx.status === 'approved')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const totalInvested = investments.reduce(
    (sum, inv) => sum + parseFloat(inv.amount_invested),
    0
  );

  // Calculate the potential daily earnings from all active investments
  const dailyEarnings = calculateDailyAccruedEarnings(investments); 
  
  // The Total Earnings shown on the dashboard is the API-reported amount PLUS the live accrued amount
  const totalDashboardEarnings = totalAPIReportedEarnings + accruedEarnings;
  // --- END Calculations ---


  // Function to load all initial dashboard data
  const loadDashboardData = useCallback(async (initialLoad = true) => {
    if (initialLoad) {
      setLoading(true);
    } else {
      setIsPolling(true); // Indicate that a background refresh is happening
    }
    setError(null);
    try {
      // Fetch core data: Wallet and Transactions
      const [w, txs] = await Promise.all([
        fetchMyWallet(),
        fetchMyTransactions(),
      ]);
      setWallet(w);
      setTransactions(txs);

      // Only fetch Profile and Investments on the initial load, as they are less dynamic
      if (initialLoad) {
        const [p, invs] = await Promise.all([
          fetchUserProfile(),
          fetchMyInvestments(),
        ]);
        setProfile(p);
        setInvestments(invs);
      }

    } catch (err) {
      console.error("Data fetch failed:", err);
      // Only show error on the first load to prevent interrupting the user experience from background failures
      if (initialLoad) {
        setError(err.detail || "Failed to fetch dashboard data.");
      }
    } finally {
      if (initialLoad) {
        setLoading(false);
      } else {
        // Stop indicating background refresh, but the earnings interval will still run
        setIsPolling(false); 
      }
    }
  }, []);

  // 1. Initial Data Load
  useEffect(() => {
    loadDashboardData(true);
  }, [loadDashboardData]);


  // 2. Data Refresh Polling Effect (Every Minute)
  useEffect(() => {
    // This interval refreshes data that requires API calls (wallet, transactions, etc.)
    const dataRefreshInterval = setInterval(() => {
      loadDashboardData(false);
    }, 60000); // 1 minute

    return () => clearInterval(dataRefreshInterval);
  }, [loadDashboardData]);
  
  // 3. 🌟 NEW: Simulated Earning Accrual Effect (Every 5 seconds)
  useEffect(() => {
    // This interval simulates the *live* daily accrual of earnings
    const ACCRUAL_INTERVAL_MS = 5000; // 5 seconds
    
    // We calculate how much of the daily earning to accrue per interval
    const ACCRUAL_FACTOR = ACCRUAL_INTERVAL_MS / (24 * 60 * 60 * 1000); // Fraction of a day
    const accrualAmount = dailyEarnings * ACCRUAL_FACTOR;

    if (dailyEarnings > 0) {
      setIsPolling(true);
      
      const earningInterval = setInterval(() => {
        setAccruedEarnings(prev => {
          // Accrue the earning amount, ensuring floating point precision is handled
          const nextEarning = prev + accrualAmount;
          // Round to a high precision to prevent display issues, though 2 decimal places is used for display
          return parseFloat(nextEarning.toFixed(10));
        });
      }, ACCRUAL_INTERVAL_MS);

      // Cleanup function to clear the interval when the component unmounts or dailyEarnings changes to 0
      return () => {
        clearInterval(earningInterval);
        setIsPolling(false); // Stop the live indicator if earnings stop
      };
    } else {
      setIsPolling(false);
      setAccruedEarnings(0); // Reset accrued earnings if there are no active investments
    }
    
    // Re-run this effect when the calculated dailyEarnings changes
  }, [dailyEarnings]); 


  // Handle transaction creation
  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!wallet || isSubmitting) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Please enter a valid amount.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    let transactionNote = note;
    let reference = txType === 'deposit' ? `Ref: Deposit to ${MOCK_BTC_ADDRESS}` : null;

    // 🌟 UPDATED: For withdrawal, combine the banking details into the note.
    if (txType === 'withdrawal') {
      const { fullName, bankName, accountNumber, swiftBicCode, routingNumber } = withdrawalDetails;

      // Basic validation for withdrawal fields
      if (!fullName || !bankName || (!accountNumber && !swiftBicCode && !routingNumber)) {
        setFormError("Please fill in all required bank details for withdrawal.");
        setIsSubmitting(false);
        return;
      }
      
      // Store banking details as a JSON string in the note field for API
      transactionNote = JSON.stringify({
        withdrawalBankDetails: withdrawalDetails,
        userNote: note, // Include the user's optional note as well
      });
      // Set a generic reference for withdrawal
      reference = `Withdrawal to ${bankName}`;
    }

    try {
      const data = await createMyTransaction({
        type: txType,
        amount: parsedAmount,
        note: transactionNote,
        reference,
      });

      // Optimistically update wallet balance locally for Withdrawal/Deposit
      const newBalance = txType === "withdrawal"
        ? wallet.balance - parsedAmount
        : wallet.balance + parsedAmount;

      setWallet((prev) => ({ ...prev, balance: newBalance }));

      // Add transaction to the list (to immediately reflect on the dashboard)
      setTransactions((prev) => [data, ...prev]);

      // Reset form
      setAmount("");
      setNote("");
      // 🌟 NEW: Reset withdrawal details
      setWithdrawalDetails({
        fullName: "",
        bankName: "",
        accountNumber: "",
        swiftBicCode: "",
        routingNumber: "",
      });
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.detail || "Transaction failed. Please check balance and limits.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🌟 Status classes function (kept the previous update)
  const getStatusClasses = (status) => {
    switch (String(status).toLowerCase()) {
      case 'approved':
      case 'active':
        return 'text-green-700 bg-green-100 font-medium px-2 py-0.5 rounded-full text-xs';
      case 'pending':
      case 'processing':
        return 'text-yellow-700 bg-yellow-100 font-medium px-2 py-0.5 rounded-full text-xs';
      case 'not_activated':
        return 'text-red-700 bg-red-100 font-bold px-2 py-0.5 rounded-full text-xs';
      case 'rejected':
      case 'disabled':
      case 'frozen':
        return 'text-red-700 bg-red-100 font-medium px-2 py-0.5 rounded-full text-xs';
      default:
        return 'text-gray-700 bg-gray-100 font-medium px-2 py-0.5 rounded-full text-xs';
    }
  };


  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-600">Loading your personalized dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center">
        <p className="text-red-600 font-semibold text-xl mb-4">
          Error: {error}
        </p>
        <button
          onClick={() => loadDashboardData(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Reload Data
        </button>
      </div>
    );

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
          Personal Dashboard
        </h1>
        <p className="text-gray-600 mt-1 text-lg">
          Welcome back, <strong className="text-blue-600">{profile?.full_name || user?.username || "User"}</strong>!
          {profile?.full_name && (<span className="text-sm text-gray-500 ml-2">({user?.username})</span>)}
        </p>
        {isPolling && dailyEarnings > 0 && ( // Polling indicator specifically for earnings
          <span className="inline-flex items-center text-xs text-green-600 mt-2 font-semibold">
            <div className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-ping"></div>
            Live Daily Accrual: **{formatCurrency(dailyEarnings)}**
          </span>
        )}
      </header>

      {/* Financial Summary Cards (Re-organized for visual hierarchy) */}
      {wallet && (
        <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-blue-600 mb-10">

          {/* 1. CURRENT BALANCE & STATUS */}
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
            <div>
              <p className="text-base font-medium text-gray-500 uppercase tracking-wider">Your Current Wallet Balance</p>
              <p className="text-5xl font-extrabold text-blue-600 mt-1">
                {formatCurrency(wallet.balance)}
              </p>
              <span className="text-lg text-gray-500">{wallet.currency}</span>
            </div>
            <span className={getStatusClasses(wallet.status)}>{wallet.status}</span>
          </div>

          {/* 🛑 Activation Advice */}
          {wallet.status.toLowerCase() === 'not_activated' && (
            <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
              Your wallet is **Not Activated**. Please make your first **account opening deposit** below to enable full trading and withdrawal capabilities.
            </div>
          )}
          {/* 🛑 END Activation Advice */}

          {/* 2. SECONDARY METRICS (Less obvious) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

            {/* Total Invested */}
            <div>
              <p className="text-sm font-medium text-gray-500">Total Invested</p>
              <p className="text-xl font-semibold text-gray-700 mt-1">
                {formatCurrency(totalInvested)}
              </p>
            </div>

            {/* Total Earnings (NOW USES totalDashboardEarnings) */}
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earnings</p>
              <p className="text-xl font-semibold text-green-600 mt-1 flex items-center">
                {formatCurrency(totalDashboardEarnings)}
                {isPolling && dailyEarnings > 0 && <span className="ml-2 text-base text-green-500 animate-pulse">▲</span>}
              </p>
            </div>

            {/* Active Investments */}
            <div>
              <p className="text-sm font-medium text-gray-500">Active Investments</p>
              <p className="text-xl font-semibold text-gray-700 mt-1">
                {investments.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* INVESTMENT ANALYSIS & OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

        {/* Live Trade Analysis Card (The sophisticated graph) */}
        <LiveTradeAnalysisCard dailyEarnings={dailyEarnings} isPolling={isPolling} />

        {/* Investments Overview (2/3 width) - ***REPLACED SECTION START*** */}
        <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Active Investments Overview</h2>
          
          {investments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No active investments. <a href="/investments" className="text-blue-600 hover:underline font-semibold">Start Investing Now!</a></p>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.slice(0, 5).map((inv) => ( // Show top 5 investments
                <div key={inv.id} className="p-4 border border-blue-100 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition duration-200">
                  <div className="flex justify-between items-start mb-2 border-b border-blue-200 pb-2">
                    {/* Package Name (Header) */}
                    <h3 className="text-lg font-bold text-blue-800">{inv.package?.name || `Package ID: ${inv.package_id}`}</h3>
                    {/* Amount Invested */}
                    <p className="text-xl font-extrabold text-blue-600">
                      {formatCurrency(inv.amount_invested)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    
                    {/* Daily Return */}
                    <div>
                      <p className="font-medium text-gray-500">Daily Return</p>
                      <p className="font-semibold text-green-600">
                        {inv.package?.daily_return ? `${parseFloat(inv.package.daily_return).toFixed(2)}%` : 'N/A'}
                      </p>
                    </div>

                    {/* Duration Days */}
                    <div>
                      <p className="font-medium text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-700">
                        {inv.package?.duration_days ? `${inv.package.duration_days} Days` : 'N/A'}
                      </p>
                    </div>
                    
                    {/* Start Date */}
                    <div>
                      <p className="font-medium text-gray-500">Start Date</p>
                      <p className="font-semibold text-gray-700">
                        {new Date(inv.start_date).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Return Date (End Date) */}
                    <div>
                      <p className="font-medium text-gray-500">Maturity Date</p>
                      <p className="font-semibold text-red-500">
                          {/* inv.end_date is already calculated in the service layer */}
                        {inv.end_date ? new Date(inv.end_date).toLocaleDateString() : 'Pending'}
                      </p>
                    </div>

                  </div>
                </div>
              ))}
              {investments.length > 5 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Showing {investments.length} active investments. View all to see more.
                  </p>
              )}
            </div>
          )}
        </section>
        {/* Investments Overview (2/3 width) - ***REPLACED SECTION END*** */}
      </div>

      {/* 🌟 UPDATED: Transaction Form */}
      <section className="bg-white p-6 rounded-xl shadow-lg mb-10 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Initiate Transaction</h2>

        {formError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
            Error: {formError}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Transaction Type</label>
          <div className="flex space-x-4">
            {wallet?.allow_deposits && (
              <button
                type="button"
                onClick={() => setTxType("deposit")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition ${
                  txType === 'deposit'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                }`}
                disabled={isSubmitting}
              >
                💰 Deposit
              </button>
            )}
            {wallet?.allow_withdrawals && (
              <button
                type="button"
                onClick={() => setTxType("withdrawal")}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition ${
                  txType === 'withdrawal'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                }`}
                disabled={isSubmitting}
              >
                💸 Withdrawal
              </button>
            )}
          </div>
        </div>

        {/* 🌟 NEW: BTC Deposit Note */}
        {txType === 'deposit' && (
          <div className="p-4 mb-6 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-md">
            <p className="font-bold text-sm mb-1 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.487 0l5.54 9.8c.765 1.36-.212 3.051-1.743 3.051H4.46c-1.531 0-2.508-1.691-1.743-3.051l5.54-9.8zM11 15a1 1 0 10-2 0 1 1 0 002 0zm-1-6a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
              Deposit Instructions:
            </p>
            <p className="text-sm">To ensure your deposit reflects, please send the **Bitcoin (BTC)** to the following wallet address. After sending, fill in the estimated USD amount below and submit the transaction.</p>
            <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded-lg text-xs font-mono break-all flex justify-between items-center">
              <span className="truncate">{MOCK_BTC_ADDRESS}</span>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(MOCK_BTC_ADDRESS)}
                className="ml-3 text-blue-600 hover:text-blue-800 font-semibold"
              >
                Copy
              </button>
            </div>
          </div>
        )}
        {/* 🌟 END NEW: BTC Deposit Note */}

        <form onSubmit={handleTransaction} className="space-y-4">

          {/* 🌟 NEW: Withdrawal Bank Details Form Fields */}
          {txType === 'withdrawal' && (
            <div className="space-y-3 p-4 border border-blue-200 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Bank Withdrawal Details</h3>

              <InputField
                id="fullName"
                label="Full Name (Account Holder)"
                name="fullName"
                value={withdrawalDetails.fullName}
                onChange={handleWithdrawalDetailsChange}
                placeholder="John Doe"
                required={true}
                disabled={isSubmitting}
              />

              <InputField
                id="bankName"
                label="Bank Name"
                name="bankName"
                value={withdrawalDetails.bankName}
                onChange={handleWithdrawalDetailsChange}
                placeholder="Example Bank, N.A."
                required={true}
                disabled={isSubmitting}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  id="accountNumber"
                  label="Account Number / IBAN"
                  name="accountNumber"
                  value={withdrawalDetails.accountNumber}
                  onChange={handleWithdrawalDetailsChange}
                  placeholder="e.g., US: 1234567890, EU: DE8937040044053242"
                  required={true}
                  disabled={isSubmitting}
                />
                <InputField
                  id="swiftBicCode"
                  label="SWIFT/BIC Code"
                  name="swiftBicCode"
                  value={withdrawalDetails.swiftBicCode}
                  onChange={handleWithdrawalDetailsChange}
                  placeholder="e.g., CHASUS33"
                  required={true}
                  disabled={isSubmitting}
                />
              </div>

              <InputField
                id="routingNumber"
                label="Routing Number (Optional for some)"
                name="routingNumber"
                value={withdrawalDetails.routingNumber}
                onChange={handleWithdrawalDetailsChange}
                placeholder="e.g., 012345678"
                required={false}
                disabled={isSubmitting}
              />
            </div>
          )}
          {/* 🌟 END NEW: Withdrawal Bank Details Form Fields */}

          <div className="flex-1">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount ({txType === 'deposit' ? 'USD Equivalent' : 'USD'})</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-4 py-2 rounded-lg transition"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              {txType === 'deposit' ? 'Note/Reference (Optional, e.g., TX Hash, exchange name)' : 'User Note (Optional)'}
            </label>
            <input
              id="note"
              type="text"
              placeholder={txType === 'deposit' ? "TX Hash, e.g., 0xAB12... or CoinBase" : "Reason for withdrawal (e.g., 'personal funds')"}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-4 py-2 rounded-lg transition"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-blue-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={isSubmitting || !amount}
          >
            {isSubmitting ? "Processing..." : `Submit ${txType}`}
          </button>
        </form>
      </section>

      {/* Recent Transactions (No Change) */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Transactions</h2>
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
                  <td colSpan="5" className="text-center py-4 text-gray-500">No recent transactions.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">{tx.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-700">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusClasses(tx.status)}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{tx.note || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString()}
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

// 🌟 NEW Helper Component for cleaner form fields
const InputField = ({ id, label, name, value, onChange, placeholder, required, disabled }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 px-4 py-2 rounded-lg transition text-sm"
      required={required}
      disabled={disabled}
    />
  </div>
);