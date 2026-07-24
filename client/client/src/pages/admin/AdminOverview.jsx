import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import AdminNav from "../../components/AdminNav";
import api from "../../api/axios";

const PRIORITY_DOT = {
  high: "bg-vatika-clay",
  medium: "bg-vatika-marigold",
  low: "bg-vatika-muted",
};

const AdminOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardShell title="Overview">
      <AdminNav />

      {error && (
        <div className="mb-4 rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-vatika-muted">Loading dashboard…</p>
      ) : (
        <div className="space-y-8">
          {/* AI Alerts + students needing attention come first — most important */}
          {(data.aiAlerts.length > 0 || data.studentsNeedingAttention.length > 0) && (
            <section>
              <h2 className="text-xs uppercase tracking-wide text-vatika-marigoldDark font-semibold mb-3">
                Needs your attention
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-vatika-surface border border-vatika-marigold/30 rounded-card p-5">
                  <p className="text-sm font-medium text-vatika-ink mb-3">AI alerts</p>
                  {data.aiAlerts.length === 0 ? (
                    <p className="text-sm text-vatika-muted">No AI alerts right now.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {data.aiAlerts.map((alert) => (
                        <li key={alert._id} className="flex items-start gap-2 text-sm">
                          <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${PRIORITY_DOT[alert.priority]}`} />
                          <span className="text-vatika-ink">{alert.message}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="bg-vatika-surface border border-vatika-clay/30 rounded-card p-5">
                  <p className="text-sm font-medium text-vatika-ink mb-3">Students needing attention</p>
                  {data.studentsNeedingAttention.length === 0 ? (
                    <p className="text-sm text-vatika-muted">Nobody flagged right now.</p>
                  ) : (
                    <ul className="space-y-2.5">
                      {data.studentsNeedingAttention.map((s) => (
                        <li key={s._id} className="flex items-center justify-between text-sm">
                          <span className="text-vatika-ink">{s.name}</span>
                          <span className="text-xs text-vatika-clay font-medium">{s.alertCount} alert(s)</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Core stats */}
          <section>
            <h2 className="text-xs uppercase tracking-wide text-vatika-muted font-semibold mb-3">
              At a glance
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Students" value={data.totals.students} />
              <StatCard label="Tutors" value={data.totals.tutors} />
              <StatCard label="Active parents" value={data.totals.activeParents} />
              <StatCard label="Upcoming tests" value={data.totals.upcomingTests} />
              <StatCard
                label="Pending fees"
                value={`₹${data.totals.pendingFees.toLocaleString("en-IN")}`}
                sub={`${data.totals.pendingFeesCount} students`}
                highlight={data.totals.pendingFees > 0}
              />
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h2 className="text-xs uppercase tracking-wide text-vatika-muted font-semibold mb-3">
              Recent notifications
            </h2>
            <div className="bg-vatika-surface border border-vatika-line rounded-card">
              {data.notifications.length === 0 ? (
                <p className="text-sm text-vatika-muted p-6">No notifications yet.</p>
              ) : (
                <ul>
                  {data.notifications.map((n, i) => (
                    <li
                      key={n._id}
                      className={`px-5 py-3.5 text-sm ${i !== data.notifications.length - 1 ? "border-b border-vatika-line" : ""}`}
                    >
                      <p className="text-vatika-ink font-medium">{n.title}</p>
                      <p className="text-vatika-muted">{n.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
};

const StatCard = ({ label, value, sub, highlight }) => (
  <div className={`rounded-card border p-4 ${highlight ? "bg-vatika-clay/10 border-vatika-clay/30" : "bg-vatika-surface border-vatika-line"}`}>
    <p className="text-xs uppercase tracking-wide text-vatika-muted font-medium mb-1">{label}</p>
    <p className="font-display text-2xl font-semibold text-vatika-ink">{value}</p>
    {sub && <p className="text-xs text-vatika-muted mt-0.5">{sub}</p>}
  </div>
);

export default AdminOverview;
