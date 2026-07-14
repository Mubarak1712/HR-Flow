import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success("Login successful");
      navigate(res.data.user?.role === "Admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.16),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col overflow-hidden rounded-[36px] border border-slate-200 bg-white/90 shadow-[0_24px_90px_rgba(15,23,42,0.10)] backdrop-blur lg:flex-row">
        <div className="flex flex-1 flex-col justify-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-8 sm:p-12 lg:p-16">
          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700"><Sparkles size={14} /> Northstar HR</div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">Welcome back to your command center.</h1>
            <p className="mt-4 text-lg leading-8 text-slate-500">Manage people, tasks, approvals, and payroll with a workspace designed for modern teams.</p>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center bg-white p-8 sm:p-12">
          <form onSubmit={handleLogin} className="w-full max-w-md rounded-[28px] border border-slate-200 bg-slate-50/70 p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Use your credentials to access the workspace.</p>

            <label className="mt-6 block text-sm font-medium text-slate-700">
              Email
              <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition focus-within:border-indigo-400">
                <Mail size={16} className="text-slate-400" />
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" className="w-full bg-transparent outline-none" required />
              </div>
            </label>

            <label className="mt-4 block text-sm font-medium text-slate-700">
              Password
              <div className="relative mt-2">
                <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 pr-12 transition focus-within:border-indigo-400">
                  <Lock size={16} className="text-slate-400" />
                  <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" className="w-full bg-transparent outline-none" required />
                </div>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-500" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70">
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight size={16} />
            </button>

            <p className="mt-6 text-center text-sm text-slate-500">
              <Link to="/forgot-password" className="font-semibold text-indigo-600">Forgot password?</Link>
            </p>
            <p className="mt-2 text-center text-sm text-slate-500">
              New here? <Link to="/register" className="font-semibold text-indigo-600">Create account</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;