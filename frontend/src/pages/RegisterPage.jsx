import { useState } from "react";
import { registerUser } from "@/utils/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone_number: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await registerUser({
        email: form.email,
        password: form.password,
        profile: {
          full_name: form.full_name,
          phone_number: form.phone_number,
        },
      });
      navigate("/login?registered=true"); // Redirect to login with success hint
    } catch (err) {
      console.error(err);
      setError(err.detail || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-extrabold text-center text-gray-900 mb-6">
          Establish New Account
        </h1>
        <p className="text-center text-gray-500 mb-6">
            Provide the required details to create your secure platform profile.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium border border-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                    id="full_name"
                    type="text"
                    name="full_name"
                    placeholder="John Doe"
                    value={form.full_name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-3 rounded-lg shadow-sm transition"
                    required
                />
            </div>
            
            <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                <input
                    id="phone_number"
                    type="text"
                    name="phone_number"
                    placeholder="+1 (555) 123-4567"
                    value={form.phone_number}
                    onChange={handleChange}
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-3 rounded-lg shadow-sm transition"
                />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="example@corp.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-3 rounded-lg shadow-sm transition"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 p-3 rounded-lg shadow-sm transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Register Account"}
          </button>
          
          <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account? 
              <a href="/login" className="text-blue-700 font-medium hover:text-blue-500 ml-1 transition">
                  Login here
              </a>
          </p>
        </form>
      </div>
    </div>
  );
}