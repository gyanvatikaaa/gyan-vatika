import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import api from "../../api/axios";

const TutorDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data } = await api.get("/tutor/students");
        setStudents(data.students);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load your students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <DashboardShell title="Tutor dashboard">
      <div className="mb-6 flex gap-3">
        <Link
          to="/tutor/review"
          className="inline-block rounded-lg bg-vatika-forest text-white font-medium py-2.5 px-5 text-sm hover:bg-vatika-forestDark transition"
        >
          Review test submissions
        </Link>
        <Link
          to="/tutor/tests"
          className="inline-block rounded-lg border border-vatika-forest text-vatika-forest font-medium py-2.5 px-5 text-sm hover:bg-vatika-forest/5 transition"
        >
          Create a test
        </Link>
        <Link
          to="/tutor/assignments"
          className="inline-block rounded-lg border border-vatika-line text-vatika-ink font-medium py-2.5 px-5 text-sm hover:bg-vatika-bg transition"
        >
          Assignments
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      )}

      <h2 className="text-xs uppercase tracking-wide text-vatika-muted font-semibold mb-3">Your students</h2>

      {loading ? (
        <p className="text-sm text-vatika-muted">Loading…</p>
      ) : students.length === 0 ? (
        <div className="bg-vatika-surface border border-vatika-line rounded-card p-8 text-center">
          <p className="text-sm text-vatika-muted">
            No students assigned to you yet — please ask the admin to assign students to you.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {students.map((s) => (
            <div key={s._id} className="bg-vatika-surface border border-vatika-line rounded-card p-5">
              <p className="font-display text-lg font-semibold text-vatika-ink mb-1">{s.name}</p>
              <p className="text-sm text-vatika-muted mb-4">
                Class {s.studentClass || "?"} • {s.phone || "no phone on file"}
              </p>
              <div className="flex gap-2">
                <Link
                  to={`/tutor/student/${s._id}`}
                  className="inline-block rounded-lg border border-vatika-forest text-vatika-forest text-sm font-medium py-2 px-4 hover:bg-vatika-forest/5 transition"
                >
                  Attendance & homework
                </Link>
                <Link
                  to={`/tutor/progress/${s._id}`}
                  className="inline-block rounded-lg bg-vatika-forest text-white text-sm font-medium py-2 px-4 hover:bg-vatika-forestDark transition"
                >
                  Progress
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
};

export default TutorDashboard;
