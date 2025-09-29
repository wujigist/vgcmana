import { jwtDecode } from "jwt-decode";

/**
 * Retrieve and decode the stored JWT.
 * @returns {object|null} Decoded token payload or null if missing/expired.
 */
export function getCurrentUserToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }
    return decoded;
  } catch (err) {
    console.error("Failed to decode token:", err);
    localStorage.removeItem("token");
    return null;
  }
}

export function canAccess(role, requiredRole) {
  return role === "admin" || role === requiredRole;
}
