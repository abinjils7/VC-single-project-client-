import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logOut } from "../features/auth/authSlice";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { useGetChatsQuery } from "../features/chat/chatApiSlice";
import { apiSlice } from "../store/apiSlice";
import { io } from "socket.io-client";

export default function Sidebar({ showLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const isInvestor = user?.role === "investor";
    const [logout] = useLogoutMutation();
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const socketRef = useRef(null);

    // Fetch chats to join all rooms
    const { data: chatsData } = useGetChatsQuery();

    // Global socket connection for unread notifications
    useEffect(() => {
        socketRef.current = io("http://localhost:5000", {
            withCredentials: true,
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    // Join all chat rooms
    useEffect(() => {
        if (socketRef.current && chatsData?.length > 0) {
            chatsData.forEach((chat) => {
                socketRef.current.emit("join_chat", chat._id);
            });
        }
    }, [chatsData]);

    // Listen for new messages
    useEffect(() => {
        if (!socketRef.current) return;

        const handleNewMessage = (newMessage) => {
            // Only show badge if user is NOT on the chat page
            if (location.pathname !== "/chat" && newMessage.senderId !== user?._id) {
                setHasUnreadMessages(true);
            }
        };

        socketRef.current.on("receive_message", handleNewMessage);

        return () => {
            socketRef.current.off("receive_message", handleNewMessage);
        };
    }, [location.pathname, user?._id]);

    // Clear badge when user navigates to chat page
    useEffect(() => {
        if (location.pathname === "/chat") {
            setHasUnreadMessages(false);
        }
    }, [location.pathname]);

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            dispatch(logOut());
            dispatch(apiSlice.util.resetApiState());
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
            dispatch(logOut());
            dispatch(apiSlice.util.resetApiState());
            navigate("/");
        }
    };

    const isActive = (path) => {
        return location.pathname === path
            ? "bg-white/15 text-white"
            : "text-white/70 hover:bg-white/10";
    };

    return (
        <div className="relative rounded-2xl border border-white/10 mb-6 sticky top-24 shadow-2xl overflow-hidden">
            {/* Video Background */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            >
                <source src="/assets/Smooth_Floating_Space_Movement_Video.mp4" type="video/mp4" />
            </video>
            {/* Glass Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md"></div>
            {/* Content */}
            <div className="relative z-10 p-6">
                <h2 className="font-bold text-lg text-white mb-4">Dashboard</h2>
                <nav className="space-y-2">
                    <div
                        onClick={() => navigate("/home")}
                        className={`flex items-center space-x-3 p-3 rounded-lg font-medium smooth-transition cursor-pointer active:scale-95 ${isActive(
                            "/home"
                        )}`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                        </svg>
                        <span>Feed</span>
                    </div>

                    {/* Only show Pitch Inbox for investors */}
                    {isInvestor && (
                        <div
                            onClick={() => navigate("/pitch-inbox")}
                            className={`flex items-center space-x-3 p-3 rounded-lg smooth-transition cursor-pointer active:scale-95 ${isActive(
                                "/pitch-inbox"
                            )}`}
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                            </svg>
                            <span>Pitch Inbox</span>
                        </div>
                    )}


                    <div
                        onClick={() => navigate("/chat")}
                        className={`flex items-center space-x-3 p-3 rounded-lg smooth-transition cursor-pointer active:scale-95 ${isActive(
                            "/chat"
                        )}`}
                    >
                        <div className="relative">
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            {hasUnreadMessages && (
                                <span className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
                            )}
                        </div>
                        <span>Chats</span>
                    </div>

                    <div
                        onClick={() => navigate("/analytics")}
                        className={`flex items-center space-x-3 p-3 rounded-lg smooth-transition cursor-pointer active:scale-95 ${isActive(
                            "/analytics"
                        )}`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                        </svg>
                        <span>Analytics</span>
                    </div>

                    <div
                        onClick={() => navigate("/profile")}
                        className={`flex items-center space-x-3 p-3 rounded-lg smooth-transition cursor-pointer active:scale-95 ${isActive(
                            "/profile"
                        )}`}
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        <span>Profile</span>
                    </div>
                </nav>

                <div className="mt-4 pt-4 border-t border-white/10">

                    {showLogout && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 p-3 text-red-400 hover:bg-white/10 rounded-lg w-full transition-colors mt-2 cursor-pointer"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                            <span>Log Out</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
