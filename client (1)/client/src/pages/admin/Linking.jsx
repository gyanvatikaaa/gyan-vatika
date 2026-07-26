import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import AdminNav from "../../components/AdminNav";
import api from "../../api/axios";

const Linking = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedParent, setSelectedParent] = useState("");
  const [selectedChild, setSelectedChild] = useState("");
  const [selectedTutor, setSelectedTutor] = useState("");
  const [selectedTutorStudent, setSelectedTutorStudent] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/link/overview");
      setData(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load linking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleLinkParentChild = async () => {
    if (!selectedParent || !selectedChild) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.patch("/admin/link/parent-child", { parentId: selectedParent, studentId: selectedChild });
      setSuccess("Parent linked to child.");
      setSelectedChild("");
      fetchOverview();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to link");
    } finally {
      setBusy(false);
    }
  };

  const handleUnlinkParentChild = async (parentId, studentId) => {
    setBusy(true);
    setError("");
    try {
      await api.patch("/admin/link/parent-child/remove", { parentId, studentId });
      fetchOverview();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unlink");
    } finally {
      setBusy(false);
    }
  };

  const handleLinkTutorStudent = async () => {
    if (!selectedTutor || !selectedTutorStudent) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api.patch("/admin/link/tutor-student", { tutorId: selectedTutor, studentId: selectedTutorStudent });
      setSuccess("Tutor linked to student.");
      setSelectedTutorStudent("");
      fetchOverview();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to link");
    } finally {
      setBusy(false);
    }
  };

  const handleUnlinkTutorStudent = async (tutorId, studentId) => {
    setBusy(true);
    setError("");
    try {
      await api.patch("/admin/link/tutor-student/remove", { tutorId, studentId });
      fetchOverview();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unlink");
    } finally {
      setBusy(false);
    }
  };

  return (
    <DashboardShell title="Linking">
      <AdminNav />

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
      ) : (
        <div className="space-y-8">
          {/* Parent-Child linking */}
          <section>
            <h2 className="text-xs uppercase tracking-wide text-vatika-muted font-semibold mb-3">
              Parent ↔ Child
            </h2>

            <div className="bg-vatika-surface border border-vatika-line rounded-card p-5 mb-4 flex flex-wrap items-end gap-3">
              <SelectField
                label="Parent"
                value={selectedParent}
                onChange={setSelectedParent}
                options={data.parents.map((p) => ({ value: p._id, label: `${p.name} (${p.phone || "no phone"})` }))}
              />
              <SelectField
                label="Child (student)"
                value={selectedChild}
                onChange={setSelectedChild}
                options={data.students.map((s) => ({ value: s._id, label: `${s.name} — Class ${s.studentClass || "?"}` }))}
              />
              <button
                onClick={handleLinkParentChild}
                disabled={busy || !selectedParent || !selectedChild}
                className="rounded-lg bg-vatika-forest text-white text-sm font-medium py-2.5 px-4 hover:bg-vatika-forestDark transition disabled:opacity-50"
              >
                Link
              </button>
            </div>

            <div className="bg-vatika-surface border border-vatika-line rounded-card divide-y divide-vatika-line">
              {data.parents.map((p) => (
                <div key={p._id} className="px-5 py-4">
                  <p className="text-sm font-medium text-vatika-ink">
                    {p.name} <span className="text-vatika-muted font-normal">— {p.phone || "no phone"}</span>
                  </p>
                  {p.children.length === 0 ? (
                    <p className="text-xs text-vatika-muted mt-1">No children linked yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {p.children.map((c) => (
                        <li key={c._id} className="flex items-center justify-between text-sm">
                          <span className="text-vatika-muted">
                            {c.name} • {c.phone || "no phone"} • Class {c.studentClass || "?"}
                          </span>
                          <button
                            onClick={() => handleUnlinkParentChild(p._id, c._id)}
                            className="text-xs text-vatika-clay hover:underline"
                          >
                            Unlink
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {data.parents.length === 0 && (
                <p className="text-sm text-vatika-muted p-5">No approved parents yet.</p>
              )}
            </div>
          </section>

          {/* Tutor-Student linking */}
          <section>
            <h2 className="text-xs uppercase tracking-wide text-vatika-muted font-semibold mb-3">
              Tutor ↔ Student
            </h2>

            <div className="bg-vatika-surface border border-vatika-line rounded-card p-5 mb-4 flex flex-wrap items-end gap-3">
              <SelectField
                label="Tutor"
                value={selectedTutor}
                onChange={setSelectedTutor}
                options={data.tutors.map((t) => ({ value: t._id, label: `${t.name} (${t.phone || "no phone"})` }))}
              />
              <SelectField
                label="Student"
                value={selectedTutorStudent}
                onChange={setSelectedTutorStudent}
                options={data.students.map((s) => ({ value: s._id, label: `${s.name} — Class ${s.studentClass || "?"}` }))}
              />
              <button
                onClick={handleLinkTutorStudent}
                disabled={busy || !selectedTutor || !selectedTutorStudent}
                className="rounded-lg bg-vatika-forest text-white text-sm font-medium py-2.5 px-4 hover:bg-vatika-forestDark transition disabled:opacity-50"
              >
                Link
              </button>
            </div>

            <div className="bg-vatika-surface border border-vatika-line rounded-card divide-y divide-vatika-line">
              {data.tutors.map((t) => (
                <div key={t._id} className="px-5 py-4">
                  <p className="text-sm font-medium text-vatika-ink">
                    {t.name} <span className="text-vatika-muted font-normal">— {t.phone || "no phone"}</span>
                  </p>
                  {t.assignedStudents.length === 0 ? (
                    <p className="text-xs text-vatika-muted mt-1">No students assigned yet.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {t.assignedStudents.map((s) => (
                        <li key={s._id} className="flex items-center justify-between text-sm">
                          <span className="text-vatika-muted">
                            {s.name} • {s.phone || "no phone"} • Class {s.studentClass || "?"}
                          </span>
                          <button
                            onClick={() => handleUnlinkTutorStudent(t._id, s._id)}
                            className="text-xs text-vatika-clay hover:underline"
                          >
                            Unlink
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {data.tutors.length === 0 && (
                <p className="text-sm text-vatika-muted p-5">No approved tutors yet.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </DashboardShell>
  );
};

const SelectField = ({ label, value, onChange, options }) => (
  <label className="flex-1 min-w-[200px]">
    <span className="block text-xs font-medium text-vatika-muted mb-1">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-vatika-line bg-white px-3 py-2.5 text-sm"
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </label>
);

export default Linking;
