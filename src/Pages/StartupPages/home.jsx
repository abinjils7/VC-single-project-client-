/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useAddCommentMutation,
} from "../../features/posts/postsApiSlice";
import { useGetStartupPitchesQuery } from "../../features/pitch/pitchApiSlice";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useGetUserQuery } from "../../features/user/userApislice";
import PitchModal from "../../Components/PitchModal";
import ReportModal from "../../Components/ReportModal";
import NotificationBell from "../../Components/NotificationBell";
import Sidebar from "../../Components/Sidebar";
import SubscriptionPopup from "../../Components/SubscriptionPopup";
import MobileNav from "../../Components/MobileNav";

import { toast } from "sonner";

export default function HomePage() {
  const user = useSelector(selectCurrentUser);
  const { data: userData } = useGetUserQuery();
  const currentUser = userData || user;

  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const {
    data: newPosts, // Remove default value to prevent reference instability loop
    isLoading: loadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useGetPostsQuery({ role: currentUser?.role, page, limit: 3 });

  useEffect(() => {
    if (postsError) {
      console.error("Error fetching posts:", postsError);
      if (postsError.status === 401) {
        toast.error("Session expired. Please log in again.");
      }
    }

    if (newPosts) {
      if (newPosts.length < 3) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (page === 1) {
        setAllPosts(newPosts);
      } else {
        setAllPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p._id));
          const distinctPosts = newPosts.filter((p) => !existingIds.has(p._id));
          return [...prev, ...distinctPosts];
        });
      }
    }
  }, [newPosts, page, postsError]);


  const [createPost, { isLoading: isCreatingPost, error: createPostError }] =
    useCreatePostMutation();

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [addComment] = useAddCommentMutation();

  // const [visibleCount, setVisibleCount] = useState(4); // Removed old client-side pagination
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [postToReport, setPostToReport] = useState(null);
  const [selectedInvestorId, setSelectedInvestorId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);


  const [pitchedPostIds, setPitchedPostIds] = useState([]);

  const { data: startupPitches = [] } = useGetStartupPitchesQuery(
    currentUser?._id || currentUser?.user?._id || currentUser?.id,
    {
      skip: !currentUser || currentUser.role !== "startup",
    },
  );

  useEffect(() => {
    if (startupPitches.length > 0) {
      const pitchedPosts = startupPitches
        .map((pitch) => pitch.postId)
        .filter((id) => id !== undefined && id !== null);
      setPitchedPostIds(pitchedPosts);
    }
  }, [startupPitches]);

  const navigate = useNavigate();

  const posts = allPosts.map((post) => ({
    id: post._id,
    postId: post.postId,
    authorId: post.authorId,
    authorName: post.authorId.name || "testuser",
    authorRole: post.authorId.role,
    content: post.content,
    postImage: post.postImage,
    timestamp: post.createdAt
      ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      })
      : "",
    comments: (post.comments || []).map((c) => ({
      userId: c.userId?._id || c.userId,
      userName: c.userId?.name,
      content: c.subject,
      timestamp: c.createdAt,
    })),
    likesCount: post.likes ? post.likes.length : 0,
    isLiked: post.likes?.includes(
      currentUser?._id || currentUser?.user?._id || currentUser?.id,
    ),
    commentsCount:
      post.commentsCount || (post.comments ? post.comments.length : 0),
  }));

  const isLoading = page === 1 && loadingPosts; // Only show full screen loader for initial load

  // State for post creation (matching reference)
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // Existing state
  // const [imagePreview, setImagePreview] = useState(null); // Already initialized above at line 84

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) {
      toast.error("Please add some content or an image");
      return;
    }

    try {
      const authorId = currentUser?._id || currentUser?.user?._id || currentUser?.id;

      if (!authorId) {
        console.error("Missing authorId. User state:", currentUser);
        toast.error("User session invalid. Please log in again.");
        return;
      }

      const genUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };

      const formData = new FormData();
      formData.append("authorId", authorId);
      formData.append("postId", genUUID());
      formData.append("content", newPostContent.trim());
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await createPost(formData).unwrap();
      toast.success("Post shared!");

      // Reset state
      setNewPostContent("");
      handleRemoveImage();

      // Reset to page 1 to see new post
      setPage(1);
      if (page === 1) {
        refetchPosts();
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error(error?.data?.message || error?.message || "Failed to create post.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleCreatePost();
    }
  };

  // ... (render logic)

  const isInvestor = currentUser?.role === "investor";
  const xFontStyle = { fontFamily: 'TwitterChirp, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

  return (
    <div className="min-h-screen bg-black text-[#e7e9ea]" style={xFontStyle}>
      {/* Header - (No changes) */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="w-full px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black tracking-tighter uppercase" style={{ fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif", letterSpacing: '-0.02em' }}>Venture Capital</h1>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="cursor-pointer" onClick={() => navigate("/profile")}>
              <img
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
                className="h-8 w-8 rounded-full object-cover border border-zinc-800"
                alt="Profile"
              />
            </div>
          </div>
        </div>
      </header>


      <div className="w-full flex pb-16 lg:pb-0">
        {/* Sidebar - Hidden on mobile, visible on lg screens */}
        <aside className="hidden lg:block w-64 h-[calc(100vh-50px)] sticky top-[50px] p-4 flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Mobile Navigation - Visible only on mobile */}
        <MobileNav />

        {/* Main Feed */}
        <main className="flex-1 max-w-full min-h-screen">
          {/* Feed Header */}
          <div className="relative z-0 px-4 md:px-8 pt-6 md:pt-10 pb-6">
            <div className="absolute top-0 left-0 right-0 h-64 bg-purple-900/20 blur-[120px] -z-10 rounded-b-[50px] pointer-events-none" />
            <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Explore Feed</h1>
            <p className="text-[#8899a6] text-base md:text-lg max-w-2xl">
              Discover startup updates, collaboration opportunities, and pitches from founders and investors.
            </p>
          </div>

          {/* Compose Post - Rounded Card */}
          <section className="relative z-10 mx-4 md:mx-8 mb-8 p-4 md:p-6 bg-[#000000] border border-zinc-800/60 rounded-[32px] shadow-lg shadow-purple-900/5 hover:border-zinc-700/80 transition-all">
            <div className="flex gap-4">
              <img
                src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
                className="h-10 w-10 rounded-full shrink-0"
              />
              <div className="flex-1">
                {/* Replaced Formik form with direct inputs */}
                <div>
                  <textarea
                    placeholder={isInvestor ? "Post investment requirements..." : "Share startup updates..."}
                    className="w-full bg-transparent text-base md:text-lg font-medium placeholder-[#71767b] outline-none resize-none pt-1"
                    rows="2"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isCreatingPost}
                  />

                  {imagePreview && (
                    <div className="relative mt-2 rounded-[24px] overflow-hidden border border-zinc-800">
                      <img src={imagePreview} className="w-full object-cover max-h-[350px]" />
                      <button type="button" onClick={handleRemoveImage} className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full hover:bg-black transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3">
                    <label className="p-1.5 hover:bg-[#1d9bf0]/10 rounded-full cursor-pointer text-[#1d9bf0]">
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileAttach} disabled={isCreatingPost} />
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5.5C3 4.119 4.119 3 5.5 3h13C19.881 3 21 4.119 21 5.5v13c0 1.381-1.119 2.5-2.5 2.5h-13C4.119 21 3 19.881 3 18.5v-13zM5.5 5c-.276 0-.5.224-.5.5v9.086l3-3 3 3 5-5 3 3V5.5c0-.276-.224-.5-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-3.086zM9.75 7C8.784 7 8 7.784 8 8.75s.784 1.75 1.75 1.75 1.75-.784 1.75-1.75S10.716 7 9.75 7z" /></svg>
                    </label>
                    <button
                      onClick={handleCreatePost}
                      disabled={isCreatingPost || (!newPostContent.trim() && !selectedImage)}
                      className="px-6 py-1.5 bg-[#1d9bf0] hover:bg-[#1a8cd8] text-white rounded-full font-bold text-sm transition-all disabled:opacity-50"
                    >
                      {isCreatingPost ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feed - RESTORED POST BORDERS */}
          <div className="py-4 px-4 md:px-8 space-y-6">
            {posts.length === 0 ? (
              <div className="p-6 text-center text-[#71767b] text-sm italic">No updates yet.</div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className="p-4 md:p-8 bg-[#080808]/40 border border-zinc-800 rounded-[32px] hover:bg-[#080808] transition-all cursor-pointer">
                  <div className="flex gap-4">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`}
                      className="h-10 w-10 rounded-full shrink-0 border border-zinc-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="font-bold text-[15px] hover:underline truncate text-[#e7e9ea]">{post.authorName}</span>
                          {post.authorRole === "admin" && (
                            <svg viewBox="0 0 22 22" className="w-[18px] h-[18px] shrink-0" fill="#1d9bf0"><path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.607-.274 1.264-.144 1.897.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" /></svg>
                          )}
                          <span className="text-[#71767b] text-xs shrink-0">· {post.timestamp}</span>
                        </div>
                        {post.authorRole === "investor" && (
                          <div className="flex gap-2 shrink-0">
                            {pitchedPostIds.includes(post.id) ? (
                              <span className="text-[#00ba7c] text-[11px] font-bold px-3 py-0.5 border border-[#00ba7c]/30 rounded-full uppercase">Pitched</span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedInvestorId(post.authorId._id || post.authorId);
                                  setSelectedPostId(post.id);
                                  setIsPitchModalOpen(true);
                                }}
                                className="bg-[#eff3f4] text-black text-[12px] font-bold px-4 py-1 rounded-full hover:bg-[#d7dbdc] transition-colors"
                              >
                                Pitch
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <p className="text-[14px] font-normal leading-snug mt-1 mb-3 text-[#e7e9ea] whitespace-pre-line">{post.content}</p>

                      {post.postImage && (
                        <div className="mt-2 rounded-[24px] overflow-hidden border border-zinc-800 bg-[#121212]">
                          <img src={`http://localhost:5000/${post.postImage}`} className="w-full h-auto object-cover max-h-[500px]" alt="Post" />
                        </div>
                      )}

                      {/* Interaction Bar */}
                      <div className="flex items-center justify-between w-full max-w-2xl mt-4 text-[#71767b]">
                        <button onClick={() => toggleComments(post.postId)} className="group flex items-center gap-2 hover:text-[#1d9bf0] transition-colors">
                          <div className="p-1.5 group-hover:bg-[#1d9bf0]/10 rounded-full transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          </div>
                          <span className="text-xs">{post.commentsCount}</span>
                        </button>
                        <button onClick={() => handleLike(post.postId, post.isLiked)} className={`group flex items-center gap-2 transition-colors ${post.isLiked ? "text-[#f91880]" : "hover:text-[#f91880]"}`}>
                          <div className={`p-1.5 group-hover:bg-[#f91880]/10 rounded-full transition-all`}>
                            <svg className="w-4 h-4" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                          </div>
                          <span className="text-xs">{post.likesCount}</span>
                        </button>
                        <button onClick={() => { setPostToReport(post.postId); setIsReportModalOpen(true); }} className="p-1.5 hover:bg-zinc-800 rounded-full transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </button>
                      </div>

                      {expandedComments[post.postId] && (
                        <div className="mt-4 pt-4 border-t border-zinc-800 space-y-4">
                          {post.comments.map((comment, index) => (
                            <div key={index} className="flex gap-3 items-start">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`} className="h-7 w-7 rounded-full shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-[#e7e9ea]">{comment.userName || "User"} <span className="font-normal text-[#71767b] text-xs">· {new Date(comment.timestamp).toLocaleDateString()}</span></p>
                                <p className="text-[13px] font-normal text-[#e7e9ea] leading-normal">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                          <div className="flex gap-3 mt-4 items-center bg-[#121212]/50 p-4 rounded-3xl border border-zinc-800">
                            <input
                              type="text"
                              placeholder="Reply..."
                              className="w-full bg-transparent py-1 text-sm outline-none focus:border-b focus:border-[#1d9bf0] transition-all"
                              value={commentInputs[post.postId] || ""}
                              onChange={(e) => handleCommentChange(post.postId, e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit(post.postId)}
                            />
                            <button onClick={() => handleCommentSubmit(post.postId)} className="text-[#1d9bf0] font-bold text-xs px-2">Reply</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}

            {hasMore ? (
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loadingPosts}
                className="w-full py-6 text-[#1d9bf0] text-sm hover:text-[#1a8cd8] transition-all font-bold border-t border-zinc-800 disabled:opacity-50"
              >
                {loadingPosts ? "Loading..." : "Show more"}
              </button>
            ) : (
              <div className="p-6 text-center text-[#71767b] text-sm italic">All posts loaded</div>
            )}
          </div>
        </main>
      </div>

      <ReportModal isOpen={isReportModalOpen} onClose={() => { setIsReportModalOpen(false); setPostToReport(null); }} postId={postToReport} />
      <PitchModal isOpen={isPitchModalOpen} onClose={() => setIsPitchModalOpen(false)} investorId={selectedInvestorId} postId={selectedPostId} onSuccess={() => selectedPostId && setPitchedPostIds((prev) => [...prev, selectedPostId])} />
      {/* Subscription Popup - uncontrolled mode (auto-check) */}
      <SubscriptionPopup />
    </div >
  );
}