import { useState } from "react";
import { useSelector } from "react-redux";
import { useCreatePitchMutation } from "../features/pitch/pitchApiSlice";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useGetUserQuery } from "../features/user/userApislice";

import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useFormik } from "formik";
import { pitchSchema } from "../Utils/validationSchemas";

export default function PitchModal({ isOpen, onClose, investorId, postId, onSuccess }) {
    const [createPitch, { isLoading }] = useCreatePitchMutation();
    const [videoFile, setVideoFile] = useState(null);

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

    const formik = useFormik({
        initialValues: {
            message: "",
        },
        validationSchema: pitchSchema,
        onSubmit: async (values) => {
            if (!videoFile) {
                toast.error("Please provide a video.");
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
            formData.append("message", values.message);
            formData.append("video", videoFile);
            if (postId) {
                formData.append("postId", postId);
            }

            try {
                await createPitch(formData).unwrap();
                toast.success("Pitch sent successfully!");
                formik.resetForm();
                setVideoFile(null);
                onClose();
                if (onSuccess) onSuccess(investorId);
            } catch (error) {
                console.error("Failed to send pitch:", error);
                if (error?.status === 403 || error?.data?.message?.includes("limit exceeded")) {
                    toast.error("Pitch limit exceeded! Please upgrade your plan.");
                    setShowUpgrade(true);
                } else {
                    toast.error(error?.data?.message || "Failed to send pitch. Please try again.");
                }
            }
        },
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-md">
            <div className="bg-[#121212] rounded-2xl shadow-2xl w-full max-w-2xl p-8 m-4 border border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Send Pitch</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Pitch Description
                        </label>
                        <textarea
                            name="message"
                            value={formik.values.message}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`w-full p-4 bg-zinc-900 border ${formik.touched.message && formik.errors.message ? "border-red-500" : "border-zinc-700"} rounded-xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-white/20 focus:border-zinc-500 h-32 resize-none outline-none transition-all`}
                            placeholder="Describe your startup idea..."
                        />
                        {formik.touched.message && formik.errors.message && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.message}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Pitch Video
                        </label>
                        <div className={`border-2 border-dashed ${!videoFile && formik.submitCount > 0 ? "border-red-500" : "border-zinc-700"} rounded-xl p-6 text-center hover:border-zinc-500 hover:bg-zinc-900/50 transition-all`}>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="hidden"
                                id="video-upload"
                            />
                            <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center">
                                <svg className="h-10 w-10 text-zinc-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-white font-medium">
                                    {videoFile ? videoFile.name : "Upload a video"}
                                </span>
                                <span className="text-xs text-zinc-500 mt-1">
                                    Drag and drop or click to upload
                                </span>
                            </label>
                        </div>
                        {!videoFile && formik.submitCount > 0 && <div className="text-red-500 text-xs mt-1">Video is required</div>}
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
                                className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 mr-2 text-black" fill="none" viewBox="0 0 24 24">
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
