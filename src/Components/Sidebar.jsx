import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logOut } from "../features/auth/authSlice";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { apiSlice } from "../store/apiSlice";

export default function Sidebar({ showLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const isInvestor = user?.role === "investor";
    const [logout] = useLogoutMutation();

    const handleLogout = async () => {
        try {
            await logout().unwrap();
            dispatch(logOut());
            dispatch(apiSlice.util.resetApiState());
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            dispatch(logOut());
            dispatch(apiSlice.util.resetApiState());
            navigate("/login");
        }
    };

    const isActive = (path) => {
        return location.pathname === path
            ? "bg-gray-900 text-white"
            : "text-gray-600 hover:bg-gray-50";
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 sticky top-24 shadow-sm">
            <h2 className="font-bold text-lg text-gray-900 mb-4">Dashboard</h2>
            <nav className="space-y-2">
                <div
                    onClick={() => navigate("/home")}
                    className={`flex items-center space-x-3 p-3 rounded-lg font-medium transition-colors cursor-pointer ${isActive(
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
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${isActive(
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

                {/* Only show Post Requirements for investors */}
                {isInvestor && (
                    <div
                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${isActive(
                            "/requirements"
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <span>Requirements</span>
                    </div>
                )}

                <div
                    onClick={() => navigate("/chat")}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${isActive(
                        "/chat"
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
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                    </svg>
                    <span>Chats</span>
                </div>

                <div
                    onClick={() => navigate("/analytics")}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${isActive(
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
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${isActive(
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

            <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="flex items-center space-x-3 p-3 text-gray-600 hover:bg-gray-50 rounded-lg w-full transition-colors cursor-pointer">
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
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                        />
                    </svg>
                    <span>Dark Mode</span>
                </button>

                {showLogout && (
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors mt-2 cursor-pointer"
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
    );
}
