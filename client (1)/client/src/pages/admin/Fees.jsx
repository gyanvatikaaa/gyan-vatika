import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import AdminNav from "../../components/AdminNav";
import api from "../../api/axios";

const FEE_STYLES = {
  paid: "bg-vatika-forest/10 text-vatika-forest",
  pending: "bg-vatika-marigold/15 text-vatika-marigoldDark",
  overdue: "bg-vatika-clay/10 text-vatika-clay",
};

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [feesRes, overviewRes] = await Promise.all([
        api.get("/admin/fees"),
        api.get("/admin/link/overview"),
      ]);
      setFees(feesRes.data.fees);
      setStudents(overviewRes.data.students);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load fees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/admin/fees", { studentId, amount: Number(amount), month, dueDate });
      setSuccess("Fee record created.");
      setStudentId("");
      setAmount("");
      setMonth("");
      setDueDate("");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create fee record");
    } finally {
      setCreating(false);
    }
  };

  const markPaid = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await api.patch(`/admin/fees/${id}`, { status: "paid" });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update fee");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardShell title="Fees">
      <AdminNav />

      {error && (
        <div className="mb-4 rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-vatika-forest/10 border border-vatika-forest/30 px-3 py-2.5 text-sm text-vatika-forest">
          {success}
        </div>
      )}

      <form onSubmit={handleCreate} className="bg-vatika-surface border border-vatika-line rounded-card p-5 mb-6 flex flex-wrap items-end gap-3">
        <label className="flex-1 min-w-[180px]">
          <span className="block text-xs font-medium text-vatika-muted mb-1">Student</span>
          <select value={studentId} onChange={(e) => setStudentId(e.target.value)} required className="w-full rounded-lg border border-vatika-line px-3 py-2.5 text-sm">
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>{s.name} — Class {s.studentClass || "?"}</option>
            ))}
          </select>
        </label>
        <label className="w-32">
          <span className="block text-xs font-medium text-vatika-muted mb-1">Amount (₹)</span>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required className="w-full rounded-lg border border-vatika-line px-3 py-2.5 text-sm" />
        </label>
        <label className="w-40">
          <span className="block text-xs font-medium text-vatika-muted mb-1">Month</span>
          <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="e.g. July 2026" required className="w-full rounded-lg border border-vatika-line px-3 py-2.5 text-sm" />
        </label>
        <label className="w-40">
          <span className="block text-xs font-medium text-vatika-muted mb-1">Due date</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full rounded-lg border border-vatika-line px-3 py-2.5 text-sm" />
        </label>
        <button type="submit" disabled={creating} className="rounded-lg bg-vatika-forest text-white text-sm font-medium py-2.5 px-4 hover:bg-vatika-forestDark transition disabled:opacity-50">
          {creating ? "Adding…" : "Add fee record"}
        </button>
      </form>

      <div className="bg-vatika-surface border border-vatika-line rounded-card overflow-hidden">
        {loading ? (
          <p className="text-sm text-vatika-muted p-6">Loading…</p>
        ) : fees.length === 0 ? (
          <p className="text-sm text-vatika-muted p-6">No fee records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vatika-line text-left text-vatika-muted">
                <th className="px-5 py-3 font-medium">Student</th>
                <th className="px-5 py-3 font-medium">Month</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f._id} className="border-b border-vatika-line last:border-0">
                  <td className="px-5 py-3 text-vatika-ink font-medium">{f.student?.name}</td>
                  <td className="px-5 py-3 text-vatika-muted">{f.month}</td>
                  <td className="px-5 py-3 text-vatika-muted">₹{f.amount.toLocaleString("en-IN")}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${FEE_STYLES[f.status]}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {f.status !== "paid" && (
                      <button
                        onClick={() => markPaid(f._id)}
                        disabled={busyId === f._id}
                        className="text-xs font-medium text-vatika-forest border border-vatika-forest/30 rounded-lg px-3 py-1.5 hover:bg-vatika-forest/5 transition disabled:opacity-50"
                      >
                        Mark paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardShell>
  );
};

export default Fees;
