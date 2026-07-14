import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BellRing, CheckCircle2, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import PageShell from "../components/PageShell";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
    } catch {
      toast.error("Failed to load notifications");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}`);
      fetchNotifications();
    } catch {
      toast.error("Unable to update notification");
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <Layout>
      <PageShell title="Notifications" description="A modern center for updates, requests, and team signals.">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_16px_70px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><BellRing size={18} /></div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Inbox</h2>
                <p className="text-sm text-slate-500">Recent activity and important reminders.</p>
              </div>
            </div>
            <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
              {unreadCount} unread
            </div>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <EmptyState title="No records found" description="No notifications are available." />
            ) : (
              notifications.map((item) => (
                <div key={item._id} className={`rounded-[22px] border p-4 shadow-sm transition ${item.read ? "border-slate-200 bg-white" : "border-indigo-100 bg-indigo-50/70"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3">
                      <div className={`mt-0.5 rounded-2xl p-2 ${item.read ? "bg-slate-100 text-slate-600" : "bg-white text-indigo-600"}`}>
                        {item.read ? <Sparkles size={15} /> : <BellRing size={15} />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                      </div>
                    </div>
                    {!item.read ? (
                      <button onClick={() => markRead(item._id)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        <CheckCircle2 size={14} /> Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PageShell>
    </Layout>
  );
}

export default Notifications;
