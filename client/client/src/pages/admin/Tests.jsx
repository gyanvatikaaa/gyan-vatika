import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import AdminNav from "../../components/AdminNav";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const DIFFICULTIES = ["easy", "medium", "hard"];

const emptyManualQuestion = () => ({
  type: "mcq",
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  maxMarks: 1,
});

const Tests = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState(null); // null | "ai" | "manual"
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // AI form state
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [chaptersText, setChaptersText] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [mcqCount, setMcqCount] = useState(5);
  const [shortCount, setShortCount] = useState(3);
  const [longCount, setLongCount] = useState(2);
  const [aiDuration, setAiDuration] = useState(30);
  const [generating, setGenerating] = useState(false);

  // Manual form state
  const [manualTitle, setManualTitle] = useState("");
  const [manualClass, setManualClass] = useState("");
  const [manualSubject, setManualSubject] = useState("");
  const [manualQuestions, setManualQuestions] = useState([emptyManualQuestion()]);
  const [manualDuration, setManualDuration] = useState(30);
  const [savingManual, setSavingManual] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState(null);
  const [editingTestId, setEditingTestId] = useState(null);
  const [editQuestions, setEditQuestions] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tests");
      setTests(data.tests);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setGenerating(true);
    try {
      const chapters = chaptersText.split(",").map((c) => c.trim()).filter(Boolean);
      await api.post("/tests/generate-ai", {
        className,
        subject,
        chapters,
        difficulty,
        mcqCount,
        shortCount,
        longCount,
        durationMinutes: aiDuration,
      });
      setSuccess("Test generated successfully by AI.");
      setClassName("");
      setSubject("");
      setChaptersText("");
      setMcqCount(5);
      setShortCount(3);
      setLongCount(2);
      setAiDuration(30);
      setMode(null);
      fetchTests();
    } catch (err) {
      const detail = err.response?.data?.error || err.response?.data?.message || err.message;
      setError(`AI generation failed: ${detail}`);
    } finally {
      setGenerating(false);
    }
  };

  const updateManualQuestion = (index, key, value) => {
    setManualQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [key]: value } : q))
    );
  };

  const updateManualOption = (qIndex, oIndex, value) => {
    setManualQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q
      )
    );
  };

  const addManualQuestion = () => setManualQuestions((prev) => [...prev, emptyManualQuestion()]);
  const removeManualQuestion = (index) =>
    setManualQuestions((prev) => prev.filter((_, i) => i !== index));

  const startEditingTest = (test) => {
    setEditingTestId(test._id);
    setExpandedTestId(test._id);
    // Deep copy so edits don't mutate the list until saved
    setEditQuestions(JSON.parse(JSON.stringify(test.questions)));
  };

  const cancelEditingTest = () => {
    setEditingTestId(null);
    setEditQuestions([]);
  };

  const updateEditQuestion = (index, key, value) => {
    setEditQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, [key]: value } : q)));
  };

  const updateEditOption = (qIndex, oIndex, value) => {
    setEditQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q
      )
    );
  };

  const removeEditQuestion = (index) => setEditQuestions((prev) => prev.filter((_, i) => i !== index));
  const addEditQuestion = () => setEditQuestions((prev) => [...prev, emptyManualQuestion()]);

  const saveEditedTest = async (testId) => {
    setSavingEdit(true);
    setError("");
    try {
      await api.patch(`/tests/${testId}`, { questions: editQuestions });
      setSuccess("Test updated successfully.");
      setEditingTestId(null);
      setEditQuestions([]);
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSavingEdit(false);
    }
  };

  const [publishingId, setPublishingId] = useState(null);
  const publishTest = async (testId) => {
    setPublishingId(testId);
    setError("");
    try {
      await api.patch(`/tests/${testId}/publish`, {});
      setSuccess("Test published — students in that class can now see it.");
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish test");
    } finally {
      setPublishingId(null);
    }
  };

  const handleSaveManual = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSavingManual(true);
    try {
      await api.post("/tests/manual", {
        title: manualTitle,
        className: manualClass,
        subject: manualSubject,
        questions: manualQuestions,
        durationMinutes: manualDuration,
      });
      setSuccess("Test created successfully.");
      setManualTitle("");
      setManualClass("");
      setManualSubject("");
      setManualQuestions([emptyManualQuestion()]);
      setMode(null);
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create test");
    } finally {
      setSavingManual(false);
    }
  };

  return (
    <DashboardShell title="Tests">
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

      {!mode && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setMode("ai")}
            className="text-left bg-vatika-surface border border-vatika-line rounded-card p-6 hover:border-vatika-forest transition"
          >
            <p className="text-sm font-semibold text-vatika-marigoldDark mb-1">✨ Generate with AI</p>
            <p className="text-sm text-vatika-muted">
              Pick class, subject, chapters, and difficulty — AI writes the full test for you.
            </p>
          </button>
          <button
            onClick={() => setMode("manual")}
            className="text-left bg-vatika-surface border border-vatika-line rounded-card p-6 hover:border-vatika-forest transition"
          >
            <p className="text-sm font-semibold text-vatika-forest mb-1">✍️ Create manually</p>
            <p className="text-sm text-vatika-muted">
              Write your own questions directly — full control, no AI involved.
            </p>
          </button>
        </div>
      )}

      {mode === "ai" && (
        <form onSubmit={handleGenerateAI} className="bg-vatika-surface border border-vatika-line rounded-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg font-semibold text-vatika-ink">Generate test with AI</p>
            <button type="button" onClick={() => setMode(null)} className="text-sm text-vatika-muted hover:text-vatika-ink">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <TextInput label="Class" value={className} onChange={setClassName} placeholder="e.g. 10th" required />
            <TextInput label="Subject" value={subject} onChange={setSubject} placeholder="e.g. Science" required />
          </div>
          <TextInput
            label="Chapters (comma separated)"
            value={chaptersText}
            onChange={setChaptersText}
            placeholder="e.g. Light, Electricity"
            required
          />
          <label className="block mb-5 mt-4">
            <span className="block text-sm font-medium text-vatika-ink mb-1.5">Difficulty</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full rounded-lg border border-vatika-line bg-white px-3 py-2.5 text-sm capitalize"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <NumberInput label="MCQ questions" value={mcqCount} onChange={setMcqCount} />
            <NumberInput label="Short answer" value={shortCount} onChange={setShortCount} />
            <NumberInput label="Long answer" value={longCount} onChange={setLongCount} />
            <NumberInput label="Duration (min)" value={aiDuration} onChange={setAiDuration} min={5} />
          </div>

          <button
            type="submit"
            disabled={generating}
            className="rounded-lg bg-vatika-forest text-white font-medium py-2.5 px-5 text-sm hover:bg-vatika-forestDark transition disabled:opacity-60"
          >
            {generating ? "Generating with AI… (may take 10-20s)" : "Generate test"}
          </button>
        </form>
      )}

      {mode === "manual" && (
        <form onSubmit={handleSaveManual} className="bg-vatika-surface border border-vatika-line rounded-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="font-display text-lg font-semibold text-vatika-ink">Create test manually</p>
            <button type="button" onClick={() => setMode(null)} className="text-sm text-vatika-muted hover:text-vatika-ink">
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <TextInput label="Title" value={manualTitle} onChange={setManualTitle} placeholder="Test title" required />
            <TextInput label="Class" value={manualClass} onChange={setManualClass} placeholder="e.g. 10th" required />
            <TextInput label="Subject" value={manualSubject} onChange={setManualSubject} placeholder="e.g. Science" required />
            <NumberInput label="Duration (min)" value={manualDuration} onChange={setManualDuration} min={5} />
          </div>

          <div className="space-y-4">
            {manualQuestions.map((q, i) => (
              <div key={i} className="border border-vatika-line rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <select
                    value={q.type}
                    onChange={(e) => updateManualQuestion(i, "type", e.target.value)}
                    className="text-sm rounded-lg border border-vatika-line px-2 py-1.5"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="short">Short answer</option>
                    <option value="long">Long answer</option>
                  </select>
                  {manualQuestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeManualQuestion(i)}
                      className="text-xs text-vatika-clay hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <textarea
                  value={q.questionText}
                  onChange={(e) => updateManualQuestion(i, "questionText", e.target.value)}
                  placeholder="Question text"
                  required
                  rows={2}
                  className="w-full rounded-lg border border-vatika-line px-3 py-2 text-sm mb-3"
                />

                {q.type === "mcq" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt, oi) => (
                      <input
                        key={oi}
                        value={opt}
                        onChange={(e) => updateManualOption(i, oi, e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        required
                        className="rounded-lg border border-vatika-line px-3 py-1.5 text-sm"
                      />
                    ))}
                    <input
                      value={q.correctAnswer}
                      onChange={(e) => updateManualQuestion(i, "correctAnswer", e.target.value)}
                      placeholder="Correct answer (must match an option exactly)"
                      required
                      className="rounded-lg border border-vatika-line px-3 py-1.5 text-sm sm:col-span-2"
                    />
                  </div>
                )}

                <input
                  type="number"
                  min={1}
                  value={q.maxMarks}
                  onChange={(e) => updateManualQuestion(i, "maxMarks", Number(e.target.value))}
                  placeholder="Marks"
                  className="w-28 rounded-lg border border-vatika-line px-3 py-1.5 text-sm"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addManualQuestion}
            className="mt-4 text-sm text-vatika-forest font-medium hover:underline"
          >
            + Add another question
          </button>

          <div className="mt-5">
            <button
              type="submit"
              disabled={savingManual}
              className="rounded-lg bg-vatika-forest text-white font-medium py-2.5 px-5 text-sm hover:bg-vatika-forestDark transition disabled:opacity-60"
            >
              {savingManual ? "Saving…" : "Save test"}
            </button>
          </div>
        </form>
      )}

      <h2 className="text-xs uppercase tracking-wide text-vatika-muted font-semibold mb-3">Your tests</h2>
      <div className="bg-vatika-surface border border-vatika-line rounded-card">
        {loading ? (
          <p className="text-sm text-vatika-muted p-6">Loading…</p>
        ) : tests.length === 0 ? (
          <p className="text-sm text-vatika-muted p-6">No tests yet — create one above.</p>
        ) : (
          <ul>
            {tests.map((t, i) => (
              <li key={t._id} className={i !== tests.length - 1 ? "border-b border-vatika-line" : ""}>
                <button
                  onClick={() => setExpandedTestId(expandedTestId === t._id ? null : t._id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-vatika-bg/50 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-vatika-ink">{t.title}</p>
                    <p className="text-xs text-vatika-muted">
                      {t.class} • {t.subject} • {t.difficulty} • {t.questions.length} questions • {t.durationMinutes} min
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 rounded-full font-medium capitalize bg-vatika-forest/10 text-vatika-forest">
                      {t.status}
                    </span>
                    {t.status === "draft" && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          publishTest(t._id);
                        }}
                        className="text-xs text-vatika-marigoldDark font-medium hover:underline"
                      >
                        {publishingId === t._id ? "Publishing…" : "Publish"}
                      </span>
                    )}
                    {expandedTestId === t._id && editingTestId !== t._id && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTest(t);
                        }}
                        className="text-xs text-vatika-forest font-medium hover:underline"
                      >
                        Edit
                      </span>
                    )}
                    <span className="text-xs text-vatika-muted">
                      {expandedTestId === t._id ? "Hide ▲" : "View ▼"}
                    </span>
                  </div>
                </button>

                {expandedTestId === t._id && editingTestId === t._id && (
                  <div className="px-5 pb-5 space-y-3">
                    {editQuestions.map((q, qi) => (
                      <div key={qi} className="border border-vatika-line rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <select
                            value={q.type}
                            onChange={(e) => updateEditQuestion(qi, "type", e.target.value)}
                            className="text-sm rounded-lg border border-vatika-line px-2 py-1.5"
                          >
                            <option value="mcq">MCQ</option>
                            <option value="short">Short answer</option>
                            <option value="long">Long answer</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => removeEditQuestion(qi)}
                            className="text-xs text-vatika-clay hover:underline"
                          >
                            Remove
                          </button>
                        </div>

                        <textarea
                          value={q.questionText}
                          onChange={(e) => updateEditQuestion(qi, "questionText", e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-vatika-line px-3 py-2 text-sm mb-3"
                        />

                        {q.type === "mcq" && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                            {(q.options || ["", "", "", ""]).map((opt, oi) => (
                              <input
                                key={oi}
                                value={opt}
                                onChange={(e) => updateEditOption(qi, oi, e.target.value)}
                                placeholder={`Option ${oi + 1}`}
                                className="rounded-lg border border-vatika-line px-3 py-1.5 text-sm"
                              />
                            ))}
                            <input
                              value={q.correctAnswer || ""}
                              onChange={(e) => updateEditQuestion(qi, "correctAnswer", e.target.value)}
                              placeholder="Correct answer (must match an option exactly)"
                              className="rounded-lg border border-vatika-line px-3 py-1.5 text-sm sm:col-span-2"
                            />
                          </div>
                        )}

                        <input
                          type="number"
                          min={1}
                          value={q.maxMarks}
                          onChange={(e) => updateEditQuestion(qi, "maxMarks", Number(e.target.value))}
                          placeholder="Marks"
                          className="w-28 rounded-lg border border-vatika-line px-3 py-1.5 text-sm"
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addEditQuestion}
                      className="text-sm text-vatika-forest font-medium hover:underline"
                    >
                      + Add question
                    </button>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => saveEditedTest(t._id)}
                        disabled={savingEdit}
                        className="rounded-lg bg-vatika-forest text-white font-medium py-2 px-4 text-sm hover:bg-vatika-forestDark transition disabled:opacity-60"
                      >
                        {savingEdit ? "Saving…" : "Save changes"}
                      </button>
                      <button
                        onClick={cancelEditingTest}
                        className="rounded-lg border border-vatika-line py-2 px-4 text-sm text-vatika-muted hover:bg-vatika-bg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {expandedTestId === t._id && editingTestId !== t._id && (
                  <div className="px-5 pb-5 space-y-3">
                    {t.questions.map((q, qi) => (
                      <div key={qi} className="bg-vatika-bg rounded-lg p-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs uppercase tracking-wide font-semibold text-vatika-marigoldDark">
                            {q.type} • {q.maxMarks} mark{q.maxMarks !== 1 ? "s" : ""}
                          </span>
                          <span className="text-xs text-vatika-muted">Q{qi + 1}</span>
                        </div>
                        <p className="text-sm text-vatika-ink mb-2">{q.questionText}</p>
                        {q.type === "mcq" && q.options && (
                          <ul className="space-y-1">
                            {q.options.map((opt, oi) => (
                              <li
                                key={oi}
                                className={`text-sm px-2 py-1 rounded ${
                                  opt === q.correctAnswer
                                    ? "bg-vatika-forest/10 text-vatika-forest font-medium"
                                    : "text-vatika-muted"
                                }`}
                              >
                                {opt} {opt === q.correctAnswer && "✓"}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
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

const NumberInput = ({ label, value, onChange, min = 0 }) => (
  <label className="block">
    <span className="block text-sm font-medium text-vatika-ink mb-1.5">{label}</span>
    <input
      type="number"
      min={min}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-vatika-line bg-white px-3 py-2.5 text-sm"
    />
  </label>
);

const TextInput = ({ label, value, onChange, placeholder, required }) => (
  <label className="block">
    <span className="block text-sm font-medium text-vatika-ink mb-1.5">{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-lg border border-vatika-line bg-white px-3 py-2.5 text-sm"
    />
  </label>
);

export default Tests;
