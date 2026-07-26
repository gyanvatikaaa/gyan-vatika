import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import api from "../../api/axios";

const StudentDetail = () => {
  const { studentId } = useParams();
  const [attendance, setAttendance] = useState([]);
  const [homework, setHomework] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attStatus, setAttStatus] = useState("present");
  const [attRemarks, setAttRemarks] = useState("");
  const [savingAtt, setSavingAtt] = useState(false);

  const [hwTitle, setHwTitle] = useState("");
  const [hwDescription, setHwDescription] = useState("");
  const [hwDueDate, setHwDueDate] = useState("");
  const [savingHw, setSavingHw] = useState(false);

  const fetchAll = async () => {
    try {
      const [attRes, hwRes] = await Promise.all([
        api.get(`/tutor/attendance/${studentId}`),
        api.get(`/tutor/homework/${studentId}`),
      ]);
      setAttendance(attRes.data.records);
      setHomework(hwRes.data.homework);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load student records");
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const submitAttendance = async (e) => {
    e.preventDefault();
    setSavingAtt(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/tutor/attendance", { studentId, date: attDate, status: attStatus, remarks: attRemarks });
      setSuccess("Attendance recorded.");
      setAttRemarks("");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record attendance");
    } finally {
      setSavingAtt(false);
    }
  };

  const submitHomework = async (e) => {
    e.preventDefault();
    setSavingHw(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/tutor/homework", { studentId, title: hwTitle, description: hwDescription, dueDate: hwDueDate });
      setSuccess("Homework assigned.");
      setHwTitle("");
      setHwDescription("");
      setHwDueDate("");
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign homework");
    } finally {
      setSavingHw(false);
    }
  };

  return (
    <DashboardShell title="Student details">
      <Link to={`/tutor/progress/${studentId}`} className="text-sm text-vatika-forest font-medium hover:underline mb-4 inline-block">
        View test progress →
      </Link>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance */}
        <div>
          <form onSubmit={submitAttendance} className="bg-vatika-surface border border-vatika-line rounded-card p-5 mb-4">
            <p className="text-sm font-semibold text-vatika-ink mb-3">Mark attendance</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="date" value={attDate} onChange={(e) => setAttDate(e.target.value)} required className="rounded-lg border border-vatika-line px-3 py-2 text-sm" />
              <select value={attStatus} onChange={(e) => setAttStatus(e.target.value)} className="rounded-lg border border-vatika-line px-3 py-2 text-sm">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
              </select>
            </div>
            <textarea
              value={attRemarks}
              onChange={(e) => setAttRemarks(e.target.value)}
              placeholder="Remarks after class (optional)"
              rows={2}
              className="w-full rounded-lg border border-vatika-line px-3 py-2 text-sm mb-3"
            />
            <button type="submit" disabled={savingAtt} className="rounded-lg bg-vatika-forest text-white text-sm font-medium py-2 px-4 hover:bg-vatika-forestDark transition disabled:opacity-60">
              {savingAtt ? "Saving…" : "Save attendance"}
            </button>
          </form>

          <div className="bg-vatika-surface border border-vatika-line rounded-card">
            <p className="text-sm font-semibold text-vatika-ink px-5 pt-4 pb-2">Attendance history</p>
            {attendance.length === 0 ? (
              <p className="text-sm text-vatika-muted px-5 pb-4">No records yet.</p>
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
        </div>

        {/* Homework */}
        <div>
          <form onSubmit={submitHomework} className="bg-vatika-surface border border-vatika-line rounded-card p-5 mb-4">
            <p className="text-sm font-semibold text-vatika-ink mb-3">Assign homework</p>
            <input
              value={hwTitle}
              onChange={(e) => setHwTitle(e.target.value)}
              placeholder="Title"
              required
              className="w-full rounded-lg border border-vatika-line px-3 py-2 text-sm mb-3"
            />
            <textarea
              value={hwDescription}
              onChange={(e) => setHwDescription(e.target.value)}
              placeholder="Description"
              rows={2}
              className="w-full rounded-lg border border-vatika-line px-3 py-2 text-sm mb-3"
            />
            <input
              type="date"
              value={hwDueDate}
              onChange={(e) => setHwDueDate(e.target.value)}
              className="w-full rounded-lg border border-vatika-line px-3 py-2 text-sm mb-3"
            />
            <button type="submit" disabled={savingHw} className="rounded-lg bg-vatika-forest text-white text-sm font-medium py-2 px-4 hover:bg-vatika-forestDark transition disabled:opacity-60">
              {savingHw ? "Saving…" : "Assign homework"}
            </button>
          </form>

          <div className="bg-vatika-surface border border-vatika-line rounded-card">
            <p className="text-sm font-semibold text-vatika-ink px-5 pt-4 pb-2">Homework history</p>
            {homework.length === 0 ? (
              <p className="text-sm text-vatika-muted px-5 pb-4">No homework assigned yet.</p>
            ) : (
              <ul>
                {homework.map((h) => (
                  <li key={h._id} className="px-5 py-2.5 border-t border-vatika-line text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-vatika-ink font-medium">{h.title}</span>
                      <span className="text-xs capitalize text-vatika-marigoldDark">{h.status}</span>
                    </div>
                    {h.dueDate && (
                      <p className="text-xs text-vatika-muted">Due {new Date(h.dueDate).toLocaleDateString("en-IN")}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
};

export default StudentDetail;
