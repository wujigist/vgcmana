import { useState } from "react";
import { loginUser } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Assuming loginUser handles username (email) and password correctly
      const { access_token } = await loginUser(email, password);
      login(access_token);
    } catch (err) {
      console.error(err);
      setError(err.detail || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Access Control
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Please authenticate to continue to the system.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="admin@platform.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-3 rounded-lg shadow-sm transition"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-3 rounded-lg shadow-sm transition"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Authenticating..." : "Secure Login"}
          </button>
        </form>
        
        {/* REGISTER LINK ADDED HERE */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? 
          <a 
            href="/register" 
            className="font-medium text-blue-700 hover:text-blue-600 ml-1 transition"
          >
            Register here
          </a>
        </p>
        
      </div>
    </div>
  );
}