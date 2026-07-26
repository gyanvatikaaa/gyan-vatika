import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import api from "../../api/axios";

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const { data } = await api.get("/parent/children");
        setChildren(data.children);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load your children");
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  return (
    <DashboardShell title="Parent dashboard">
      {error && (
        <div className="mb-4 rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-vatika-muted">Loading…</p>
      ) : children.length === 0 ? (
        <div className="bg-vatika-surface border border-vatika-line rounded-card p-8 text-center">
          <p className="text-sm text-vatika-muted">
            No children linked to your account yet — please ask the admin to link your child's account to yours.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children.map((child) => (
            <div key={child._id} className="bg-vatika-surface border border-vatika-line rounded-card p-5">
              <p className="font-display text-lg font-semibold text-vatika-ink mb-1">{child.name}</p>
              <p className="text-sm text-vatika-muted mb-4">
                Class {child.studentClass || "?"} • {child.phone || "no phone on file"}
              </p>
              <div className="flex gap-2">
                <Link
                  to={`/parent/progress/${child._id}`}
                  className="inline-block rounded-lg bg-vatika-forest text-white text-sm font-medium py-2 px-4 hover:bg-vatika-forestDark transition"
                >
                  Progress
                </Link>
                <Link
                  to={`/parent/records/${child._id}`}
                  className="inline-block rounded-lg border border-vatika-line text-vatika-ink text-sm font-medium py-2 px-4 hover:bg-vatika-bg transition"
                >
                  Attendance & fees
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
};

export default ParentDashboard;
