import DashboardShell from "../../components/DashboardShell";
import { Link } from "react-router-dom";

const StudentDashboard = () => (
  <DashboardShell title="Student dashboard">
    <div className="bg-vatika-surface border border-vatika-line rounded-card p-8 text-center">
      <p className="text-sm text-vatika-muted mb-4">
        Welcome! Your progress, homework, and attendance will appear here in a later build chunk.
      </p>
      <Link
        to="/student/tests"
        className="inline-block rounded-lg bg-vatika-forest text-white font-medium py-2.5 px-5 text-sm hover:bg-vatika-forestDark transition mr-3"
      >
        View your tests
      </Link>
      <Link
        to="/student/progress"
        className="inline-block rounded-lg border border-vatika-forest text-vatika-forest font-medium py-2.5 px-5 text-sm hover:bg-vatika-forest/5 transition mr-3"
      >
        View your progress
      </Link>
      <Link
        to="/student/records"
        className="inline-block rounded-lg border border-vatika-line text-vatika-ink font-medium py-2.5 px-5 text-sm hover:bg-vatika-bg transition"
      >
        Attendance, homework & fees
      </Link>
    </div>
  </DashboardShell>
);

export default StudentDashboard;
