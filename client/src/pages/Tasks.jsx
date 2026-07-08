import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardList, Edit3, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import PageShell from "../components/PageShell";
import StatusBadge from "../components/StatusBadge";
import TableShell from "../components/TableShell";
import api from "../services/api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Pending",
    priority: "Medium",
    employee: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks || []);
    } catch (err) {
      toast.error("Failed to load tasks");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.employees || []);
    } catch (err) {
      toast.error("Failed to load employees");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ title: "", description: "", status: "Pending", priority: "Medium", employee: "" });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, form);
        toast.success("Task updated successfully");
      } else {
        await api.post("/tasks", form);
        toast.success("Task created successfully");
      }

      resetForm();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      employee: task.employee?._id || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    return (
      task.title?.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase()) ||
      task.status?.toLowerCase().includes(search.toLowerCase()) ||
      task.priority?.toLowerCase().includes(search.toLowerCase()) ||
      task.employee?.name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Layout>
      <PageShell
        title="Task operations"
        description="Coordinate deliverables, priorities, and ownership with a polished workspace view."
        actions={[
          <button key="create" type="button" onClick={() => { setEditingId(null); setForm({ title: "", description: "", status: "Pending", priority: "Medium", employee: "" }); setIsModalOpen(true); }} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95">
            <Plus size={16} /> Create task
          </button>,
        ]}
      >
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Delivery queue</h2>
              <p className="text-sm text-slate-500">Search and update workstreams across the team.</p>
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              <Search size={14} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 bg-transparent outline-none" placeholder="Search tasks" aria-label="Search tasks" />
            </label>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><ClipboardList size={15} /> Total tasks</div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{tasks.length}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Sparkles size={15} /> Visible</div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{filteredTasks.length}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Search size={15} /> Search mode</div>
              <p className="mt-2 text-sm font-semibold text-slate-700">{search ? `Filtering “${search}”` : "Ready to plan"}</p>
            </div>
          </div>

          <TableShell title="Current tasks" subtitle="Priority, ownership, and delivery status all in one place.">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ClipboardList size={18} className="text-slate-400" />
                        <span>No tasks found for this search.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task._id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{task.title}</div>
                        <div className="text-sm text-slate-500">{task.description}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{task.employee?.name || "Unassigned"}</td>
                      <td className="px-6 py-4"><StatusBadge tone={task.status === "Completed" ? "success" : task.status === "In Progress" ? "warning" : "info"}>{task.status}</StatusBadge></td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{task.priority}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleEdit(task)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600" aria-label={`Edit ${task.title}`}>
                            <Edit3 size={16} />
                          </button>
                          <button type="button" onClick={() => handleDelete(task._id)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${task.title}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>
        </div>
      </PageShell>

      <Modal isOpen={isModalOpen} title={editingId ? "Edit task" : "Create task"} description="Add structure to your workflow with clear ownership and priority." onClose={resetForm}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Task title</span>
            <input name="title" value={form.title} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="Launch onboarding sprint" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="Describe the deliverable" rows="3" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white">
              <option>Pending</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Priority</span>
            <select name="priority" value={form.priority} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white">
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Assigned employee</span>
            <select name="employee" value={form.employee} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" required>
              <option value="">Select employee</option>
              {employees.map((emp) => (<option key={emp._id} value={emp._id}>{emp.name}</option>))}
            </select>
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
            <button type="submit" className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">{editingId ? "Save changes" : "Create task"}</button>
            <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

export default Tasks;