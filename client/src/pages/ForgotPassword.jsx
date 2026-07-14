import { useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Mail, Lock, KeyRound } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, password });
      toast.success("Password reset successfully");
      setStep(1);
      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.16),_transparent_40%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-8 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col items-center justify-center rounded-[36px] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_90px_rgba(15,23,42,0.10)] backdrop-blur">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Reset your password</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Enter your email and we’ll send a secure OTP to continue.</p>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Email
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <Mail size={16} className="text-slate-400" />
                  <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full bg-transparent outline-none" placeholder="you@company.com" required />
                </div>
              </label>
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-70">
                {loading ? "Sending..." : "Send OTP"}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                OTP
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <KeyRound size={16} className="text-slate-400" />
                  <input value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-transparent outline-none" placeholder="123456" required />
                </div>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                New password
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <Lock size={16} className="text-slate-400" />
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full bg-transparent outline-none" required />
                </div>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Confirm password
                <div className="mt-2 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
                  <Lock size={16} className="text-slate-400" />
                  <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="w-full bg-transparent outline-none" required />
                </div>
              </label>
              <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-70">
                {loading ? "Resetting..." : "Reset password"}
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Back to <Link to="/" className="font-semibold text-indigo-600">sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
