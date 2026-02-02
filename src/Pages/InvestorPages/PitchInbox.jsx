import { useSelector } from "react-redux";
import { useGetPitchesForInvestorQuery, useUpdatePitchStatusMutation } from "../../features/pitch/pitchApiSlice";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetUserQuery } from "../../features/user/userApislice";
import { toast } from "react-hot-toast";

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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading inbox...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-500">Failed to load pitches.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Pitch Inbox</h1>

                {pitches.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-500">
                        No pitches received yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pitches.map((pitch) => (
                            <div key={pitch._id} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col">
                                {/* Video Player PREVIEW */}
                                <div className="aspect-video bg-black relative">
                                    <video
                                        src={`http://localhost:5000/${pitch.pitchVideoUrl}`}
                                        controls
                                        className="w-full h-full object-cover"
                                    />
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase text-white ${pitch.status === 'accepted' ? 'bg-green-500' :
                                            pitch.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                                        }`}>
                                        {pitch.status}
                                    </div>
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    {/* Startup Info */}
                                    <div className="flex items-center space-x-3 mb-4">
                                        <img
                                            src={pitch.fromUserId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pitch.fromUserId?.name || "unknown"}`}
                                            alt={pitch.fromUserId?.name}
                                            className="h-10 w-10 rounded-full border border-gray-200"
                                        />
                                        <div>
                                            <h3 className="font-bold text-gray-900">{pitch.fromUserId?.displayName || pitch.fromUserId?.name || "Unknown Startup"}</h3>
                                            <p className="text-xs text-gray-500">{pitch.fromUserId?.stage} • {pitch.fromUserId?.category1}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm mb-6 flex-1">
                                        {pitch.message}
                                    </p>

                                    {/* Actions */}
                                    {pitch.status === 'pending' && (
                                        <div className="flex space-x-3 mt-auto">
                                            <button
                                                onClick={() => handleStatusUpdate(pitch._id, 'accepted')}
                                                disabled={isUpdating}
                                                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(pitch._id, 'rejected')}
                                                disabled={isUpdating}
                                                className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}

                                    {pitch.status !== 'pending' && (
                                        <div className={`text-center py-2 rounded-lg font-medium ${pitch.status === 'accepted' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                            }`}>
                                            Pitch {pitch.status}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
