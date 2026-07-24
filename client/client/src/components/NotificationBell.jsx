import { useEffect, useRef, useState } from "react";
import api from "../api/axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications/mine");
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Silent fail — notification bell shouldn't block the rest of the UI
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((o) => !o);
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-full border border-vatika-line bg-white flex items-center justify-center hover:bg-vatika-bg transition"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-vatika-clay text-white text-[10px] font-semibold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-vatika-line rounded-card shadow-lg z-20 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-vatika-line">
            <p className="text-sm font-semibold text-vatika-ink">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-vatika-forest hover:underline">
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-vatika-muted px-4 py-6 text-center">No notifications yet.</p>
          ) : (
            <ul>
              {notifications.map((n) => (
                <li
                  key={n._id}
                  className={`px-4 py-3 border-b border-vatika-line last:border-0 text-sm ${
                    !n.isRead ? "bg-vatika-marigold/5" : ""
                  }`}
                >
                  <p className="text-vatika-ink font-medium">{n.title}</p>
                  <p className="text-vatika-muted text-xs mt-0.5">{n.message}</p>
                  <p className="text-vatika-muted/70 text-[11px] mt-1">
                    {new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
