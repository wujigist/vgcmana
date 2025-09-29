import apiClient from "./apiClient";

// -------------------- AUTH --------------------
export async function registerUser(payload) {
  const res = await apiClient.post("/auth/register", payload);
  return res.data;
}

export async function loginUser(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await apiClient.post("/auth/token", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return { access_token: res.data.access_token };
}

// -------------------- USERS / PROFILE --------------------
export async function fetchCurrentUser() {
  const res = await apiClient.get("/users/me");
  return res.data;
}

export async function fetchUserProfile() {
  const res = await apiClient.get("/users/me/profile");
  return res.data;
}

export async function updateUserProfile(payload) {
  const res = await apiClient.put("/users/me/profile", payload);
  return res.data;
}

// -------------------- WALLET (USER) --------------------
export async function fetchMyWallet() {
  const res = await apiClient.get("/wallets/me");
  return res.data;
}

export async function fetchMyTransactions() {
  const res = await apiClient.get("/wallets/me/transactions");
  return res.data;
}


// ✅ New helper for creating a user transaction
export async function createMyTransaction(payload) {
  const res = await apiClient.post("/wallets/me/transactions", payload);
  return res.data;
}

// -------------------- INVESTMENTS --------------------

// User investments
export async function fetchMyInvestments() {
  const res = await apiClient.get("/investments/me/investments");
  return res.data;
}


export async function createInvestment(packageId, amount) {
  const payload = {
    package_id: packageId,
    amount_invested: amount,
  };
  const res = await apiClient.post("/investments/me/invest", payload);
  return res.data;
}



// -------------------- ADMIN --------------------
export async function fetchUsers() {
  const res = await apiClient.get("/admin/users");
  return res.data;
}

export async function fetchWallets() {
  const res = await apiClient.get("/admin/wallets");
  return res.data;
}

export async function fetchAdminControls() {
  const res = await apiClient.get("/admin/controls");
  return res.data;
}

export async function updateAdminControls(payload) {
  const res = await apiClient.put("/admin/controls", payload);
  return res.data;
}

export async function updateWalletControls(walletId, payload) {
  const res = await apiClient.put(`/admin/wallets/${walletId}/controls`, payload);
  return res.data;
}

export async function fetchAdminTransactions() {
  const res = await apiClient.get("/admin/transactions");
  return res.data;
}

export async function createAdminTransaction(payload) {
  const res = await apiClient.post("/admin/transactions", payload);
  return res.data;
}

export async function approveTransaction(txnId) {
  const res = await apiClient.post(`/admin/transactions/${txnId}/approve`);
  return res.data;
}

export async function rejectTransaction(txnId) {
  const res = await apiClient.post(`/admin/transactions/${txnId}/reject`);
  return res.data;
}

export async function pendTransaction(txnId) {
  const res = await apiClient.post(`/admin/transactions/${txnId}/pend`);
  return res.data;
}


// Fetch all user investments
export async function fetchAllUserInvestments() {
  const res = await apiClient.get("/admin/investments");
  return res.data;
}

// Create a new investment package
export async function createInvestmentPackage(payload) {
  const res = await apiClient.post("/admin/investment-packages", payload);
  return res.data;
}

// Fetch all investment packages
export async function fetchInvestmentPackages() {
  const res = await apiClient.get("/investments/packages");
  return res.data;
}

// Update an existing user investment
export async function updateUserInvestment(investmentId, payload) {
  const res = await apiClient.put(`/admin/investments/${investmentId}`, payload);
  return res.data;
}

// Update an existing investment package
export async function updateInvestmentPackage(packageId, payload) {
  const res = await apiClient.put(`/admin/investment-packages/${packageId}`, payload);
  return res.data;
}



// NEW/FIXED: Status update path should be /admin/users/{userId}/wallet/status
export async function updateWalletStatus(userId, status) {
    const res = await apiClient.put(`/admin/users/${userId}/wallet/status`, { status });
    return res.data;
}

// NEW/FIXED: Permission toggle path should be /admin/users/{userId}/wallet/{permission}/toggle?action={action}
export async function toggleWalletPermission(userId, permission, action) {
    const res = await apiClient.put(`/admin/users/${userId}/wallet/${permission}/toggle?action=${action}`);
    return res.data;
}


// -------------------- UPLOADS --------------------
export const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL;
