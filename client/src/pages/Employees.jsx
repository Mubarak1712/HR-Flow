import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Edit3, Plus, Search, Trash2, Users2, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import PageShell from "../components/PageShell";
import StatusBadge from "../components/StatusBadge";
import TableShell from "../components/TableShell";
import EmptyState from "../components/EmptyState";
import api from "../services/api";

function Employees() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    salary: "",
    profilePhoto: "",
    status: "Active",
    position: "",
    phone: "",
    address: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get("/employees");
      setEmployees(res.data.employees || []);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.departments || []);
    } catch {
      toast.error("Failed to load departments");
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchEmployees();
      void fetchDepartments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const clearForm = () => {
    setForm({
      name: "",
      email: "",
      department: "",
      salary: "",
      profilePhoto: "",
      status: "Active",
      position: "",
      phone: "",
      address: "",
    });
    setEditingId(null);
    setImagePreview("");
    setIsModalOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setForm((current) => ({ ...current, profilePhoto: dataUrl }));
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        salary: form.salary === "" ? 0 : Number(form.salary),
      };

      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
        toast.success("Employee updated successfully");
      } else {
        await api.post("/employees", payload);
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
      name: employee.name || "",
      email: employee.email || "",
      department: employee.department || "",
      salary: employee.salary ?? "",
      profilePhoto: employee.profilePhoto || "",
      status: employee.status || "Active",
      position: employee.position || "",
      phone: employee.phone || "",
      address: employee.address || "",
    });
    setImagePreview(employee.profilePhoto || "");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;

    try {
      await api.delete(`/employees/${id}`);
      toast.success("Employee deleted");
      fetchEmployees();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase().trim();

    return employees.filter((emp) => {
      const searchableText = [emp.name, emp.email, emp.department, emp.position, emp.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesDepartment = departmentFilter === "All" || emp.department === departmentFilter;
      const matchesStatus = statusFilter === "All" || emp.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [departmentFilter, employees, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const pagedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    const safePage = Math.min(page, totalPages);
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, totalPages]);

  return (
    <Layout>
      <PageShell
        title="People directory"
        description="Manage your team with a refined, high-trust experience built for modern HR operations."
        actions={user?.role === "Admin" ? [
          <button key="add" type="button" onClick={() => {
            setEditingId(null);
            setForm({
              name: "",
              email: "",
              department: "",
              salary: "",
              profilePhoto: "",
              status: "Active",
              position: "",
              phone: "",
              address: "",
            });
            setImagePreview("");
            setIsModalOpen(true);
          }} className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95">
            <Plus size={16} /> Add employee
          </button>,
        ] : []}
      >
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Employee roster</h2>
              <p className="text-sm text-slate-500">Search, filter, and keep your team records current.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <Search size={14} />
                <input value={search} onChange={handleSearchChange} className="w-56 bg-transparent outline-none" placeholder="Search employees" aria-label="Search employees" />
              </label>
              <label className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <span className="mr-2 text-xs uppercase tracking-[0.2em] text-slate-400">Department</span>
                <select value={departmentFilter} onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }} className="bg-transparent outline-none">
                  <option value="All">All</option>
                  {departments.map((department) => (
                    <option key={department._id} value={department.name}>{department.name}</option>
                  ))}
                </select>
              </label>
              <label className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <span className="mr-2 text-xs uppercase tracking-[0.2em] text-slate-400">Status</span>
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bg-transparent outline-none">
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </label>
            </div>
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
                ) : pagedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-sm text-slate-500">
                      <EmptyState title="No records found" description="No employees are available right now." />
                    </td>
                  </tr>
                ) : (
                  pagedEmployees.map((emp) => (
                    <tr key={emp._id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-indigo-100 font-semibold text-indigo-700">
                            {emp.profilePhoto ? <img src={emp.profilePhoto} alt={emp.name} className="h-10 w-10 object-cover" /> : <span>{emp.name?.charAt(0) || "E"}</span>}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{emp.name}</div>
                            <div className="text-sm text-slate-500">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{emp.department}</td>
                      <td className="px-6 py-4"><StatusBadge tone={emp.status === "Active" ? "success" : "warning"}>{emp.status || "Active"}</StatusBadge></td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">₹ {emp.salary}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {user?.role === "Admin" ? (
                            <>
                              <button type="button" onClick={() => handleEdit(emp)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600" aria-label={`Edit ${emp.name}`}>
                                <Edit3 size={16} />
                              </button>
                              <button type="button" onClick={() => handleDelete(emp._id)} className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${emp.name}`}>
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableShell>

          {filteredEmployees.length > pageSize ? (
            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-500">
              <span>Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filteredEmployees.length)} of {filteredEmployees.length}</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Previous</button>
                <button type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={page === totalPages} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Next</button>
              </div>
            </div>
          ) : null}
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
            <select name="department" value={form.department} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" required>
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department._id} value={department.name}>{department.name}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Salary</span>
            <input name="salary" type="number" value={form.salary} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="120000" required />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Status</span>
            <select name="status" value={form.status} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
              <option value="Terminated">Terminated</option>
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Position</span>
            <input name="position" value={form.position} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="Software Engineer" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700">
            <span>Phone</span>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="+1 555 0000" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Address</span>
            <input name="address" value={form.address} onChange={handleChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" placeholder="123 Main Street" />
          </label>
          <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
            <span>Profile photo</span>
            <input name="profilePhoto" type="file" accept="image/*" onChange={handleImageChange} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-indigo-400 focus:bg-white" />
            {imagePreview ? <img src={imagePreview} alt="Employee preview" className="h-24 w-24 rounded-2xl border border-slate-200 object-cover" /> : null}
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