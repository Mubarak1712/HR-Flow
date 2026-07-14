import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Camera, Lock, Mail, UserRound } from "lucide-react";
import Layout from "../components/Layout";
import PageShell from "../components/PageShell";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "", address: "", department: "", position: "", employeeId: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      const currentUser = res.data;
      setProfile({
        name: currentUser.name || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        department: currentUser.department || "",
        position: currentUser.position || "",
        employeeId: currentUser.employeeRecordId || currentUser.employee || "",
      });
      setPhoto(currentUser.profilePhoto || "");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load profile");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleProfileChange = (e) => {
    setProfile((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put(`/employees/${profile.employeeId || ""}`, profile);
      toast.success(res.data?.message || "Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      const res = await api.put("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success(res.data?.message || "Password updated");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update password");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile.employeeId) {
      toast.error("Unable to upload photo until your employee profile is available");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setLoading(true);
        const res = await api.put(`/employees/${profile.employeeId}`, { profilePhoto: reader.result });
        setPhoto(reader.result);
        toast.success(res.data?.message || "Photo updated");
      } catch (error) {
        toast.error(error.response?.data?.message || "Unable to upload photo");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <PageShell title="Profile" description="Keep your personal details accurate and secure.">
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_70px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 text-xl font-semibold text-white">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{profile.name || "Your profile"}</h2>
                <p className="text-sm text-slate-500">{profile.position || "Team member"}</p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Camera size={16} className="text-indigo-600" />
                <span className="text-sm font-medium text-slate-700">Profile photo upload is enabled for your employee record.</span>
              </div>
              {photo ? <img src={photo} alt="Profile preview" className="mt-4 h-24 w-24 rounded-full object-cover" /> : null}
              <label className="mt-4 block text-sm font-medium text-slate-700">
                <span>Upload new photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mt-2 block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100" />
              </label>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_16px_70px_rgba(15,23,42,0.06)] sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Personal details</h3>
              <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Name</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <UserRound size={15} className="text-slate-400" />
                    <input name="name" value={profile.name} onChange={handleProfileChange} className="w-full bg-transparent outline-none" required />
                  </div>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Email</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <Mail size={15} className="text-slate-400" />
                    <input name="email" type="email" value={profile.email} onChange={handleProfileChange} className="w-full bg-transparent outline-none" required />
                  </div>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Phone</span>
                  <input name="phone" value={profile.phone} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none" />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Department</span>
                  <input name="department" value={profile.department} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none" />
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                  <span>Address</span>
                  <textarea name="address" value={profile.address} onChange={handleProfileChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none" rows="3" />
                </label>
                <div className="md:col-span-2 flex gap-3 pt-2">
                  <button type="submit" disabled={loading} className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70">{loading ? "Saving..." : "Save changes"}</button>
                </div>
              </form>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_16px_70px_rgba(15,23,42,0.06)] sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900">Change password</h3>
              <form onSubmit={handlePasswordChange} className="mt-5 grid gap-4">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Current password</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <Lock size={15} className="text-slate-400" />
                    <input type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="w-full bg-transparent outline-none" required />
                  </div>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>New password</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <Lock size={15} className="text-slate-400" />
                    <input type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full bg-transparent outline-none" required />
                  </div>
                </label>
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  <span>Confirm password</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                    <Lock size={15} className="text-slate-400" />
                    <input type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="w-full bg-transparent outline-none" required />
                  </div>
                </label>
                <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">Update password</button>
              </form>
            </div>
          </div>
        </div>
      </PageShell>
    </Layout>
  );
}

export default Profile;
