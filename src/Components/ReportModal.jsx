import { useReportPostMutation } from "../features/posts/postsApiSlice";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useGetUserQuery } from "../features/user/userApislice";
import { useFormik } from "formik";
import { reportSchema } from "../Utils/validationSchemas";

export default function ReportModal({ isOpen, onClose, postId }) {
    const [reportPost, { isLoading }] = useReportPostMutation();

    const user = useSelector(selectCurrentUser);
    const { data: userData } = useGetUserQuery();
    const currentUser = userData || user;

    const formik = useFormik({
        initialValues: {
            reason: "",
            description: "",
        },
        validationSchema: reportSchema,
        onSubmit: async (values) => {
            const userId = currentUser?._id || currentUser?.user?._id || currentUser?.id;
            if (!userId) {
                toast.error("Please log in to report a post.");
                return;
            }

            try {
                await reportPost({
                    postId,
                    reportData: {
                        reporterId: userId,
                        reason: values.reason,
                        description: values.description
                    }
                }).unwrap();
                toast.success("Report submitted successfully.");
                formik.resetForm();
                onClose();
            } catch (error) {
                console.error("Failed to submit report:", error);
                toast.error("Failed to submit report. Please try again.");
            }
        },
    });

    if (!isOpen) return null;

    const reasons = [
        "Spam",
        "Harassment or hate speech",
        "Violence or physical harm",
        "Nudity or sexual activity",
        "False information",
        "Scam or fraud",
        "Other"
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-white/20">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 m-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Report Post</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Why are you reporting this post?
                        </label>
                        <div className="space-y-2">
                            {reasons.map((r) => (
                                <label key={r} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="reason"
                                        value={r}
                                        checked={formik.values.reason === r}
                                        onChange={formik.handleChange}
                                        className="text-blue-600 focus:ring-blue-500 border-gray-300"
                                    />
                                    <span className="text-gray-700">{r}</span>
                                </label>
                            ))}
                        </div>
                        {formik.submitCount > 0 && formik.errors.reason && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.reason}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Details
                        </label>
                        <textarea
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className={`w-full p-2 border ${formik.touched.description && formik.errors.description ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none`}
                            placeholder="Provide more context..."
                        />
                        {formik.touched.description && formik.errors.description && (
                            <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {isLoading ? "Submitting..." : "Submit Report"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
