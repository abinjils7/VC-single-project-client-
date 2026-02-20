import { useState } from "react";
import { useGetAdminStatsQuery, useToggleMaintenanceMutation, useGetMaintenanceStatusQuery } from "../../features/admin/adminApiSlice";
import AdminSidebar from "../../Components/AdminSidebar";

export default function AdminDashboard() {
    const { data: stats, isLoading } = useGetAdminStatsQuery();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ---- Maintenance Mode (NEW) ----
    const [toggleMaintenance, { isLoading: isToggling }] = useToggleMaintenanceMutation();
    const { data: maintenanceData, refetch: refetchStatus } = useGetMaintenanceStatusQuery();
    const isMaintenanceOn = maintenanceData?.maintenanceMode || false;

    // Handler to turn maintenance ON or OFF
    const handleToggle = async (value) => {
        try {
            await toggleMaintenance({ maintenanceMode: value }).unwrap();
            refetchStatus(); // Refresh the status after toggling
        } catch (err) {
            console.error("Failed to toggle maintenance:", err);
        }
    };

    // Custom Icons for the dashboard
    const Icons = {
        Users: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
        Rocket: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
        Briefcase: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
        Document: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
        Trending: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    };

    const xFonts = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif' };

    return (
        <div className="min-h-screen bg-black text-[#e7e9ea] font-sans" style={xFonts}>
            <div className="flex">
                {/* Mobile Sidebar Toggle */}
                <button
                    className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-zinc-800 rounded-lg text-white"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isSidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>

                {/* Sidebar Wrapper */}
                <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-black transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen border-r border-zinc-800 p-4 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <AdminSidebar />
                </aside>

                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-12 w-full lg:w-auto">
                    <header className="mb-8 lg:mb-12 border-b border-zinc-800 pb-6 lg:pb-8">
                        <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight">Overview</h2>
                        <p className="text-zinc-500 mt-2 font-medium text-base lg:text-lg">System-wide metrics and performance.</p>
                    </header>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="w-8 h-8 border-2 border-[#1d9bf0] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                            {/* ==========================================
                                Maintenance Mode Toggle Card (NEW)
                               ========================================== */}
                            <div className="bg-[#121212] p-6 lg:p-8 rounded-[32px] border border-zinc-800 group hover:border-zinc-700 transition-all md:col-span-2 xl:col-span-3">
                                <div className="flex justify-between items-center flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${isMaintenanceOn ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                            {/* Gear icon */}
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Maintenance Mode</span>
                                            <p className={`text-lg font-bold mt-1 ${isMaintenanceOn ? 'text-amber-400' : 'text-zinc-400'}`}>
                                                {isMaintenanceOn ? '🟡 ENABLED — Non-admin users are blocked' : '🟢 DISABLED — All users can access the app'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        {/* Turn Maintenance ON button */}
                                        <button
                                            onClick={() => handleToggle(true)}
                                            disabled={isToggling || isMaintenanceOn}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${isMaintenanceOn
                                                ? 'bg-amber-500/20 text-amber-400 cursor-not-allowed'
                                                : 'bg-amber-500 text-black hover:bg-amber-400 cursor-pointer'
                                                }`}
                                        >
                                            {isToggling ? '...' : 'Turn ON'}
                                        </button>
                                        {/* Turn Maintenance OFF button */}
                                        <button
                                            onClick={() => handleToggle(false)}
                                            disabled={isToggling || !isMaintenanceOn}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${!isMaintenanceOn
                                                ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                                : 'bg-green-500 text-black hover:bg-green-400 cursor-pointer'
                                                }`}
                                        >
                                            {isToggling ? '...' : 'Turn OFF'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Total Users */}
                            <div className="bg-[#121212] p-6 lg:p-8 rounded-[32px] border border-zinc-800 group hover:border-zinc-700 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                        <Icons.Users />
                                    </div>
                                    <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Total Users</span>
                                </div>
                                <p className="text-4xl lg:text-5xl font-black text-white tracking-tight">{stats?.totalUsers || 0}</p>
                                <p className="text-zinc-500 text-sm mt-2 font-medium">Registered accounts</p>
                            </div>

                            {/* Startups */}
                            <div className="bg-[#121212] p-6 lg:p-8 rounded-[32px] border border-zinc-800 group hover:border-zinc-700 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                                        <Icons.Rocket />
                                    </div>
                                    <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Startups</span>
                                </div>
                                <p className="text-4xl lg:text-5xl font-black text-white tracking-tight">{stats?.totalStartups || 0}</p>
                                <p className="text-zinc-500 text-sm mt-2 font-medium">Active ventures</p>
                            </div>

                            {/* Investors */}
                            <div className="bg-[#121212] p-6 lg:p-8 rounded-[32px] border border-zinc-800 group hover:border-zinc-700 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-green-500/10 rounded-2xl text-green-500">
                                        <Icons.Briefcase />
                                    </div>
                                    <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Investors</span>
                                </div>
                                <p className="text-4xl lg:text-5xl font-black text-white tracking-tight">{stats?.totalInvestors || 0}</p>
                                <p className="text-zinc-500 text-sm mt-2 font-medium">Capital partners</p>
                            </div>

                            {/* Total Posts */}
                            <div className="bg-[#121212] p-6 lg:p-8 rounded-[32px] border border-zinc-800 group hover:border-zinc-700 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-zinc-800 rounded-2xl text-white">
                                        <Icons.Document />
                                    </div>
                                    <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Feed Activity</span>
                                </div>
                                <p className="text-4xl lg:text-5xl font-black text-white tracking-tight">{stats?.totalPosts || 0}</p>
                                <p className="text-zinc-500 text-sm mt-2 font-medium">Total posts shared</p>
                            </div>

                            {/* Total Pitches */}
                            <div className="bg-[#121212] p-6 lg:p-8 rounded-[32px] border border-zinc-800 group hover:border-zinc-700 transition-all">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-500">
                                        <Icons.Trending />
                                    </div>
                                    <span className="text-zinc-500 text-xs font-black uppercase tracking-widest">Pitch Flow</span>
                                </div>
                                <p className="text-4xl lg:text-5xl font-black text-white tracking-tight">{stats?.totalPitches || 0}</p>
                                <p className="text-zinc-500 text-sm mt-2 font-medium">Proposals sent</p>
                            </div>

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}