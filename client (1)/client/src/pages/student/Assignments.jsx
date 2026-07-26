import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import api from "../../api/axios";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const StudentAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingId, setUploadingId] = useState(null);
  const [pendingFiles, setPendingFiles] = useState({}); // { assignmentId: [{url, fileType, fileName}] }
  const [submittingId, setSubmittingId] = useState(null);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/assignments/available");
      setAssignments(data.assignments);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleFileUpload = async (assignmentId, files) => {
    setUploadingId(assignmentId);
    setError("");
    try {
      const uploaded = [];
      for (const file of Array.from(files)) {
        const base64 = await fileToBase64(file);
        const { data } = await api.post("/upload/file", { fileBase64: base64, fileName: file.name });
        uploaded.push(data);
      }
      setPendingFiles((prev) => ({ ...prev, [assignmentId]: [...(prev[assignmentId] || []), ...uploaded] }));
    } catch (err) {
      setError(err.response?.data?.message || "File upload failed");
    } finally {
      setUploadingId(null);
    }
  };

  const submit = async (assignmentId) => {
    const files = pendingFiles[assignmentId];
    if (!files?.length) return;
    setSubmittingId(assignmentId);
    setError("");
    setSuccess("");
    try {
      await api.post(`/assignments/${assignmentId}/submit`, { files });
      setSuccess("Assignment submitted.");
      setPendingFiles((prev) => ({ ...prev, [assignmentId]: [] }));
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <DashboardShell title="Assignments">
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
      ) : assignments.length === 0 ? (
        <div className="bg-vatika-surface border border-vatika-line rounded-card p-8 text-center">
          <p className="text-sm text-vatika-muted">No assignments shared with you yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a) => (
            <div key={a._id} className="bg-vatika-surface border border-vatika-line rounded-card p-5">
              <p className="font-display text-lg font-semibold text-vatika-ink mb-1">{a.title}</p>
              {a.description && <p className="text-sm text-vatika-muted mb-2">{a.description}</p>}
              {a.dueDate && (
                <p className="text-xs text-vatika-muted mb-3">Due {new Date(a.dueDate).toLocaleDateString("en-IN")}</p>
              )}

              {a.attachments?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-vatika-muted mb-1">Shared files:</p>
                  <div className="flex flex-wrap gap-2">
                    {a.attachments.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-vatika-forest underline bg-vatika-bg rounded px-2 py-1">
                        {f.fileName || `File ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {a.mySubmission ? (
                <div className="bg-vatika-forest/5 border border-vatika-forest/20 rounded-lg p-3">
                  <p className="text-xs text-vatika-forest font-medium mb-1">
                    Submitted {new Date(a.mySubmission.submittedAt).toLocaleDateString("en-IN")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {a.mySubmission.files.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-vatika-forest underline">
                        {f.fileName || `File ${i + 1}`}
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-vatika-muted mb-2">Submit your response (PDF or photo):</p>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    multiple
                    onChange={(e) => handleFileUpload(a._id, e.target.files)}
                    className="text-sm text-vatika-muted mb-2"
                  />
                  {uploadingId === a._id && <p className="text-xs text-vatika-marigoldDark mb-2">Uploading…</p>}
                  {pendingFiles[a._id]?.length > 0 && (
                    <ul className="mb-3 space-y-1">
                      {pendingFiles[a._id].map((f, i) => (
                        <li key={i} className="text-xs text-vatika-forest bg-vatika-bg rounded px-2 py-1">{f.fileName}</li>
                      ))}
                    </ul>
                  )}
                  <button
                    onClick={() => submit(a._id)}
                    disabled={!pendingFiles[a._id]?.length || submittingId === a._id}
                    className="rounded-lg bg-vatika-forest text-white text-sm font-medium py-2 px-4 hover:bg-vatika-forestDark transition disabled:opacity-50"
                  >
                    {submittingId === a._id ? "Submitting…" : "Submit assignment"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
};

export default StudentAssignments;
