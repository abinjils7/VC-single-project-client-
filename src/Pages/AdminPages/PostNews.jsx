import { useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import AdminSidebar from "../../Components/AdminSidebar";
import { useCreatePostMutation } from "../../features/posts/postsApiSlice";
import { toast } from "sonner";
import { useFormik } from "formik";
import { postNewsSchema } from "../../Utils/validationSchemas";

export default function PostNews() {
    const [createPost, { isLoading }] = useCreatePostMutation();
    const currentUser = useSelector(selectCurrentUser);
    const [imagePreview, setImagePreview] = useState(null);

    const xFonts = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif' };

    const formik = useFormik({
        initialValues: {
            content: "",
            image: null,
        },
        validationSchema: postNewsSchema,
        onSubmit: async (values) => {
            if (!values.content.trim() && !values.image) {
                toast.error("Please provide content or an image.");
                return;
            }
            try {
                const authorId = currentUser?._id || currentUser?.user?._id || currentUser?.id;
                const formData = new FormData();
                formData.append("authorId", authorId);
                formData.append("postId", crypto.randomUUID());
                formData.append("content", values.content);
                if (values.image) formData.append("image", values.image);

                await createPost(formData).unwrap();
                toast.success("News posted successfully!");
                formik.resetForm();
                setImagePreview(null);
            } catch (error) {
                console.error("Failed to post news:", error);
                toast.error(error?.data?.message || "Failed to post news.");
            }
        },
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            formik.setFieldValue("image", file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        formik.setFieldValue("image", null);
        setImagePreview(null);
    };

    return (
        <div className="flex min-h-screen bg-black text-[#e7e9ea] font-sans" style={xFonts}>
            <aside className="hidden lg:block w-72 h-screen sticky top-0 border-r border-zinc-800 p-4">
                <AdminSidebar />
            </aside>

            <main className="flex-1 p-8 lg:p-12">
                <header className="mb-12 border-b border-zinc-800 pb-8">
                    <h1 className="text-4xl font-black text-white tracking-tight">Post News</h1>
                    <p className="text-zinc-500 mt-2 font-medium text-lg">Publish announcements and platform updates.</p>
                </header>

                <div className="bg-[#121212] rounded-[32px] border border-zinc-800 p-8 max-w-3xl">
                    <form onSubmit={formik.handleSubmit}>
                        {/* Text Area */}
                        <div className="space-y-2 mb-6">
                            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Content</label>
                            <textarea
                                rows="6"
                                name="content"
                                value={formik.values.content}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                placeholder="Write your announcement or news update..."
                                className={`w-full bg-black border ${formik.touched.content && formik.errors.content ? "border-red-500" : "border-zinc-800"} p-4 rounded-2xl outline-none focus:border-[#1d9bf0] transition-all text-[#e7e9ea] text-base placeholder-zinc-600 resize-none`}
                            />
                            {formik.touched.content && formik.errors.content && (
                                <div className="text-red-500 text-xs mt-1">{formik.errors.content}</div>
                            )}
                        </div>

                        {/* Image Preview */}
                        {imagePreview && (
                            <div className="relative mb-6 rounded-2xl overflow-hidden border border-zinc-800">
                                <img src={imagePreview} className="w-full max-h-[400px] object-cover" alt="Preview" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-3 right-3 bg-black/70 p-2 rounded-full hover:bg-black transition-all"
                                >
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                            <label className="p-3 hover:bg-[#1d9bf0]/10 rounded-full cursor-pointer text-[#1d9bf0] transition-all">
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isLoading} />
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" />
                                </svg>
                            </label>
                            <button
                                type="submit"
                                disabled={isLoading || (!formik.values.content.trim() && !formik.values.image)}
                                className="px-8 py-3 bg-white text-black rounded-full font-black text-sm hover:bg-zinc-200 transition-all disabled:opacity-40 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Publishing...
                                    </>
                                ) : (
                                    "Publish News"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
