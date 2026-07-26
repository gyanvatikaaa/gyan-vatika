import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardShell from "../../components/DashboardShell";
import api from "../../api/axios";

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionIndex: { textAnswer, photoUrl } }
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const submittedRef = useRef(false);

  const buildAnswersPayload = useCallback(
    () =>
      test.questions.map((q, i) => ({
        questionIndex: i,
        type: q.type,
        textAnswer: answers[i]?.textAnswer || "",
        photoUrls: answers[i]?.photoUrls || [],
      })),
    [test, answers]
  );

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (submittedRef.current || !test || !submission) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        await api.post(`/submissions/${submission._id}/submit`, { answers: buildAnswersPayload() });
        navigate("/student/tests", { state: { justSubmitted: true, auto } });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to submit test");
        submittedRef.current = false;
        setSubmitting(false);
      }
    },
    [test, submission, buildAnswersPayload, navigate]
  );

  useEffect(() => {
    const start = async () => {
      try {
        const { data } = await api.post(`/submissions/start/${testId}`);
        setTest(data.test);
        setSubmission(data.submission);

        const elapsedSeconds = Math.floor((Date.now() - new Date(data.submission.startedAt)) / 1000);
        const totalSeconds = data.test.durationMinutes * 60;
        setSecondsLeft(Math.max(totalSeconds - elapsedSeconds, 0));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to start test");
      } finally {
        setLoading(false);
      }
    };
    start();
  }, [testId]);

  // Countdown timer — auto-submits when it hits zero
  useEffect(() => {
    if (secondsLeft === null) return;
    if (secondsLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [secondsLeft, handleSubmit]);

  const updateAnswer = (index, key, value) => {
    setAnswers((prev) => ({ ...prev, [index]: { ...prev[index], [key]: value } }));
  };

  const handlePhotoChange = async (index, files) => {
    if (!files || files.length === 0) return;
    setUploadingIndex(index);
    setError("");
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const base64 = await fileToBase64(file);
        const { data } = await api.post("/submissions/upload-photo", { imageBase64: base64 });
        uploadedUrls.push(data.url);
      }
      setAnswers((prev) => ({
        ...prev,
        [index]: { ...prev[index], photoUrls: [...(prev[index]?.photoUrls || []), ...uploadedUrls] },
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Photo upload failed");
    } finally {
      setUploadingIndex(null);
    }
  };

  const removePhoto = (index, photoIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: { ...prev[index], photoUrls: prev[index].photoUrls.filter((_, i) => i !== photoIndex) },
    }));
  };

  if (loading) {
    return (
      <DashboardShell title="Loading test…">
        <p className="text-sm text-vatika-muted">Please wait…</p>
      </DashboardShell>
    );
  }

  if (error && !test) {
    return (
      <DashboardShell title="Test unavailable">
        <div className="rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      </DashboardShell>
    );
  }

  const isLowTime = secondsLeft !== null && secondsLeft <= 60;

  return (
    <DashboardShell title={test.title}>
      {/* Sticky timer bar */}
      <div
        className={`sticky top-0 z-10 -mx-6 px-6 py-3 mb-6 border-b flex items-center justify-between ${
          isLowTime ? "bg-vatika-clay/10 border-vatika-clay/30" : "bg-vatika-bg border-vatika-line"
        }`}
      >
        <p className="text-sm text-vatika-muted">
          {test.subject} • {test.questions.length} questions
        </p>
        <p className={`font-display text-xl font-semibold ${isLowTime ? "text-vatika-clay" : "text-vatika-ink"}`}>
          ⏱ {formatTime(secondsLeft)}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {test.questions.map((q, i) => (
          <div key={i} className="bg-vatika-surface border border-vatika-line rounded-card p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wide font-semibold text-vatika-marigoldDark">
                {q.type} • {q.maxMarks} mark{q.maxMarks !== 1 ? "s" : ""}
              </span>
              <span className="text-xs text-vatika-muted">Q{i + 1}</span>
            </div>
            <p className="text-sm text-vatika-ink mb-3">{q.questionText}</p>

            {q.type === "mcq" ? (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-lg border cursor-pointer transition ${
                      answers[i]?.textAnswer === opt
                        ? "border-vatika-forest bg-vatika-forest/5"
                        : "border-vatika-line hover:bg-vatika-bg"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      checked={answers[i]?.textAnswer === opt}
                      onChange={() => updateAnswer(i, "textAnswer", opt)}
                      className="accent-vatika-forest"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ) : (
              <div>
                <textarea
                  value={answers[i]?.textAnswer || ""}
                  onChange={(e) => updateAnswer(i, "textAnswer", e.target.value)}
                  placeholder="Type your answer here…"
                  rows={q.type === "long" ? 5 : 3}
                  className="w-full rounded-lg border border-vatika-line px-3 py-2 text-sm mb-3"
                />

                <p className="text-xs text-vatika-muted mb-2">— or upload photo(s) of your handwritten answer (you can add more than one page) —</p>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={(e) => handlePhotoChange(i, Array.from(e.target.files))}
                  className="text-sm text-vatika-muted"
                />

                {uploadingIndex === i && <p className="text-xs text-vatika-marigoldDark mt-2">Uploading…</p>}

                {answers[i]?.photoUrls?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {answers[i].photoUrls.map((url, pi) => (
                      <div key={pi} className="relative">
                        <img src={url} alt={`Answer ${i + 1} page ${pi + 1}`} className="w-28 h-28 object-cover rounded-lg border border-vatika-line" />
                        <button
                          type="button"
                          onClick={() => removePhoto(i, pi)}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-vatika-clay text-white text-xs flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => handleSubmit(false)}
          disabled={submitting}
          className="rounded-lg bg-vatika-forest text-white font-semibold py-3 px-8 text-sm hover:bg-vatika-forestDark transition disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit test"}
        </button>
      </div>
    </DashboardShell>
  );
};

export default TakeTest;
