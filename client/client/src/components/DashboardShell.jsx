import LeafMark from "./LeafMark";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

const ADMIN_WHATSAPP = "919893161971"; // country code + number, no + or spaces, for wa.me links

const DashboardShell = ({ title, children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-vatika-bg">
      <header className="border-b border-vatika-line bg-vatika-surface">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LeafMark className="w-7 h-7" />
            <span className="font-display text-lg font-semibold text-vatika-forest">
              Gyan Vatika
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://wa.me/${ADMIN_WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-vatika-line bg-white flex items-center justify-center hover:bg-vatika-bg transition"
              title="Contact admin on WhatsApp"
              aria-label="Contact admin on WhatsApp"
            >
              💬
            </a>
            <NotificationBell />
            <div className="text-right">
              <p className="text-sm font-medium text-vatika-ink leading-tight">{user?.name}</p>
              <p className="text-xs text-vatika-muted capitalize leading-tight">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-vatika-muted hover:text-vatika-clay border border-vatika-line rounded-lg px-3 py-1.5 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="font-display text-2xl font-semibold text-vatika-ink mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
};

export default DashboardShell;
