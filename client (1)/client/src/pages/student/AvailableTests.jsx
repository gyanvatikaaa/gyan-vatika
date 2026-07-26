import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import api from "../../api/axios";

const STATUS_LABEL = {
  in_progress: { text: "In progress", cls: "bg-vatika-marigold/15 text-vatika-marigoldDark" },
  submitted: { text: "Submitted — awaiting check", cls: "bg-vatika-forest/10 text-vatika-forest" },
  ai_checked: { text: "Checked — awaiting approval", cls: "bg-vatika-forest/10 text-vatika-forest" },
  approved: { text: "Results available", cls: "bg-vatika-forest/10 text-vatika-forest" },
};

const AvailableTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const { data } = await api.get("/submissions/available-tests");
        setTests(data.tests);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load tests");
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  return (
    <DashboardShell title="Your tests">
      {error && (
        <div className="mb-4 rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-vatika-muted">Loading…</p>
      ) : tests.length === 0 ? (
        <div className="bg-vatika-surface border border-vatika-line rounded-card p-8 text-center">
          <p className="text-sm text-vatika-muted">No tests available for you right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tests.map((t) => {
            const statusInfo = t.mySubmissionStatus ? STATUS_LABEL[t.mySubmissionStatus] : null;
            const alreadyDone = t.mySubmissionStatus && t.mySubmissionStatus !== "in_progress";
            return (
              <div key={t._id} className="bg-vatika-surface border border-vatika-line rounded-card p-5">
                <p className="font-display text-lg font-semibold text-vatika-ink mb-1">{t.title}</p>
                <p className="text-sm text-vatika-muted mb-3">
                  {t.subject} • {t.questionCount} questions • {t.durationMinutes} min
                </p>
                {statusInfo && (
                  <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium mb-3 ${statusInfo.cls}`}>
                    {statusInfo.text}
                  </span>
                )}
                <button
                  disabled={alreadyDone && t.mySubmissionStatus !== "approved"}
                  onClick={() =>
                    t.mySubmissionStatus === "approved"
                      ? navigate(`/student/results/${t.mySubmissionId}`)
                      : navigate(`/student/tests/${t._id}`)
                  }
                  className="w-full rounded-lg bg-vatika-forest text-white font-medium py-2.5 text-sm hover:bg-vatika-forestDark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.mySubmissionStatus === "approved"
                    ? "View result"
                    : t.mySubmissionStatus === "in_progress"
                    ? "Resume test"
                    : alreadyDone
                    ? "Already submitted"
                    : "Start test"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
};

export default AvailableTests;
