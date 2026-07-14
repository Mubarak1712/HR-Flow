import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Globe2, Palette, Settings as SettingsIcon, TimerReset, UserCircle2 } from "lucide-react";
import Layout from "../components/Layout";
import PageShell from "../components/PageShell";
import api from "../services/api";

function Settings() {
  const [settings, setSettings] = useState({ companyName: "", workingHours: "", monthlyLeaveLimit: "", salaryDeductionPerExtraLeave: "", theme: "Light" });

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      setSettings({
        companyName: res.data.settings?.companyName || "",
        workingHours: res.data.settings?.workingHours || "",
        monthlyLeaveLimit: res.data.settings?.monthlyLeaveLimit || "",
        salaryDeductionPerExtraLeave: res.data.settings?.salaryDeductionPerExtraLeave || "",
        theme: res.data.settings?.theme || "Light",
      });
    } catch {
      toast.error("Failed to load settings");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSettings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put("/settings", settings);
      toast.success("Settings updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update settings");
    }
  };

  return (
    <Layout>
      <PageShell title="Settings" description="Refined preferences with a structured, elegant configuration experience.">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-[0_16px_70px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><SettingsIcon size={18} /></div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Workspace preferences</h2>
                <p className="text-sm text-slate-500">Adjust the most relevant business details with confidence.</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-indigo-50 p-2 text-indigo-600"><UserCircle2 size={16} /></div>
                  <div>
                    <p className="font-semibold text-slate-900">Company profile</p>
                    <p className="text-sm text-slate-500">Control the public-facing identity of the workspace.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-50 p-2 text-cyan-600"><TimerReset size={16} /></div>
                  <div>
                    <p className="font-semibold text-slate-900">Operating rules</p>
                    <p className="text-sm text-slate-500">Keep attendance and leave policies aligned and easy to review.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_16px_70px_rgba(15,23,42,0.06)] sm:p-6">
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Company name</span>
                <input name="companyName" value={settings.companyName} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="Northstar Labs" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Working hours</span>
                <input type="number" name="workingHours" value={settings.workingHours} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Monthly leave limit</span>
                <input type="number" name="monthlyLeaveLimit" value={settings.monthlyLeaveLimit} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Extra leave deduction</span>
                <input type="number" name="salaryDeductionPerExtraLeave" value={settings.salaryDeductionPerExtraLeave} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Theme</span>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <Palette size={14} /> Light
                    <input type="radio" name="theme" value="Light" checked={settings.theme === "Light"} onChange={handleChange} className="ml-1" />
                  </label>
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    <Globe2 size={14} /> System
                    <input type="radio" name="theme" value="System" checked={settings.theme === "System"} onChange={handleChange} className="ml-1" />
                  </label>
                </div>
              </label>
              <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
                <button type="submit" className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95">Save settings</button>
              </div>
            </form>
          </div>
        </div>
      </PageShell>
    </Layout>
  );
}

export default Settings;
