"use client";

import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  DollarSign,
  UserPlus,
  ShieldAlert,
  Check
} from "lucide-react";
import { useState } from "react";

const initialNotifications = [
  { id: 1, type: "alert", title: "API Balance Low", message: "Your Termii SMS API balance is below ₦5,000. Please top up to avoid service disruption.", time: "10 mins ago", read: false, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  { id: 2, type: "success", title: "New Enterprise Sign Up", message: "Tech Hub Inc just subscribed to the Enterprise Plan (₦150,000/mo).", time: "1 hour ago", read: false, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  { id: 3, type: "finance", title: "Agent Commission Paid", message: "₦25,000 was successfully disbursed to Agent James Smith.", time: "3 hours ago", read: false, icon: DollarSign, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: 4, type: "info", title: "New Team Member", message: "Sarah Finance accepted your invitation to join the Financial OS.", time: "1 day ago", read: true, icon: UserPlus, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { id: 5, type: "security", title: "New Login Detected", message: "A login was detected from a new IP Address in Lagos, Nigeria.", time: "2 days ago", read: true, icon: ShieldAlert, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-3">
            <Bell className="w-6 h-6" /> Notifications
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h1>
          <p className="text-zinc-500 mt-1">Stay updated on system alerts, new signups, and financial movements.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
          >
            <Check className="w-4 h-4" /> Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            onClick={() => markAsRead(notification.id)}
            className={`flex gap-4 p-5 rounded-xl border transition-all cursor-pointer
              ${notification.read 
                ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100' 
                : 'bg-zinc-50 dark:bg-zinc-800/50 border-blue-200 dark:border-blue-900/50 shadow-sm'}`}
          >
            <div className={`mt-0.5 p-2.5 rounded-full h-fit ${notification.bg} ${notification.color}`}>
              <notification.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-sm font-semibold ${notification.read ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-900 dark:text-zinc-50'}`}>
                  {notification.title}
                </h3>
                <span className="text-xs text-zinc-400 whitespace-nowrap ml-4">{notification.time}</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {notification.message}
              </p>
            </div>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
