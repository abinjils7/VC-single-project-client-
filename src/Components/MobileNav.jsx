import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";

export default function MobileNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector(selectCurrentUser);
    const isInvestor = user?.role === "investor";

    const isActive = (path) => {
        return location.pathname === path
            ? "text-white"
            : "text-zinc-500";
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 lg:hidden px-6 py-2 safe-area-bottom">
            <div className="flex justify-around items-center">
                <div
                    onClick={() => navigate("/home")}
                    className={`flex flex-col items-center p-2 cursor-pointer active-scale smooth-transition ${isActive("/home")}`}
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-[10px] mt-1 font-medium">Home</span>
                </div>

                {isInvestor && (
                    <div
                        onClick={() => navigate("/pitch-inbox")}
                        className={`flex flex-col items-center p-2 cursor-pointer active-scale smooth-transition ${isActive("/pitch-inbox")}`}
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <span className="text-[10px] mt-1 font-medium">Pitch</span>
                    </div>
                )}

                <div
                    onClick={() => navigate("/chat")}
                    className={`flex flex-col items-center p-2 cursor-pointer active-scale smooth-transition ${isActive("/chat")}`}
                >
                    <div className="relative">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {/* You can pass the badge state as a prop if needed, or perform the check here too */}
                    </div>
                    <span className="text-[10px] mt-1 font-medium">Chat</span>
                </div>

                <div
                    onClick={() => navigate("/analytics")}
                    className={`flex flex-col items-center p-2 cursor-pointer active-scale smooth-transition ${isActive("/analytics")}`}
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-[10px] mt-1 font-medium">Stats</span>
                </div>

                <div
                    onClick={() => navigate("/profile")}
                    className={`flex flex-col items-center p-2 cursor-pointer active-scale smooth-transition ${isActive("/profile")}`}
                >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[10px] mt-1 font-medium">Profile</span>
                </div>
            </div>
        </div>
    );
}
