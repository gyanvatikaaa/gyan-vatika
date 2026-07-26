import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const FEE_STYLES = {
  paid: "bg-vatika-forest/10 text-vatika-forest",
  pending: "bg-vatika-marigold/15 text-vatika-marigoldDark",
  overdue: "bg-vatika-clay/10 text-vatika-clay",
};

const StudentRecords = () => {
  const { studentId: paramId } = useParams();
  const { user } = useAuth();
  const studentId = paramId || user._id;

  const [attendance, setAttendance] = useState([]);
  const [homework, setHomework] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [attRes, hwRes, feeRes] = await Promise.all([
          api.get(`/records/attendance/${studentId}`),
          api.get(`/records/homework/${studentId}`),
          api.get(`/records/fees/${studentId}`),
        ]);
        setAttendance(attRes.data.records);
        setHomework(hwRes.data.homework);
        setFees(feeRes.data.fees);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load records");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [studentId]);

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const attendancePercent = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : null;

  return (
    <DashboardShell title="Attendance, homework & fees">
      {error && (
        <div className="mb-4 rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-vatika-muted">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance */}
          <div className="bg-vatika-surface border border-vatika-line rounded-card">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-vatika-ink">Attendance</p>
              {attendancePercent !== null && (
                <span className="text-sm font-medium text-vatika-forest">{attendancePercent}%</span>
              )}
            </div>
            {attendance.length === 0 ? (
              <p className="text-sm text-vatika-muted px-5 pb-5">No records yet.</p>
            ) : (
              <ul>
                {attendance.map((r) => (
                  <li key={r._id} className="px-5 py-2.5 border-t border-vatika-line text-sm flex items-center justify-between">
                    <span className="text-vatika-muted">{new Date(r.date).toLocaleDateString("en-IN")}</span>
                    <span className="capitalize text-vatika-ink font-medium">{r.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Homework */}
          <div className="bg-vatika-surface border border-vatika-line rounded-card">
            <p className="text-sm font-semibold text-vatika-ink px-5 pt-5 pb-3">Homework</p>
            {homework.length === 0 ? (
              <p className="text-sm text-vatika-muted px-5 pb-5">No homework yet.</p>
            ) : (
              <ul>
                {homework.map((h) => (
                  <li key={h._id} className="px-5 py-2.5 border-t border-vatika-line text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-vatika-ink font-medium">{h.title}</span>
                      <span className="text-xs capitalize text-vatika-marigoldDark">{h.status}</span>
                    </div>
                    {h.description && <p className="text-xs text-vatika-muted mt-0.5">{h.description}</p>}
                    {h.dueDate && (
                      <p className="text-xs text-vatika-muted">Due {new Date(h.dueDate).toLocaleDateString("en-IN")}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Fees */}
          <div className="bg-vatika-surface border border-vatika-line rounded-card">
            <p className="text-sm font-semibold text-vatika-ink px-5 pt-5 pb-3">Fee status</p>
            {fees.length === 0 ? (
              <p className="text-sm text-vatika-muted px-5 pb-5">No fee records yet.</p>
            ) : (
              <ul>
                {fees.map((f) => (
                  <li key={f._id} className="px-5 py-2.5 border-t border-vatika-line text-sm flex items-center justify-between">
                    <div>
                      <p className="text-vatika-ink font-medium">{f.month}</p>
                      <p className="text-xs text-vatika-muted">₹{f.amount.toLocaleString("en-IN")}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${FEE_STYLES[f.status]}`}>
                      {f.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default StudentRecords;
