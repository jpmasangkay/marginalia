import { Search, Bell, Plus, User, Calendar as CalendarIcon, ChevronDown, LogOut, Check, Trash2, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { Calendar } from "./calendar";
import type { Notification } from "../pages/dashboard";

interface TaskbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewNote: () => void;
  userName?: string;
  markedDates?: { date: Date; color?: string }[];
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  onClearAllNotifications: () => void;
}

export function Taskbar({
  searchQuery,
  onSearchChange,
  onNewNote,
  userName = "User",
  markedDates,
  notifications,
  onMarkNotificationRead,
  onClearAllNotifications,
}: TaskbarProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    if (showCalendar || showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar, showNotifications]);

  const handleLogout = () => {
    navigate("/login");
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "created":
        return <Sparkles className="w-4 h-4 text-[#a78bfa]" />;
      case "updated":
        return <Check className="w-4 h-4 text-[#34d399]" />;
      case "deleted":
        return <Trash2 className="w-4 h-4 text-[#fb7185]" />;
      default:
        return <Bell className="w-4 h-4 text-[#9b8fad]" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      className="sticky top-0 z-30 px-5 py-3 flex items-center gap-3 border-b-4"
      style={{
        backgroundColor: "#fef9ec",
        borderBottomColor: "rgba(251, 211, 141, 0.45)",
        boxShadow: "0 4px 12px -2px rgba(167,139,250,0.08), 0 1px 4px rgba(167,139,250,0.06)",
      }}
    >
      {/* Logo — styled as its own pinned note */}
      <div
        className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border-b-4 shadow-md select-none flex-shrink-0"
        style={{
          backgroundColor: "#fff9e6",
          borderBottomColor: "rgba(251, 211, 141, 0.6)",
          boxShadow: "0 4px 8px -2px rgba(251,211,141,0.35)",
        }}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-[#a78bfa] to-[#c4b5fd] rounded-xl flex items-center justify-center shadow-sm transform -rotate-3">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-[#4a4458] hidden sm:block" style={{ fontWeight: 700 }}>
          Marginilia
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-[#e9d5ff]/60 mx-1 flex-shrink-0" />

      {/* Search — note card style */}
      <div
        className="relative flex-1 max-w-sm rounded-2xl border-b-[3px] shadow-sm overflow-hidden"
        style={{
          backgroundColor: "#fff",
          borderBottomColor: "rgba(196,181,253,0.5)",
          boxShadow: "0 3px 8px -2px rgba(167,139,250,0.12)",
        }}
      >
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c4b5fd]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search your notes..."
          className="w-full pl-10 pr-4 py-2.5 bg-transparent focus:outline-none text-sm text-[#4a4458] placeholder:text-[#c4b5fd]"
        />
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 ml-auto flex-shrink-0">

        {/* New Note button — note card style */}
        <button
          onClick={onNewNote}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-2xl border-b-[3px] shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg text-sm flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #a78bfa, #c4b5fd)",
            borderBottomColor: "rgba(139,92,246,0.4)",
            boxShadow: "0 4px 10px -2px rgba(167,139,250,0.4)",
          }}
        >
          <Plus className="w-4 h-4" />
          <span style={{ fontWeight: 600 }}>New Note</span>
        </button>

        {/* Calendar — note card */}
        <div className="relative" ref={calendarRef}>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-2xl border-b-[3px] shadow-sm transition-all duration-200 hover:-translate-y-0.5 text-sm text-[#4a4458]"
            style={{
              backgroundColor: "#fff",
              borderBottomColor: "rgba(196,181,253,0.5)",
              boxShadow: "0 3px 8px -2px rgba(167,139,250,0.12)",
            }}
          >
            <CalendarIcon className="w-4 h-4 text-[#a78bfa]" />
            <span className="hidden sm:inline" style={{ fontWeight: 500 }}>March 2026</span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#a78bfa] transition-transform duration-200 ${showCalendar ? "rotate-180" : ""}`}
            />
          </button>

          {showCalendar && (
            <div className="absolute right-0 mt-2 w-80 z-50">
              <Calendar markedDates={markedDates} />
            </div>
          )}
        </div>

        {/* Notifications — note card */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-2xl flex items-center justify-center border-b-[3px] shadow-sm transition-all duration-200 hover:-translate-y-0.5"
            style={{
              backgroundColor: "#fff",
              borderBottomColor: "rgba(196,181,253,0.5)",
              boxShadow: "0 3px 8px -2px rgba(167,139,250,0.12)",
            }}
          >
            <Bell className="w-4 h-4 text-[#9b8fad]" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#fb7185] rounded-full border-2 border-[#fef9ec] flex items-center justify-center">
                <span className="text-[10px] text-white font-semibold">{unreadCount}</span>
              </div>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-96 rounded-3xl overflow-hidden z-50 border-b-4"
              style={{
                backgroundColor: "#fff",
                borderBottomColor: "rgba(196,181,253,0.4)",
                boxShadow: "0 16px 32px -4px rgba(167,139,250,0.2), 0 4px 12px -2px rgba(167,139,250,0.15)",
              }}
            >
              <div className="px-5 py-3.5 border-b border-[rgba(167,139,250,0.1)] flex items-center justify-between" style={{ backgroundColor: "#fef9ec" }}>
                <h3 className="text-sm text-[#4a4458]" style={{ fontWeight: 700 }}>notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={onClearAllNotifications}
                    className="text-xs text-[#9b8fad] hover:text-[#fb7185] transition-colors"
                  >
                    clear all
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-10 h-10 mx-auto mb-3 text-[#e9d5ff]" />
                    <p className="text-sm text-[#9b8fad]">no notifications yet</p>
                    <p className="text-xs text-[#c4b5fd] mt-1">we'll let you know when something happens!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[rgba(167,139,250,0.08)]">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-5 py-3.5 hover:bg-[#faf8fc] transition-colors cursor-pointer ${
                          !notification.read ? "bg-[#faf8fc]/60" : ""
                        }`}
                        onClick={() => onMarkNotificationRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex-shrink-0">{getNotificationIcon(notification.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#4a4458] leading-relaxed">{notification.message}</p>
                            <p className="text-xs text-[#9b8fad] mt-0.5">{formatTime(notification.timestamp)}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-[#a78bfa] rounded-full mt-2 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User + Logout — note card */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-2xl border-b-[3px] shadow-sm"
          style={{
            backgroundColor: "#fff",
            borderBottomColor: "rgba(196,181,253,0.5)",
            boxShadow: "0 3px 8px -2px rgba(167,139,250,0.12)",
          }}
        >
          <div className="w-7 h-7 bg-gradient-to-br from-[#a78bfa] to-[#c4b5fd] rounded-xl flex items-center justify-center shadow-sm">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm text-[#4a4458] hidden sm:block" style={{ fontWeight: 500 }}>
            {userName}
          </span>
          <button
            onClick={handleLogout}
            className="ml-1 w-7 h-7 rounded-xl flex items-center justify-center hover:bg-[#fecdd3] transition-colors duration-200 group"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 text-[#9b8fad] group-hover:text-[#fb7185] transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
