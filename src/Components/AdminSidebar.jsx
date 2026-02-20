import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logOut } from "../features/auth/authSlice";
import { useLogoutMutation } from "../features/auth/authApiSlice";
import { apiSlice } from "../store/apiSlice";

export default function AdminSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const [logout] = useLogoutMutation();

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
            ? "bg-white/10 text-white"
            : "text-zinc-400 hover:bg-white/5 hover:text-white";
    };

    return (
        <aside className="w-full bg-transparent h-full flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-black text-white tracking-tight">Admin Panel</h1>
            </div>
            <nav className="mt-6 px-4 space-y-2 flex-1">
                <div
                    onClick={() => navigate("/admin/dashboard")}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer ${isActive("/admin/dashboard")}`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Dashboard</span>
                </div>
                <div
                    onClick={() => navigate("/admin/users")}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer ${isActive("/admin/users")}`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Manage Users</span>
                </div>
                <div
                    onClick={() => navigate("/admin/reports")}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer ${isActive("/admin/reports")}`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>Reported Posts</span>
                </div>
                <div
                    onClick={() => navigate("/admin/post-news")}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer ${isActive("/admin/post-news")}`}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Post News</span>
                </div>
            </nav>
            <div className="p-4 border-t border-zinc-800 mt-auto">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg w-full transition-colors"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
