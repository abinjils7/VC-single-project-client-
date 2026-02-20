import { useState } from "react";
import {
    useGetReportsQuery,
    useDismissReportMutation,
    useActionReportMutation
} from "../../features/admin/adminApiSlice";
import { toast } from "sonner";
import AdminSidebar from "../../Components/AdminSidebar";

export default function Reports() {
    const { data: reports = [], isLoading } = useGetReportsQuery();
    const [dismissReport] = useDismissReportMutation();
    const [actionReport] = useActionReportMutation();
    const [selectedReport, setSelectedReport] = useState(null);

    const handleDismiss = async (reportId) => {
        try {
            await dismissReport(reportId).unwrap();
            toast.success("Report dismissed successfully");
        } catch (error) {
            toast.error("Failed to dismiss report");
        }
    };

    const handleAction = async (reportId, banUser = false) => {
        try {
            await actionReport({ reportId, banUser }).unwrap();
            toast.success(banUser ? "Post deleted and user banned" : "Post deleted successfully");
        } catch (error) {
            toast.error("Failed to take action");
        }
    };

    const xFonts = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif' };

    if (isLoading) return <div className="h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="flex min-h-screen bg-black text-[#e7e9ea] font-sans" style={xFonts}>
            <aside className="hidden lg:block w-72 h-screen sticky top-0 border-r border-zinc-800 p-4">
                <AdminSidebar />
            </aside>

            <main className="flex-1 p-8 lg:p-12">
                <header className="mb-12 border-b border-zinc-800 pb-8">
                    <h1 className="text-4xl font-black text-white tracking-tight">Reports</h1>
                    <p className="text-zinc-500 mt-2 font-medium text-lg">Manage content flags and user safety.</p>
                </header>

                <div className="bg-[#121212] rounded-[32px] border border-zinc-800 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-black border-b border-zinc-800">
                            <tr>
                                <th className="px-8 py-6 text-left text-xs font-black text-zinc-500 uppercase tracking-widest">Reporter</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-zinc-500 uppercase tracking-widest">Reason</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-zinc-500 uppercase tracking-widest">Target</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-zinc-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-6 text-left text-xs font-black text-zinc-500 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-6 text-right text-xs font-black text-zinc-500 uppercase tracking-widest">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center text-zinc-500 font-bold">No active reports found.</td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report._id} className="group hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={report.reporterId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${report.reporterId?.name || "User"}`}
                                                    className="h-8 w-8 rounded-full border border-zinc-700"
                                                />
                                                <div>
                                                    <p className="font-bold text-sm text-white">{report.reporterId?.name}</p>
                                                    <p className="text-xs text-zinc-500">{report.reporterId?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-white mb-1">{report.reason}</p>
                                            <p className="text-xs text-zinc-500 truncate max-w-[200px]">{report.description}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
                                                    {report.postObjectId?.authorId?.name?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-white">{report.postObjectId?.authorId?.name || "Unknown"}</p>
                                                    <p className="text-xs text-zinc-500">Post Author</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${report.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                                                report.status === 'dismissed' ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' :
                                                    'bg-green-500/10 text-green-500 border border-green-500/20'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-zinc-400">
                                            {new Date(report.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            {report.status === 'pending' ? (
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="px-4 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-zinc-200 transition-all"
                                                >
                                                    Review
                                                </button>
                                            ) : (
                                                <span className="text-zinc-600 text-xs font-bold uppercase">Closed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modal - Dark Theme */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#121212] border border-zinc-800 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center bg-black">
                            <h2 className="text-xl font-black text-white">Review Report</h2>
                            <button onClick={() => setSelectedReport(null)} className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8">

                            {/* Alert Box */}
                            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                                <h3 className="font-bold text-red-500 mb-4 flex items-center gap-2">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Report Details
                                </h3>
                                <div className="space-y-2 text-sm text-red-200/80">
                                    <p><span className="text-red-400 font-bold uppercase text-xs tracking-wider mr-2">Reason:</span> {selectedReport.reason}</p>
                                    <p><span className="text-red-400 font-bold uppercase text-xs tracking-wider mr-2">Description:</span> {selectedReport.description || "None"}</p>
                                    <p><span className="text-red-400 font-bold uppercase text-xs tracking-wider mr-2">Reporter:</span> {selectedReport.reporterId?.name}</p>
                                </div>
                            </div>

                            {/* Reported Content Preview */}
                            <div>
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Original Content</h3>
                                <div className="border border-zinc-800 bg-black rounded-2xl p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <img src={selectedReport.postObjectId?.authorId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedReport.postObjectId?.authorId?.name}`} className="h-10 w-10 rounded-full" />
                                        <div>
                                            <p className="font-bold text-white">{selectedReport.postObjectId?.authorId?.name}</p>
                                            <p className="text-xs text-zinc-500">{new Date(selectedReport.postObjectId?.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed mb-4">{selectedReport.postObjectId?.content}</p>
                                    {selectedReport.postObjectId?.postImage && (
                                        <div className="rounded-xl overflow-hidden border border-zinc-800">
                                            <img src={`http://localhost:5000/${selectedReport.postObjectId.postImage}`} className="w-full h-auto max-h-[400px] object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="p-6 border-t border-zinc-800 bg-black flex justify-end gap-3">
                            <button
                                onClick={() => { handleDismiss(selectedReport._id); setSelectedReport(null); }}
                                className="px-6 py-3 border border-zinc-800 text-white rounded-full font-bold text-sm hover:bg-zinc-900 transition-all"
                            >
                                Dismiss Report
                            </button>
                            <button
                                onClick={() => { handleAction(selectedReport._id, false); setSelectedReport(null); }}
                                className="px-6 py-3 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20"
                            >
                                Delete Post
                            </button>
                            <button
                                onClick={() => { if (window.confirm('Ban user?')) { handleAction(selectedReport._id, true); setSelectedReport(null); } }}
                                className="px-6 py-3 bg-[#121212] border border-red-900/50 text-red-500 rounded-full font-bold text-sm hover:bg-red-950/30 transition-all"
                            >
                                Ban User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}