import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ClipboardList, Edit3, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import PageShell from "../components/PageShell";
import StatusBadge from "../components/StatusBadge";
import TableShell from "../components/TableShell";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function Tasks() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "Pending",
    priority: "Medium",
    employee: "",
    comment: "",
    comments: [],
  });

  const [editingId, setEditingId] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks || []);
    } catch {
      toast.error("Failed to load tasks");
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.employees || []);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchTasks();
      void fetchEmployees();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ title: "", description: "", status: "Pending", priority: "Medium", employee: "", comment: "", comments: [] });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...form };
      const trimmedComment = payload.comment?.trim();
      const nextComments = Array.isArray(payload.comments) ? payload.comments : [];

      if (trimmedComment) {
        nextComments.push({
          text: trimmedComment,
          author: user?.name || "Admin",
          createdAt: new Date().toISOString(),
        });
      }

      delete payload.comment;
      payload.comments = nextComments;

      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload);
        toast.success("Task updated successfully");
      } else {
        await api.post("/tasks", payload);
        toast.success("Task created successfully");
      }

      resetForm();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      employee: task.employee?._id || task.assignedTo?._id || "",
      comment: "",
      comments: task.comments || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Task deleted successfully");
      fetchTasks();
    } catch {
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

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const pagedTasks = filteredTasks.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Layout>
      <PageShell
        title="Task operations"
        description="Coordinate deliverables, priorities, and ownership with a polished workspace view."
        actions={user?.role === "Admin" ? [
          <button key="create" type="button" onClick={() => { setEditingId(null); setForm({ title: "", description: "", status: "Pending", priority: "Medium", employee: "", comment: "", comments: [] }); setIsModalOpen(true); }} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95">
            <Plus size={16} /> Create task
          </button>,
        ] : []}
      >
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Delivery queue</h2>
              <p className="text-sm text-slate-500">Search and update workstreams across the team.</p>
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              <Search size={14} />
              <input value={search} onChange={handleSearchChange} className="w-56 bg-transparent outline-none" placeholder="Search tasks" aria-label="Search tasks" />
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
                {pagedTasks.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                      <EmptyState title="No records found" description="No tasks are available for this view." />
                    </td>
                  </tr>
                ) : (
                  pagedTasks.map((task) => (
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
                          {user?.role === "Admin" ? (
                            <>
                              <button type="button" onClick={() => handleEdit(task)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600" aria-label={`Edit ${task.title}`}>
                                <Edit3 size={16} />
                              </button>
                              <button type="button" onClick={() => handleDelete(task._id)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${task.title}`}>
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <button type="button" onClick={() => handleEdit(task)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600" aria-label={`Update ${task.title}`}>
                              <Edit3 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>

          {filteredTasks.length > pageSize ? (
            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
              <span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredTasks.length)} of {filteredTasks.length}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
              </div>
            </div>
          ) : null}
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
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Add comment</span>
            <textarea name="comment" value={form.comment} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="Add a note for this task" rows="2" />
          </label>
          {form.comments?.length ? (
            <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-sm font-semibold text-slate-700">Comments</p>
              <div className="space-y-2">
                {form.comments.map((entry, index) => (
                  <div key={`${entry.text}-${index}`} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-600">
                    <div className="font-medium text-slate-800">{entry.author || "User"}</div>
                    <div>{entry.text}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
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