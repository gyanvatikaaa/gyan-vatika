import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import AdminNav from "../../components/AdminNav";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const Assignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [className, setClassName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachments, setAttachments] = useState([]); // [{url, fileType, fileName}]
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const [expandedId, setExpandedId] = useState(null);
  const [submissions, setSubmissions] = useState({});

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/assignments/mine-created");
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

  const handleFileUpload = async (files) => {
    setUploading(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of Array.from(files)) {
        const base64 = await fileToBase64(file);
        const { data } = await api.post("/upload/file", { fileBase64: base64, fileName: file.name });
        uploaded.push(data);
      }
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err.response?.data?.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/assignments", { title, description, className, dueDate, attachments });
      setSuccess("Assignment shared with the class.");
      setTitle("");
      setDescription("");
      setClassName("");
      setDueDate("");
      setAttachments([]);
      fetchAssignments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to share assignment");
    } finally {
      setCreating(false);
    }
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!submissions[id]) {
      try {
        const { data } = await api.get(`/assignments/${id}/submissions`);
        setSubmissions((prev) => ({ ...prev, [id]: data.submissions }));
      } catch {
        setSubmissions((prev) => ({ ...prev, [id]: [] }));
      }
    }
  };

  return (
    <DashboardShell title="Assignments">
      {user.role === "admin" ? (
        <AdminNav />
      ) : (
        <Link to="/tutor" className="text-sm text-vatika-forest font-medium hover:underline mb-4 inline-block">
          ← Back to dashboard
        </Link>
      )}

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

      <form onSubmit={handleCreate} className="bg-vatika-surface border border-vatika-line rounded-card p-5 mb-6">
        <p className="text-sm font-semibold text-vatika-ink mb-3">Share a new assignment</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required className="rounded-lg border border-vatika-line px-3 py-2 text-sm" />
          <input value={className} onChange={(e) => setClassName(e.target.value)} placeholder="Class e.g. 10th" required className="rounded-lg border border-vatika-line px-3 py-2 text-sm" />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-lg border border-vatika-line px-3 py-2 text-sm" />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description / instructions"
          rows={2}
          className="w-full rounded-lg border border-vatika-line px-3 py-2 text-sm mb-3"
        />

        <p className="text-xs text-vatika-muted mb-2">Attach PDF(s) or image(s):</p>
        <input
          type="file"
          accept="application/pdf,image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="text-sm text-vatika-muted mb-2"
        />
        {uploading && <p className="text-xs text-vatika-marigoldDark mb-2">Uploading…</p>}
        {attachments.length > 0 && (
          <ul className="mb-3 space-y-1">
            {attachments.map((f, i) => (
              <li key={i} className="text-xs text-vatika-forest flex items-center justify-between bg-vatika-bg rounded px-2 py-1">
                <span>{f.fileName} ({f.fileType})</span>
                <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))} className="text-vatika-clay">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <button type="submit" disabled={creating} className="rounded-lg bg-vatika-forest text-white text-sm font-medium py-2.5 px-5 hover:bg-vatika-forestDark transition disabled:opacity-60">
          {creating ? "Sharing…" : "Share assignment"}
        </button>
      </form>

      <h2 className="text-xs uppercase tracking-wide text-vatika-muted font-semibold mb-3">Shared assignments</h2>
      <div className="bg-vatika-surface border border-vatika-line rounded-card">
        {loading ? (
          <p className="text-sm text-vatika-muted p-6">Loading…</p>
        ) : assignments.length === 0 ? (
          <p className="text-sm text-vatika-muted p-6">No assignments shared yet.</p>
        ) : (
          <ul>
            {assignments.map((a, i) => (
              <li key={a._id} className={i !== assignments.length - 1 ? "border-b border-vatika-line" : ""}>
                <button onClick={() => toggleExpand(a._id)} className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-vatika-bg/50 transition">
                  <div>
                    <p className="text-sm font-medium text-vatika-ink">{a.title}</p>
                    <p className="text-xs text-vatika-muted">
                      Class {a.class} • {a.attachments.length} file(s)
                      {a.dueDate && <> • Due {new Date(a.dueDate).toLocaleDateString("en-IN")}</>}
                    </p>
                  </div>
                  <span className="text-xs text-vatika-muted">{expandedId === a._id ? "Hide ▲" : "View submissions ▼"}</span>
                </button>
                {expandedId === a._id && (
                  <div className="px-5 pb-5">
                    {!submissions[a._id] ? (
                      <p className="text-sm text-vatika-muted">Loading submissions…</p>
                    ) : submissions[a._id].length === 0 ? (
                      <p className="text-sm text-vatika-muted">No submissions yet.</p>
                    ) : (
                      <ul className="space-y-2">
                        {submissions[a._id].map((s) => (
                          <li key={s._id} className="bg-vatika-bg rounded-lg p-3 text-sm">
                            <p className="text-vatika-ink font-medium">{s.student?.name}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {s.files.map((f, fi) => (
                                <a key={fi} href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs text-vatika-forest underline">
                                  {f.fileName || `File ${fi + 1}`}
                                </a>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardShell>
  );
};

export default Assignments;
