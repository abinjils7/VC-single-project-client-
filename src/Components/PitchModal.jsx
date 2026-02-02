import { useState } from "react";
import { useSelector } from "react-redux";
import { useCreatePitchMutation } from "../features/pitch/pitchApiSlice";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useGetUserQuery } from "../features/user/userApislice";

import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function PitchModal({ isOpen, onClose, investorId, postId, onSuccess }) {
    const [message, setMessage] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [createPitch, { isLoading }] = useCreatePitchMutation();

    const user = useSelector(selectCurrentUser);
    const { data: userData } = useGetUserQuery();
    const currentUser = userData || user;

    const navigate = useNavigate();
    const [showUpgrade, setShowUpgrade] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setVideoFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!videoFile || !message) {
            toast.error("Please provide both a video and a message.");
            return;
        }

        const userId = currentUser?._id || currentUser?.user?._id || currentUser?.id;
        if (!userId) {
            toast.error("Please log in to send a pitch.");
            return;
        }

        const formData = new FormData();
        formData.append("fromUserId", userId);
        formData.append("toUserId", investorId);
        formData.append("message", message);
        formData.append("video", videoFile);
        if (postId) {
            formData.append("postId", postId);
        }

        try {
            await createPitch(formData).unwrap();
            toast.success("Pitch sent successfully!");
            onClose();
            if (onSuccess) onSuccess(investorId);
            setMessage("");
            setVideoFile(null);
        } catch (error) {
            console.error("Failed to send pitch:", error);
            if (error?.status === 403 || error?.data?.message?.includes("limit exceeded")) {
                toast.error("Pitch limit exceeded! Please upgrade your plan.");
                setShowUpgrade(true);
            } else {
                toast.error(error?.data?.message || "Failed to send pitch. Please try again.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Send Pitch</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pitch Description
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32 resize-none"
                            placeholder="Describe your startup idea..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pitch Video
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="video-upload"
                            />
                            <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                                <svg className="h-10 w-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-blue-600 font-medium hover:text-blue-700">
                                    {videoFile ? videoFile.name : "Upload a video"}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Drag and drop or click to upload
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-2">
                        {showUpgrade ? (
                            <button
                                type="button"
                                onClick={() => navigate("/subscribe")}
                                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all transform hover:scale-[1.02] shadow-md flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Upgrade Plan to Continue
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Sending...
                                    </>
                                ) : (
                                    "Send Pitch"
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
