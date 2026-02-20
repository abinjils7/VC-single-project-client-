import React from "react";
import { useSelector } from "react-redux";
import { useGetStartupPitchesQuery } from "../../features/pitch/pitchApiSlice";
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
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function StartupAnalytics() {
    const user = useSelector(selectCurrentUser);
    const { data: userData } = useGetUserQuery();
    const currentUserRaw = userData || user;
    const currentUser = currentUserRaw?.user ? currentUserRaw.user : currentUserRaw;

    const { data: pitches = [], isLoading, error } = useGetStartupPitchesQuery(
        currentUser?._id || currentUser?.id,
        {
            skip: !currentUser || currentUser.role !== "startup",
        }
    );

    // Calculate stats
    const totalPitches = pitches.length;
    const accepted = pitches.filter((p) => p.status === "accepted").length;
    const rejected = pitches.filter((p) => p.status === "rejected").length;
    const pending = pitches.filter((p) => p.status === "pending").length;

    const acceptanceRate = totalPitches > 0 ? ((accepted / totalPitches) * 100).toFixed(1) : 0;

    // Chart Data
    const statusData = {
        labels: ["Accepted", "Rejected", "Pending"],
        datasets: [
            {
                label: "# of Pitches",
                data: [accepted, rejected, pending],
                backgroundColor: [
                    "rgba(75, 192, 192, 0.8)",
                    "rgba(255, 99, 132, 0.8)",
                    "rgba(255, 206, 86, 0.8)",
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(255, 206, 86, 1)",
                ],
                borderWidth: 1,
                borderRadius: 6,
            },
        ],
    };

    // SVG Icons
    const Icons = {
        CheckCircle: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        Clock: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        XCircle: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        TrendingUp: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        BarChart: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        Activity: () => (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        ),
        Download: () => (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
        )
    };

    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading analytics...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
            <div className="text-center text-red-500">
                <Icons.XCircle />
                <p className="text-lg mt-4">Failed to load analytics</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Pitch Analytics Dashboard</h1>
                            <p className="text-gray-600 mt-2">Track your pitch performance and investor engagement</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                                <p className="text-sm text-gray-500">Reporting Period</p>
                                <p className="font-semibold">Last 6 Months</p>
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Icons.Download />
                                <span>Export Report</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards with Icons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Pitches Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Pitches</p>
                                <p className="text-4xl font-bold text-gray-900 mt-2">{totalPitches}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <div className="text-blue-600">
                                    <Icons.BarChart />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-500">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">All time pitches sent</p>
                        </div>
                    </div>

                    {/* Accepted Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium">Accepted</p>
                                <p className="text-4xl font-bold text-green-700 mt-2">{accepted}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-xl">
                                <div className="text-green-600">
                                    <Icons.CheckCircle />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-500">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-green-600 h-1.5 rounded-full"
                                        style={{ width: `${totalPitches > 0 ? (accepted / totalPitches) * 100 : 0}%` }}>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Successful pitches</p>
                        </div>
                    </div>

                    {/* Pending Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-600 text-sm font-medium">Pending</p>
                                <p className="text-4xl font-bold text-yellow-700 mt-2">{pending}</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-xl">
                                <div className="text-yellow-600">
                                    <Icons.Clock />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-500">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-yellow-600 h-1.5 rounded-full"
                                        style={{ width: `${totalPitches > 0 ? (pending / totalPitches) * 100 : 0}%` }}>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Awaiting response</p>
                        </div>
                    </div>

                    {/* Acceptance Rate Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-sm font-medium">Acceptance Rate</p>
                                <p className="text-4xl font-bold text-blue-700 mt-2">{acceptanceRate}%</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <div className="text-blue-600">
                                    <Icons.TrendingUp />
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center text-sm text-gray-500">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className="bg-blue-600 h-1.5 rounded-full"
                                        style={{ width: `${acceptanceRate}%` }}>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Success ratio</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Donut Chart Section */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Pitch Status Distribution</h3>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm text-gray-600">Accepted</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full">
                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                    <span className="text-sm text-gray-600">Rejected</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full">
                                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                                    <span className="text-sm text-gray-600">Pending</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                            <div className="relative w-64 h-64">
                                <Doughnut
                                    data={statusData}
                                    options={{
                                        plugins: {
                                            legend: {
                                                display: false
                                            }
                                        },
                                        cutout: '65%'
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-gray-900">{totalPitches}</p>
                                        <p className="text-sm text-gray-500">Total</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="p-4 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <Icons.CheckCircle />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Accepted Pitches</p>
                                                <p className="text-2xl font-bold text-green-600 mt-1">{accepted}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Rate</p>
                                            <p className="text-lg font-semibold text-gray-900">{acceptanceRate}%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                                                <Icons.Clock />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Pending Review</p>
                                                <p className="text-2xl font-bold text-yellow-600 mt-1">{pending}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Awaiting</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {pending > 0 ? `${Math.round((pending / totalPitches) * 100)}%` : '0%'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border border-red-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                <Icons.XCircle />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Rejected Pitches</p>
                                                <p className="text-2xl font-bold text-red-600 mt-1">{rejected}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Rate</p>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {rejected > 0 ? `${Math.round((rejected / totalPitches) * 100)}%` : '0%'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Sidebar */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                                {pitches.length} Total
                            </span>
                        </div>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {pitches.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="inline-block p-3 bg-gray-100 rounded-full mb-4">
                                        <Icons.Activity />
                                    </div>
                                    <p className="text-gray-500">No pitches sent yet.</p>
                                    <p className="text-sm text-gray-400 mt-1">Start sending pitches to see activity here</p>
                                </div>
                            ) : (
                                pitches.map(pitch => (
                                    <div
                                        key={pitch._id}
                                        className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${pitch.status === 'accepted' ? 'bg-green-100' :
                                                    pitch.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                                                    }`}>
                                                    {pitch.status === 'accepted' ? (
                                                        <Icons.CheckCircle />
                                                    ) : pitch.status === 'rejected' ? (
                                                        <Icons.XCircle />
                                                    ) : (
                                                        <Icons.Clock />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {pitch.toUserId?.displayName || pitch.toUserId?.name || "Unknown Investor"}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(pitch.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pitch.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                pitch.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {pitch.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-600">Pitch sent</span>
                                            <span className="text-gray-900 font-medium">
                                                {new Date(pitch.createdAt).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Performance Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl shadow-lg border border-blue-100">
                        <h4 className="text-sm font-medium text-blue-600 mb-2">Best Month</h4>
                        <p className="text-2xl font-bold text-gray-900">March</p>
                        <p className="text-sm text-gray-600 mt-1">Highest pitch activity</p>
                        <div className="mt-4 flex items-center">
                            <div className="w-full bg-blue-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-blue-600">85%</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl shadow-lg border border-green-100">
                        <h4 className="text-sm font-medium text-green-600 mb-2">Avg Response Time</h4>
                        <p className="text-2xl font-bold text-gray-900">3.2 days</p>
                        <p className="text-sm text-gray-600 mt-1">From submission to response</p>
                        <div className="mt-4 flex items-center">
                            <div className="w-full bg-green-200 rounded-full h-2">
                                <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-green-600">Faster than 70%</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl shadow-lg border border-purple-100">
                        <h4 className="text-sm font-medium text-purple-600 mb-2">Top Investor Type</h4>
                        <p className="text-2xl font-bold text-gray-900">VC Firms</p>
                        <p className="text-sm text-gray-600 mt-1">Most engagement from</p>
                        <div className="mt-4 flex items-center">
                            <div className="w-full bg-purple-200 rounded-full h-2">
                                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                            <span className="ml-2 text-sm font-medium text-purple-600">92%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}