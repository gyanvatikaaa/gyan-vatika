import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import api from "../../api/axios";

const Results = () => {
  const { submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const { data } = await api.get(`/submissions/${submissionId}/result`);
        setSubmission(data.submission);
      } catch (err) {
        setError(err.response?.data?.message || "Result not available yet");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [submissionId]);

  return (
    <DashboardShell title="Test result">
      {loading ? (
        <p className="text-sm text-vatika-muted">Loading…</p>
      ) : error ? (
        <div className="bg-vatika-surface border border-vatika-line rounded-card p-8 text-center">
          <p className="text-sm text-vatika-muted mb-4">{error}</p>
          <Link to="/student/tests" className="text-sm text-vatika-forest font-medium hover:underline">
            Back to your tests
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="bg-vatika-surface border border-vatika-line rounded-card p-6">
            <p className="font-display text-xl font-semibold text-vatika-ink mb-1">{submission.test.title}</p>
            <p className="text-sm text-vatika-muted mb-4">
              {submission.test.subject} • Time spent:{" "}
              {submission.timeSpentSeconds ? `${Math.round(submission.timeSpentSeconds / 60)} min` : "—"}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-semibold text-vatika-forest">
                {submission.totalMarksAwarded}
              </span>
              <span className="text-sm text-vatika-muted">
                / {submission.test.questions.reduce((s, q) => s + q.maxMarks, 0)} marks
              </span>
            </div>
            {submission.aiSummary && <p className="text-sm text-vatika-muted mt-3">{submission.aiSummary}</p>}
          </div>

          <div className="space-y-3">
            {submission.answers.map((a, i) => {
              const question = submission.test.questions[a.questionIndex];
              return (
                <div key={i} className="bg-vatika-surface border border-vatika-line rounded-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wide font-semibold text-vatika-marigoldDark">
                      Q{a.questionIndex + 1} • {a.type}
                    </span>
                    <span className="text-sm font-medium text-vatika-ink">
                      {a.marksAwarded} / {question?.maxMarks} marks
                    </span>
                  </div>
                  <p className="text-sm text-vatika-ink mb-2">{question?.questionText}</p>
                  {a.textAnswer && (
                    <p className="text-sm text-vatika-muted bg-vatika-bg rounded-lg p-2.5 mb-2">
                      Your answer: {a.textAnswer}
                    </p>
                  )}
                  {a.photoUrls?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {a.photoUrls.map((url, pi) => (
                        <img key={pi} src={url} alt={`Your answer ${i + 1} page ${pi + 1}`} className="w-28 h-28 object-cover rounded-lg border border-vatika-line" />
                      ))}
                    </div>
                  )}
                  {a.aiRemark && (
                    <p className="text-xs text-vatika-forest bg-vatika-forest/5 rounded-lg p-2.5">{a.aiRemark}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </DashboardShell>
  );
};

export default Results;
