import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Remove space & dashes from phone number input
      const cleanedPhone = phone.replace(/[-\s]/g, "");
      
      const result = await login(cleanedPhone, password);

      if (result && result.success) {
        // Direct redirect without manual refresh needed
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Login failed. Invalid phone or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl flex max-w-4xl w-full overflow-hidden">
        {/* Left Side */}
        <div className="w-1/2 bg-slate-700 p-10 text-white flex flex-col justify-between hidden md:flex">
          <div>
            <h2 className="text-2xl font-bold mb-2">SmartFIR</h2>
            <p className="text-sm text-slate-300">Police Dashboard System</p>
            
            <div className="mt-12 space-y-4">
              <h1 className="text-3xl font-bold">Welcome to<br />SmartFIR Dashboard</h1>
              <p className="text-xs text-slate-300">
                Advanced FIR management system with real-time suspect tracking and comprehensive case analytics.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400">🔒 Secure Access Only</div>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-sm text-gray-500">Sign in with your registered phone number</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-600 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03178874681"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-lg text-sm transition-all duration-200 shadow-md disabled:opacity-50"
            >
              {loading ? "Signing In..." : "➔ Sign In to Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;