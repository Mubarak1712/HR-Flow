import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, Edit3, Plus, Sparkles, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import PageShell from "../components/PageShell";
import TableShell from "../components/TableShell";
import api from "../services/api";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", manager: "" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/departments");
      setDepartments(res.data.departments || []);
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data.employees || []);
    } catch (error) {
      toast.error("Failed to load employees");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ name: "", description: "", manager: "" });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/departments/${editingId}`, form);
        toast.success("Department updated");
      } else {
        await api.post("/departments", form);
        toast.success("Department created");
      }
      resetForm();
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (department) => {
    setEditingId(department._id);
    setForm({
      name: department.name,
      description: department.description || "",
      manager: department.manager?._id || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await api.delete(`/departments/${id}`);
      toast.success("Department deleted");
      fetchDepartments();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <Layout>
      <PageShell
        title="Departments"
        description="Organize your teams with clear ownership and scalable department structures."
        actions={[
          <button key="add" type="button" onClick={() => { setEditingId(null); setForm({ name: "", description: "", manager: "" }); setIsModalOpen(true); }} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95">
            <Plus size={16} /> Add department
          </button>,
        ]}
      >
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Building2 size={15} /> Departments</div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{departments.length}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Sparkles size={15} /> Operating clarity</div>
              <p className="mt-2 text-sm font-semibold text-slate-700">Well-structured teams make every update feel intentional.</p>
            </div>
          </div>

          <TableShell title="Structured teams" subtitle="Keep departmental information refined and easy to navigate.">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Manager</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-500"><div className="flex flex-col items-center justify-center gap-2"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" /><span>Loading departments...</span></div></td></tr>
                ) : departments.length === 0 ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-sm text-slate-500"><div className="flex flex-col items-center justify-center gap-2"><Building2 size={18} className="text-slate-400" /><span>No departments found.</span></div></td></tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department._id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4 font-semibold text-slate-900">{department.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{department.description}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{department.manager?.name || "—"}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleEdit(department)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600" aria-label={`Edit ${department.name}`}><Edit3 size={16} /></button>
                          <button type="button" onClick={() => handleDelete(department._id)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${department.name}`}><Trash2 size={16} /></button>
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

      <Modal isOpen={isModalOpen} title={editingId ? "Edit department" : "Add department"} description="Document your team structure with a clear, modern workflow." onClose={resetForm}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Department name</span>
            <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="Product" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" rows="3" placeholder="What this unit is responsible for" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Manager</span>
            <select name="manager" value={form.manager} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white">
              <option value="">Select manager</option>
              {employees.map((emp) => (<option key={emp._id} value={emp._id}>{emp.name}</option>))}
            </select>
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
            <button type="submit" className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">{editingId ? "Save changes" : "Create department"}</button>
            <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

export default Departments;
