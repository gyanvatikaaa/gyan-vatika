import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import AdminNav from "../../components/AdminNav";
import api from "../../api/axios";

const STATUS_STYLES = {
  pending: "bg-vatika-marigold/15 text-vatika-marigoldDark",
  approved: "bg-vatika-forest/10 text-vatika-forest",
  deactivated: "bg-vatika-clay/10 text-vatika-clay",
};

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actioningId, setActioningId] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const { data } = await api.get("/admin/users", { params });
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const runAction = async (id, action) => {
    setActioningId(id);
    try {
      await api.patch(`/admin/users/${id}/${action}`);
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setActioningId(null);
    }
  };

  const pendingCount = users.filter((u) => u.status === "pending").length;

  return (
    <DashboardShell title="User approvals">
      <AdminNav />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard label="Total accounts" value={users.length} />
        <SummaryCard label="Pending approval" value={pendingCount} highlight />
        <SummaryCard
          label="Active"
          value={users.filter((u) => u.status === "approved").length}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {["all", "pending", "approved", "deactivated"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition capitalize ${
              filter === f
                ? "bg-vatika-forest text-white border-vatika-forest"
                : "bg-white text-vatika-muted border-vatika-line hover:bg-vatika-bg"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      )}

      <div className="bg-vatika-surface border border-vatika-line rounded-card overflow-hidden">
        {loading ? (
          <p className="text-sm text-vatika-muted p-6">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-vatika-muted p-6">No users match this filter.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-vatika-line text-left text-vatika-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Phone</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-vatika-line last:border-0">
                  <td className="px-5 py-3 text-vatika-ink font-medium">{u.name}</td>
                  <td className="px-5 py-3 text-vatika-muted">{u.email}</td>
                  <td className="px-5 py-3 text-vatika-muted">{u.phone || "—"}</td>
                  <td className="px-5 py-3 text-vatika-muted capitalize">{u.role}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    {u.role === "admin" ? (
                      <span className="text-xs text-vatika-muted">—</span>
                    ) : u.status === "pending" ? (
                      <button
                        disabled={actioningId === u._id}
                        onClick={() => runAction(u._id, "approve")}
                        className="text-xs font-medium text-vatika-forest border border-vatika-forest/30 rounded-lg px-3 py-1.5 hover:bg-vatika-forest/5 transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                    ) : u.status === "approved" ? (
                      <button
                        disabled={actioningId === u._id}
                        onClick={() => runAction(u._id, "deactivate")}
                        className="text-xs font-medium text-vatika-clay border border-vatika-clay/30 rounded-lg px-3 py-1.5 hover:bg-vatika-clay/5 transition disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        disabled={actioningId === u._id}
                        onClick={() => runAction(u._id, "reactivate")}
                        className="text-xs font-medium text-vatika-forest border border-vatika-forest/30 rounded-lg px-3 py-1.5 hover:bg-vatika-forest/5 transition disabled:opacity-50"
                      >
                        Reactivate
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

const SummaryCard = ({ label, value, highlight }) => (
  <div className={`rounded-card border p-5 ${highlight ? "bg-vatika-marigold/10 border-vatika-marigold/30" : "bg-vatika-surface border-vatika-line"}`}>
    <p className="text-xs uppercase tracking-wide text-vatika-muted font-medium mb-1">{label}</p>
    <p className="font-display text-3xl font-semibold text-vatika-ink">{value}</p>
  </div>
);

export default AdminDashboard;
