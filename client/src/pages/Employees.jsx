import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Edit3, Plus, Search, Trash2, Users2, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import PageShell from "../components/PageShell";
import StatusBadge from "../components/StatusBadge";
import TableShell from "../components/TableShell";
import api from "../services/api";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    salary: "",
  });

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees");
      setEmployees(res.data.employees || []);
    } catch (error) {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const clearForm = () => {
    setForm({ name: "", email: "", department: "", salary: "" });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/employees/${editingId}`, form);
        toast.success("Employee updated successfully");
      } else {
        await api.post("/employees", form);
        toast.success("Employee added successfully");
      }

      clearForm();
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee._id);
    setForm({
      name: employee.name,
      email: employee.email,
      department: employee.department,
      salary: employee.salary,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;

    try {
      await api.delete(`/employees/${id}`);
      toast.success("Employee deleted");
      fetchEmployees();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    return (
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.email?.toLowerCase().includes(search.toLowerCase()) ||
      emp.department?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <Layout>
      <PageShell
        title="People directory"
        description="Manage your team with a refined, high-trust experience built for modern HR operations."
        actions={[
          <button key="add" type="button" onClick={() => { setEditingId(null); setForm({ name: "", email: "", department: "", salary: "" }); setIsModalOpen(true); }} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95">
            <Plus size={16} /> Add employee
          </button>,
        ]}
      >
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Employee roster</h2>
              <p className="text-sm text-slate-500">Search, filter, and keep your team records current.</p>
            </div>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
              <Search size={14} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-56 bg-transparent outline-none" placeholder="Search employees" aria-label="Search employees" />
            </label>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Users2 size={15} /> Team size</div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{employees.length}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Sparkles size={15} /> Active roster</div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{filteredEmployees.length}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><Search size={15} /> Search mode</div>
              <p className="mt-2 text-sm font-semibold text-slate-700">{search ? `Filtering “${search}”` : "Ready to explore"}</p>
            </div>
          </div>

          <TableShell title="Team members" subtitle="A simple, polished table for rapid employee management.">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                        <span>Loading employees...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Users2 size={18} className="text-slate-400" />
                        <span>No employees found for this search.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp._id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">{emp.name?.charAt(0) || "E"}</div>
                          <div>
                            <div className="font-semibold text-slate-900">{emp.name}</div>
                            <div className="text-sm text-slate-500">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{emp.department}</td>
                      <td className="px-6 py-4"><StatusBadge tone="success">Active</StatusBadge></td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹ {emp.salary}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleEdit(emp)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600" aria-label={`Edit ${emp.name}`}>
                            <Edit3 size={16} />
                          </button>
                          <button type="button" onClick={() => handleDelete(emp._id)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${emp.name}`}>
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

      <Modal isOpen={isModalOpen} title={editingId ? "Edit employee" : "Add employee"} description="Keep the team record up to date with polished, validated details." onClose={clearForm}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Full name</span>
            <input name="name" value={form.name} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="Alicia Kim" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="alicia@northstar.com" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Department</span>
            <input name="department" value={form.department} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="Operations" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Salary</span>
            <input name="salary" type="number" value={form.salary} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="120000" required />
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
            <button type="submit" className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700">{editingId ? "Save changes" : "Create employee"}</button>
            <button type="button" onClick={clearForm} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

export default Employees;