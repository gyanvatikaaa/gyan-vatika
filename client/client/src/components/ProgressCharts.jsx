import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = { forest: "#2D4A3E", marigold: "#E8A33D", clay: "#B4674A" };

const ProgressCharts = ({ report }) => {
  if (!report || report.overall.testsCompleted === 0) {
    return (
      <div className="bg-vatika-surface border border-vatika-line rounded-card p-8 text-center">
        <p className="text-sm text-vatika-muted">
          No approved test results yet — progress charts will appear here once tests are completed and approved.
        </p>
      </div>
    );
  }

  const { overall, subjectWise, monthlyTrend, weakTopics, strongTopics, testHistory } = report;

  return (
    <div className="space-y-6">
      {/* Overall snapshot */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-vatika-surface border border-vatika-line rounded-card p-5">
          <p className="text-xs uppercase tracking-wide text-vatika-muted font-medium mb-1">Tests completed</p>
          <p className="font-display text-3xl font-semibold text-vatika-ink">{overall.testsCompleted}</p>
        </div>
        <div className="bg-vatika-surface border border-vatika-line rounded-card p-5">
          <p className="text-xs uppercase tracking-wide text-vatika-muted font-medium mb-1">Average score</p>
          <p className="font-display text-3xl font-semibold text-vatika-forest">{overall.averagePercent}%</p>
        </div>
      </div>

      {/* Overall improvement graph */}
      {monthlyTrend.length > 1 && (
        <div className="bg-vatika-surface border border-vatika-line rounded-card p-5">
          <p className="text-sm font-semibold text-vatika-ink mb-4">Overall improvement</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE3D6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#5C6B60" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#5C6B60" }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Line type="monotone" dataKey="averagePercent" stroke={COLORS.forest} strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Subject-wise performance */}
      {subjectWise.length > 0 && (
        <div className="bg-vatika-surface border border-vatika-line rounded-card p-5">
          <p className="text-sm font-semibold text-vatika-ink mb-4">Subject-wise performance</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={subjectWise}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCE3D6" />
              <XAxis dataKey="subject" tick={{ fontSize: 12, fill: "#5C6B60" }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#5C6B60" }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="averagePercent" fill={COLORS.marigold} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weak / strong topics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-vatika-surface border border-vatika-clay/30 rounded-card p-5">
          <p className="text-sm font-semibold text-vatika-ink mb-3">Weak topics</p>
          {weakTopics.length === 0 ? (
            <p className="text-sm text-vatika-muted">None identified yet — good work!</p>
          ) : (
            <ul className="space-y-2">
              {weakTopics.map((t) => (
                <li key={t.chapter} className="flex items-center justify-between text-sm">
                  <span className="text-vatika-ink">{t.chapter}</span>
                  <span className="text-xs text-vatika-clay font-medium">{t.averagePercent}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-vatika-surface border border-vatika-forest/30 rounded-card p-5">
          <p className="text-sm font-semibold text-vatika-ink mb-3">Strong topics</p>
          {strongTopics.length === 0 ? (
            <p className="text-sm text-vatika-muted">Keep going — strong topics will show up here.</p>
          ) : (
            <ul className="space-y-2">
              {strongTopics.map((t) => (
                <li key={t.chapter} className="flex items-center justify-between text-sm">
                  <span className="text-vatika-ink">{t.chapter}</span>
                  <span className="text-xs text-vatika-forest font-medium">{t.averagePercent}%</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Test history */}
      <div className="bg-vatika-surface border border-vatika-line rounded-card">
        <p className="text-sm font-semibold text-vatika-ink px-5 pt-5 pb-3">Test history</p>
        <ul>
          {testHistory.map((h, i) => (
            <li key={i} className={`px-5 py-3 flex items-center justify-between text-sm ${i !== testHistory.length - 1 ? "border-b border-vatika-line" : ""}`}>
              <div>
                <p className="text-vatika-ink font-medium">{h.testTitle}</p>
                <p className="text-xs text-vatika-muted">
                  {h.subject} • {new Date(h.submittedAt).toLocaleDateString("en-IN")}
                </p>
              </div>
              <span className="text-sm font-medium text-vatika-forest">{h.percent}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProgressCharts;
