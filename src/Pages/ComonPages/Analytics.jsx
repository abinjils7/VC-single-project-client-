import React from "react";
import { useSelector } from "react-redux";
import { useGetStartupPitchesQuery, useGetPitchesForInvestorQuery } from "../../features/pitch/pitchApiSlice";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetUserQuery } from "../../features/user/userApislice";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Analytics() {
    const user = useSelector(selectCurrentUser);
    const { data: userData } = useGetUserQuery();
    const currentUserRaw = userData || user;
    const currentUser = currentUserRaw?.user ? currentUserRaw.user : currentUserRaw;

    const userId = currentUser?._id || currentUser?.id;
    const isInvestor = currentUser?.role === "investor";
    const isStartup = currentUser?.role === "startup";

    // Fetch for Startup
    const { data: startupPitches = [], isLoading: isLoadingStartup } = useGetStartupPitchesQuery(
        userId,
        { skip: !userId || !isStartup }
    );

    // Fetch for Investor
    const { data: investorPitches = [], isLoading: isLoadingInvestor } = useGetPitchesForInvestorQuery(
        userId,
        { skip: !userId || !isInvestor }
    );

    const pitches = isInvestor ? investorPitches : startupPitches;
    const isLoading = isInvestor ? isLoadingInvestor : isLoadingStartup;

    const totalPitches = pitches.length;
    const accepted = pitches.filter((p) => p.status === "accepted").length;
    const rejected = pitches.filter((p) => p.status === "rejected").length;
    const pending = pitches.filter((p) => p.status === "pending").length;
    const acceptanceRate = totalPitches > 0 ? ((accepted / totalPitches) * 100).toFixed(1) : 0;

    const statusData = {
        labels: ["Accepted", "Rejected", "Pending"],
        datasets: [
            {
                label: "# of Pitches",
                data: [accepted, rejected, pending],
                backgroundColor: ["#ffffff", "#3f3f46", "#71717a"],
                borderColor: "#000000",
                borderWidth: 0,
                hoverOffset: 4
            },
        ],
    };

    const Icons = {
        CheckCircle: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        Clock: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        XCircle: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        TrendingUp: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
        BarChart: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        Download: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
    };

    if (isLoading) return <div className="h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>;

    const xFonts = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif' };

    return (
        <div className="min-h-screen bg-black text-[#e7e9ea] font-sans p-8" style={xFonts}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Analytics</h1>
                        <p className="text-zinc-500 font-medium text-lg">Performance overview & investor engagement</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-5 py-2.5 rounded-full border border-zinc-800 bg-black text-sm font-bold text-zinc-400">
                            Last 6 Months
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-bold text-sm hover:bg-zinc-200 transition-all">
                            <Icons.Download />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-[#121212] p-8 rounded-[32px] border border-zinc-800 group transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">{isInvestor ? "Received" : "Sent"}</p>
                            <div className="text-zinc-600"><Icons.BarChart /></div>
                        </div>
                        <p className="text-5xl font-black text-white mb-4">{totalPitches}</p>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-white h-full rounded-full" style={{ width: '100%' }}></div>
                        </div>
                    </div>

                    <div className="bg-[#121212] p-8 rounded-[32px] border border-zinc-800 group transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Accepted</p>
                            <div className="text-white"><Icons.CheckCircle /></div>
                        </div>
                        <p className="text-5xl font-black text-white mb-4">{accepted}</p>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-white h-full rounded-full" style={{ width: `${totalPitches > 0 ? (accepted / totalPitches) * 100 : 0}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-[#121212] p-8 rounded-[32px] border border-zinc-800 group transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Pending</p>
                            <div className="text-zinc-400"><Icons.Clock /></div>
                        </div>
                        <p className="text-5xl font-black text-white mb-4">{pending}</p>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-zinc-500 h-full rounded-full" style={{ width: `${totalPitches > 0 ? (pending / totalPitches) * 100 : 0}%` }}></div>
                        </div>
                    </div>

                    <div className="bg-[#121212] p-8 rounded-[32px] border border-zinc-800 group transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Success Rate</p>
                            <div className="text-green-500"><Icons.TrendingUp /></div>
                        </div>
                        <p className="text-5xl font-black text-white mb-4">{acceptanceRate}%</p>
                        <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-white h-full rounded-full" style={{ width: `${acceptanceRate}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* Charts & Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-[#121212] p-8 rounded-[32px] border border-zinc-800">
                        <h3 className="text-xl font-bold text-white mb-8">Status Breakdown</h3>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
                            <div className="relative w-64 h-64">
                                <Doughnut
                                    data={statusData}
                                    options={{
                                        plugins: { legend: { display: false } },
                                        cutout: '75%',
                                        borderWidth: 0
                                    }}
                                />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-4xl font-black text-white">{totalPitches}</p>
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total</p>
                                </div>
                            </div>

                            <div className="flex-1 w-full space-y-4">
                                <div className="flex items-center justify-between p-4 bg-black rounded-2xl border border-zinc-800">
                                    <span className="font-bold">Accepted</span>
                                    <span className="text-xl font-black">{accepted}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-black rounded-2xl border border-zinc-800">
                                    <span className="font-bold text-zinc-400">Pending</span>
                                    <span className="text-xl font-black text-zinc-400">{pending}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-black rounded-2xl border border-zinc-800">
                                    <span className="font-bold text-zinc-600">Rejected</span>
                                    <span className="text-xl font-black text-zinc-600">{rejected}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity - Removed internal scroll */}
                    <div className="bg-[#121212] p-8 rounded-[32px] border border-zinc-800">
                        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                        <div className="space-y-4">
                            {pitches.length === 0 ? (
                                <p className="text-zinc-500 text-sm text-center py-8">No activity yet.</p>
                            ) : (
                                pitches.map(pitch => (
                                    <div key={pitch._id} className="p-4 rounded-xl border border-zinc-800 bg-black">
                                        <div className="flex items-center justify-between">
                                            <p className="font-bold text-sm truncate">
                                                {isInvestor
                                                    ? pitch.fromUserId?.displayName || pitch.fromUserId?.name || "Unknown Startup"
                                                    : pitch.toUserId?.displayName || pitch.toUserId?.name || "Unknown Investor"
                                                }
                                            </p>
                                            <span className={`text-[10px] font-black uppercase ${pitch.status === 'accepted' ? 'text-green-500' :
                                                    pitch.status === 'rejected' ? 'text-red-500' : 'text-zinc-500'
                                                }`}>{pitch.status}</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-600 mt-1">{new Date(pitch.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-900 text-center">
                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
                        Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </div>
        </div>
    );
}