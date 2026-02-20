import { useSelector } from "react-redux";
import { useGetPitchesForInvestorQuery, useUpdatePitchStatusMutation } from "../../features/pitch/pitchApiSlice";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetUserQuery } from "../../features/user/userApislice";
import { toast } from "sonner";
import Sidebar from "../../Components/Sidebar";

export default function PitchInbox() {
    const user = useSelector(selectCurrentUser);
    const { data: userData } = useGetUserQuery();
    const currentUser = userData || user;

    const { data: pitches = [], isLoading, error } = useGetPitchesForInvestorQuery(
        currentUser?._id || currentUser?.user?._id || currentUser?.id,
        {
            skip: !currentUser || currentUser.role !== "investor",
        }
    );

    const [updatePitchStatus, { isLoading: isUpdating }] = useUpdatePitchStatusMutation();

    const handleStatusUpdate = async (pitchId, status) => {
        try {
            await updatePitchStatus({ pitchId, status }).unwrap();
            toast.success(`Pitch ${status} successfully!`);
        } catch (err) {
            console.error(`Failed to ${status} pitch:`, err);
            toast.error(`Failed to ${status} pitch.`);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const xFonts = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif' };

    return (
        <div className="min-h-screen bg-black text-[#e7e9ea] font-sans" style={xFonts}>
            {/* Custom Scrollbar Styles */}
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #2f3336;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                `}
            </style>

            {/* Header */}
            <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
                <div className="w-full px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Venture Capital</h1>
                    </div>
                </div>
            </header>

            <div className="w-full flex">
                <aside className="hidden lg:block w-72 h-[calc(100vh-60px)] sticky top-[60px] border-r border-zinc-800 p-4 flex-shrink-0">
                    <Sidebar />
                </aside>

                <main className="flex-1 max-w-full min-h-screen p-8">
                    <h2 className="text-2xl font-bold mb-8 pb-4">Pitch Inbox</h2>

                    {pitches.length === 0 ? (
                        <div className="p-20 text-center text-[#71767b] font-medium border border-zinc-800 rounded-[32px] bg-[#080808]">
                            No pitches received yet.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            {pitches.map((pitch) => (
                                <div key={pitch._id} className="bg-[#080808]/40 border border-zinc-800 rounded-[32px] overflow-hidden flex flex-row min-h-[280px] hover:bg-[#080808] transition-all">

                                    {/* Video Section */}
                                    <div className="w-2/5 bg-black relative border-r border-zinc-800 flex-shrink-0">
                                        <video
                                            src={`http://localhost:5000/${pitch.pitchVideoUrl}`}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-xl ${pitch.status === 'accepted' ? 'bg-green-600' :
                                            pitch.status === 'rejected' ? 'bg-red-600' : 'bg-yellow-600'
                                            }`}>
                                            {pitch.status}
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="w-3/5 p-6 flex flex-col min-w-0">
                                        <div className="flex-1 overflow-hidden flex flex-col">
                                            <div className="flex items-center gap-3 mb-4 shrink-0">
                                                <img
                                                    src={pitch.fromUserId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pitch.fromUserId?.name || "unknown"}`}
                                                    className="h-10 w-10 rounded-full border border-zinc-800"
                                                    alt="Avatar"
                                                />
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-[16px] text-white truncate">{pitch.fromUserId?.displayName || pitch.fromUserId?.name}</h3>
                                                    <p className="text-[12px] font-bold text-[#71767b] uppercase tracking-wider">{pitch.fromUserId?.stage} • {pitch.fromUserId?.category1}</p>
                                                </div>
                                            </div>

                                            {/* Scrollable Description Area */}
                                            <div className="overflow-y-auto pr-2 custom-scrollbar max-h-[140px]">
                                                <p className="text-[#e7e9ea] text-[14px] font-normal leading-relaxed whitespace-pre-wrap">
                                                    {pitch.message}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions at bottom */}
                                        <div className="mt-6 pt-4 border-t border-zinc-800/50 shrink-0">
                                            {pitch.status === 'pending' ? (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleStatusUpdate(pitch._id, 'accepted')}
                                                        disabled={isUpdating}
                                                        className="flex-1 bg-white text-black py-2 rounded-full font-bold text-xs uppercase hover:bg-[#1d9bf0] hover:text-white transition-all disabled:opacity-50"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(pitch._id, 'rejected')}
                                                        disabled={isUpdating}
                                                        className="flex-1 border border-zinc-800 text-white py-2 rounded-full font-bold text-xs uppercase hover:bg-red-600/10 hover:text-red-500 transition-all disabled:opacity-50"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className={`text-center py-2 rounded-full text-xs font-black uppercase border tracking-widest ${pitch.status === 'accepted' ? 'text-[#00ba7c] border-[#00ba7c]/30 bg-[#00ba7c]/5' : 'text-red-500 border-red-500/30 bg-red-500/5'
                                                    }`}>
                                                    Pitch {pitch.status}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}