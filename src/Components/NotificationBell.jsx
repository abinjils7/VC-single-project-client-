import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} from "../features/notifications/notificationApiSlice";
import { io } from "socket.io-client";

export default function NotificationBell() {
    const user = useSelector(selectCurrentUser);
    const userId = user?._id || user?.user?._id || user?.id;
    const [isOpen, setIsOpen] = useState(false);
    const socketRef = useRef(null);
    const dropdownRef = useRef(null);

    const { data: notifications = [], refetch } = useGetNotificationsQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Socket connection for real-time notifications
    useEffect(() => {
        if (!userId) return;

        socketRef.current = io("http://localhost:5000", {
            withCredentials: true,
        });

        socketRef.current.emit("join_notifications", userId);

        socketRef.current.on("new_notification", () => {
            refetch();
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [userId, refetch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead().unwrap();
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.isRead) {
            try {
                await markAsRead(notification._id).unwrap();
            } catch (err) {
                console.error("Failed to mark as read:", err);
            }
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-100"
            >
                <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif._id}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`flex items-start space-x-3 px-4 py-3 border-b border-gray-50 cursor-pointer transition-colors ${notif.isRead
                                        ? "bg-white hover:bg-gray-50"
                                        : "bg-blue-50 hover:bg-blue-100"
                                        }`}
                                >
                                    {/* Icon based on type */}
                                    <div className={`mt-0.5 shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${notif.message?.includes("ACCEPTED")
                                        ? "bg-green-100 text-green-600"
                                        : notif.message?.includes("REJECTED")
                                            ? "bg-red-100 text-red-600"
                                            : "bg-blue-100 text-blue-600"
                                        }`}>
                                        {notif.message?.includes("ACCEPTED") ? (
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        ) : notif.message?.includes("REJECTED") ? (
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        ) : (
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${notif.isRead ? "text-gray-600" : "text-gray-900 font-medium"}`}>
                                            {notif.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTime(notif.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread dot */}
                                    {!notif.isRead && (
                                        <span className="mt-2 h-2 w-2 bg-blue-500 rounded-full shrink-0"></span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
