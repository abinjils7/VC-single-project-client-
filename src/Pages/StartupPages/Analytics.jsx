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
    const currentUser = userData || user;

    const { data: pitches = [], isLoading, error } = useGetStartupPitchesQuery(
        currentUser?._id || currentUser?.user?._id || currentUser?.id,
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
                    "rgba(75, 192, 192, 0.6)",
                    "rgba(255, 99, 132, 0.6)",
                    "rgba(255, 206, 86, 0.6)",
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(255, 206, 86, 1)",
                ],
                borderWidth: 1,
            },
        ],
    };

    if (isLoading) return <div className="p-8 text-center">Loading analytics...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load analytics</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Pitch Analytics</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Pitches</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{totalPitches}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-green-600 text-sm font-medium uppercase">Accepted</h3>
                        <p className="text-3xl font-bold text-green-700 mt-2">{accepted}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-yellow-600 text-sm font-medium uppercase">Pending</h3>
                        <p className="text-3xl font-bold text-yellow-700 mt-2">{pending}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-blue-600 text-sm font-medium uppercase">Acceptance Rate</h3>
                        <p className="text-3xl font-bold text-blue-700 mt-2">{acceptanceRate}%</p>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-4">Pitch Status Distribution</h3>
                        <div className="w-64 h-64">
                            <Doughnut data={statusData} />
                        </div>
                    </div>
                    {/* Detailed List */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                        <div className="overflow-y-auto max-h-80">
                            {pitches.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No pitches sent yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {pitches.map(pitch => (
                                        <div key={pitch._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b last:border-0 border-gray-100">
                                            <div className="flex items-center space-x-3">
                                                <div className={`h-2 w-2 rounded-full ${pitch.status === 'accepted' ? 'bg-green-500' :
                                                    pitch.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                                    }`}></div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {pitch.toUserId?.displayName || pitch.toUserId?.name || "Unknown Investor"}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(pitch.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase ${pitch.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                pitch.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {pitch.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
