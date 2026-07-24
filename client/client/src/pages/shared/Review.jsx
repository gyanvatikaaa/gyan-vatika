import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import AdminNav from "../../components/AdminNav";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const STATUS_STYLES = {
  submitted: "bg-vatika-marigold/15 text-vatika-marigoldDark",
  ai_checked: "bg-vatika-forest/10 text-vatika-forest",
  approved: "bg-vatika-forest/10 text-vatika-forest",
};

const Review = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/review/pending");
      setSubmissions(data.submissions);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const runAICheck = async (id) => {
    setCheckingId(id);
    setError("");
    setSuccess("");
    try {
      await api.post(`/review/${id}/ai-check`);
      setSuccess("AI check complete — review the breakdown below.");
      setExpandedId(id);
      fetchSubmissions();
    } catch (err) {
      setError(err.response?.data?.message || "AI check failed");
    } finally {
      setCheckingId(null);
    }
  };

  const approve = async (id) => {
    setApprovingId(id);
    setError("");
    setSuccess("");
    try {
      await api.patch(`/review/${id}/approve`);
      setSuccess("Approval recorded.");
      fetchSubmissions();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve");
    } finally {
      setApprovingId(null);
    }
  };

  const alreadyApprovedByMe = (sub) =>
    user.role === "tutor" ? sub.approvedByTutor : sub.approvedByAdmin;

  return (
    <DashboardShell title="Review submissions">
      {user.role === "admin" && <AdminNav />}

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

      {loading ? (
        <p className="text-sm text-vatika-muted">Loading…</p>
      ) : submissions.length === 0 ? (
        <div className="bg-vatika-surface border border-vatika-line rounded-card p-8 text-center">
          <p className="text-sm text-vatika-muted">Nothing waiting for review right now.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div key={sub._id} className="bg-vatika-surface border border-vatika-line rounded-card overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-vatika-ink">
                    {sub.student?.name} — {sub.test?.title}
                  </p>
                  <p className="text-xs text-vatika-muted">
                    {sub.test?.subject} • Time spent:{" "}
                    {sub.timeSpentSeconds ? `${Math.round(sub.timeSpentSeconds / 60)} min` : "—"}
                    {sub.totalMarksAwarded !== undefined && sub.totalMarksAwarded !== null && (
                      <> • Score: {sub.totalMarksAwarded}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${STATUS_STYLES[sub.status]}`}>
                    {sub.status.replace("_", " ")}
                  </span>

                  {sub.status === "submitted" && (
                    <button
                      onClick={() => runAICheck(sub._id)}
                      disabled={checkingId === sub._id}
                      className="text-xs font-medium text-white bg-vatika-marigold rounded-lg px-3 py-1.5 hover:bg-vatika-marigoldDark transition disabled:opacity-60"
                    >
                      {checkingId === sub._id ? "AI checking… (may take a while)" : "Run AI check"}
                    </button>
                  )}

                  {sub.status === "ai_checked" && !alreadyApprovedByMe(sub) && (
                    <button
                      onClick={() => approve(sub._id)}
                      disabled={approvingId === sub._id}
                      className="text-xs font-medium text-white bg-vatika-forest rounded-lg px-3 py-1.5 hover:bg-vatika-forestDark transition disabled:opacity-60"
                    >
                      {approvingId === sub._id ? "Approving…" : "Approve"}
                    </button>
                  )}

                  {sub.status === "ai_checked" && alreadyApprovedByMe(sub) && (
                    <span className="text-xs text-vatika-muted">Waiting on other approver</span>
                  )}

                  {sub.answers?.length > 0 && (
                    <button
                      onClick={() => setExpandedId(expandedId === sub._id ? null : sub._id)}
                      className="text-xs text-vatika-muted hover:text-vatika-ink"
                    >
                      {expandedId === sub._id ? "Hide ▲" : "View ▼"}
                    </button>
                  )}
                </div>
              </div>

              {expandedId === sub._id && sub.status !== "submitted" && (
                <div className="px-5 pb-5 space-y-3 border-t border-vatika-line pt-4">
                  {sub.aiSummary && (
                    <p className="text-sm text-vatika-ink bg-vatika-bg rounded-lg p-3">{sub.aiSummary}</p>
                  )}
                  {sub.answers.map((a, i) => (
                    <div key={i} className="bg-vatika-bg rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wide font-semibold text-vatika-marigoldDark">
                          Q{a.questionIndex + 1} • {a.type}
                        </span>
                        <span className="text-xs font-medium text-vatika-ink">{a.marksAwarded ?? "—"} marks</span>
                      </div>
                      {a.textAnswer && <p className="text-sm text-vatika-ink mb-1">{a.textAnswer}</p>}
                      {a.photoUrl && (
                        <img src={a.photoUrl} alt={`Answer ${i + 1}`} className="max-w-xs rounded-lg border border-vatika-line mb-1" />
                      )}
                      {a.aiRemark && <p className="text-xs text-vatika-muted italic">{a.aiRemark}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
};

export default Review;
