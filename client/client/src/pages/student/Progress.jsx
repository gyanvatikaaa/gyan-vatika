import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
import ProgressCharts from "../../components/ProgressCharts";
import api from "../../api/axios";

const Progress = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get("/progress/me");
        setReport(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load progress");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <DashboardShell title="Your progress">
      {error && (
        <div className="mb-4 rounded-lg bg-vatika-clay/10 border border-vatika-clay/30 px-3 py-2.5 text-sm text-vatika-clay">
          {error}
        </div>
      )}
      {loading ? <p className="text-sm text-vatika-muted">Loading…</p> : <ProgressCharts report={report} />}
    </DashboardShell>
  );
};

export default Progress;
