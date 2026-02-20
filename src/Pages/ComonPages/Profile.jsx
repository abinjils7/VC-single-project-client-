/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser, logOut } from "../../features/auth/authSlice";
import { useGetUserQuery, useUpdateUserMutation, useDeleteUserMutation } from "../../features/user/userApislice";
import { apiSlice } from "../../store/apiSlice";
import Sidebar from "../../Components/Sidebar";
import {
  useGetPostsQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useAddCommentMutation,
  useDeletePostMutation,
} from "../../features/posts/postsApiSlice";
import { toast } from "sonner";
import SubscriptionPopup from "../../Components/SubscriptionPopup";
import MobileNav from "../../Components/MobileNav";

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    data: userData,
    isLoading: loadingUser,
    refetch: refetchUser,
  } = useGetUserQuery();

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [addComment] = useAddCommentMutation();
  const [deletePost] = useDeletePostMutation();
  const [deleteUserApi] = useDeleteUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const currentUser = userData || user;
  const isInvestor = currentUser?.role === "investor";
  const isStartup = currentUser?.role === "startup";
  const userId = currentUser?._id || currentUser?.user?._id || currentUser?.id;

  const {
    data: postsData = [],
    isLoading: loadingPosts,
    refetch: refetchPosts,
  } = useGetPostsQuery({ userId: userId }, { skip: !userId });

  const posts = postsData.map((post) => ({
    id: post._id,
    postId: post.postId,
    authorId: post.authorId,
    authorName: post.authorId.name || "testuser",
    authorRole: post.authorId.role,
    content: post.content,
    postImage: post.postImage,
    timestamp: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "",
    comments: (post.comments || []).map((c) => ({
      userId: c.userId?._id || c.userId,
      userName: c.userId?.name,
      content: c.subject,
      timestamp: c.createdAt,
    })),
    likesCount: post.likes ? post.likes.length : 0,
    isLiked: post.likes?.includes(userId),
    commentsCount: post.commentsCount || (post.comments ? post.comments.length : 0),
  }));

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: "",
    description: "",
    email: "",
    category1: "",
    category2: "",
    stage: "",
    tokenValue: "",
  });

  useEffect(() => {
    if (currentUser) {
      setEditForm({
        displayName: currentUser.displayName || "",
        description: currentUser.description || "",
        email: currentUser.email || "",
        category1: currentUser.category1 || "",
        category2: currentUser.category2 || "",
        stage: currentUser.stage || "",
        tokenValue: currentUser.tokenValue || "",
      });
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    try {
      await updateUser(editForm).unwrap();
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      refetchUser();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error?.data?.message || "Failed to update profile.");
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      if (!userId) return;
      isLiked ? await unlikePost({ postId, userId }).unwrap() : await likePost({ postId, userId }).unwrap();
    } catch (e) { console.error(e); }
  };

  const handleCommentSubmit = async (postIdStr) => {
    const content = commentInputs[postIdStr];
    if (!content?.trim()) return;
    try {
      await addComment({ postId: postIdStr, userId, subject: content }).unwrap();
      setCommentInputs((prev) => ({ ...prev, [postIdStr]: "" }));
      refetchPosts();
    } catch (e) { console.error(e); }
  };

  const confirmDeletePost = async () => {
    if (postToDelete) {
      try {
        await deletePost(postToDelete).unwrap();
        toast.success("Post deleted");
        refetchPosts();
        setPostToDelete(null);
      } catch (e) { toast.error("Delete failed"); }
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteUserApi().unwrap();
      dispatch(logOut());
      dispatch(apiSlice.util.resetApiState());
      navigate("/");
      toast.success("Account deleted");
    } catch (e) { toast.error("Action failed"); }
  };

  const handleCommentChange = (postIdStr, value) => setCommentInputs(prev => ({ ...prev, [postIdStr]: value }));
  const toggleComments = (postId) => setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently";

  if (loadingUser) return <div className="h-screen bg-black flex items-center justify-center text-white font-black tracking-tighter text-3xl animate-pulse">VENTURE CAPITAL</div>;

  const xFonts = { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif' };

  return (
    <div className="min-h-screen bg-black text-[#e7e9ea] font-sans" style={xFonts}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-zinc-800">
        <div className="w-full px-4 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Venture Capital</h1>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden md:block text-xs font-black text-zinc-500 uppercase tracking-widest">{currentUser?.role}</p>
            <img src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} className="h-8 w-8 rounded-full border border-zinc-800" />
          </div>
        </div>
      </header>

      <div className="w-full flex pb-16 lg:pb-0">
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 h-[calc(100vh-62px)] sticky top-[62px] border-r border-zinc-800 p-4">
          <Sidebar showLogout={true} />
        </aside>

        {/* Mobile Navigation */}
        <MobileNav />

        {/* Main Content */}
        <main className="flex-1 max-w-full min-h-screen">
          {/* Profile Header Card */}
          <div className="relative group">
            <div className="h-32 lg:h-48 bg-gradient-to-r from-zinc-900 to-zinc-800 border-b border-zinc-800"></div>
            <div className="px-4 lg:px-8 pb-6 relative">
              <div className="absolute -top-12 lg:-top-16 left-4 lg:left-8">
                <img
                  src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`}
                  className="h-24 w-24 lg:h-32 lg:w-32 rounded-full border-4 border-black bg-black object-cover"
                />
              </div>
              <div className="pt-16 lg:pt-20 flex flex-col lg:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-black tracking-tight">{currentUser?.displayName || currentUser?.name}</h1>
                  <p className="text-zinc-500 font-medium mt-1 max-w-2xl text-sm lg:text-base">{currentUser?.description || "Join the venture movement."}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs lg:text-sm font-bold text-zinc-400">
                    <span className="text-[#1d9bf0]">@{currentUser?.name?.replace(/\s+/g, '').toLowerCase()}</span>
                    <span>Joined {formatDate(currentUser?.createdAt)}</span>
                  </div>
                </div>
                <button onClick={() => setIsEditing(!isEditing)} className="bg-white text-black px-6 py-2 rounded-full font-black text-xs lg:text-sm hover:bg-zinc-200 transition-all">
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>
            </div>
          </div>

          {/* Tabs - Seamless Design */}
          <div className="px-4 lg:px-8 mt-4 border-b border-zinc-800 overflow-x-auto scrollbar-hide">
            <nav className="flex gap-8 min-w-max">
              {['overview', 'details', 'account'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-xs lg:text-sm font-black uppercase tracking-widest transition-all ${activeTab === tab ? "text-white border-b-2 border-[#1d9bf0]" : "text-zinc-500 hover:text-white"}`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 lg:p-8">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {!isEditing && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-[#121212] p-4 lg:p-6 rounded-3xl border border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pitch Limit</p>
                      <p className="text-xl lg:text-2xl font-black mt-1">{currentUser?.pitchLimit || 0}</p>
                    </div>
                    {isInvestor && (
                      <div className="bg-[#121212] p-4 lg:p-6 rounded-3xl border border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Token Value</p>
                        <p className="text-xl lg:text-2xl font-black mt-1">{currentUser?.tokenValue || "N/A"}</p>
                      </div>
                    )}
                  </div>
                )}

                {isEditing ? (
                  <div className="bg-[#121212] p-4 lg:p-8 rounded-[32px] border border-zinc-800 space-y-6 max-w-4xl animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase">Display Name</label>
                        <input type="text" value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-[#1d9bf0] transition-all text-[#e7e9ea]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase">Email Address</label>
                        <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-[#1d9bf0] transition-all text-[#e7e9ea]" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 uppercase">Bio / Description</label>
                      <textarea rows="3" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-[#1d9bf0] transition-all resize-none text-[#e7e9ea]" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase">Category 1</label>
                        <input type="text" value={editForm.category1} onChange={(e) => setEditForm({ ...editForm, category1: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-[#1d9bf0] transition-all text-[#e7e9ea]" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase">Category 2</label>
                        <input type="text" value={editForm.category2} onChange={(e) => setEditForm({ ...editForm, category2: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-[#1d9bf0] transition-all text-[#e7e9ea]" />
                      </div>
                    </div>
                    {isStartup && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase">Stage</label>
                        <input type="text" value={editForm.stage} onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-[#1d9bf0] transition-all text-[#e7e9ea]" />
                      </div>
                    )}
                    {isInvestor && (
                      <div className="space-y-2">
                        <label className="text-xs font-black text-zinc-500 uppercase">Token Value</label>
                        <input type="text" value={editForm.tokenValue} onChange={(e) => setEditForm({ ...editForm, tokenValue: e.target.value })} className="w-full bg-black border border-zinc-800 p-3 rounded-xl outline-none focus:border-[#1d9bf0] transition-all text-[#e7e9ea]" />
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-4">
                      <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-full font-black text-sm border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all">Cancel</button>
                      <button onClick={handleSaveProfile} disabled={isUpdating} className="bg-[#1d9bf0] text-white px-8 py-2.5 rounded-full font-black text-sm shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2">
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h3 className="text-lg lg:text-xl font-black mb-6">Your Timeline</h3>
                    {posts.length === 0 ? (
                      <div className="bg-[#121212] rounded-[32px] p-20 text-center border border-zinc-800">
                        <p className="text-zinc-500 font-bold">No activity yet.</p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <article key={post.id} className="bg-[#121212] rounded-[32px] border border-zinc-800 overflow-hidden hover:bg-[#161616] transition-all">
                          <div className="p-4 lg:p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`} className="h-10 w-10 rounded-full" />
                              <div>
                                <h4 className="font-black text-sm">{post.authorName}</h4>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{post.timestamp}</p>
                              </div>
                            </div>
                            <button onClick={() => setPostToDelete(post.postId)} className="text-zinc-600 hover:text-red-500 transition-colors p-2">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                          <div className="px-4 lg:px-6 pb-4">
                            <p className="text-sm font-medium leading-relaxed text-zinc-300">{post.content}</p>
                            {post.postImage && <img src={`http://localhost:5000/${post.postImage}`} className="mt-4 rounded-2xl w-full object-cover max-h-[500px]" />}
                          </div>
                          <div className="px-4 lg:px-6 py-4 bg-black/40 flex gap-6 items-center border-t border-zinc-800/50">
                            <button onClick={() => handleLike(post.postId, post.isLiked)} className={`flex items-center gap-2 text-xs font-black transition-colors ${post.isLiked ? "text-red-500" : "text-zinc-500 hover:text-white"}`}>
                              <svg className="h-5 w-5" fill={post.isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                              {post.likesCount}
                            </button>
                            <button onClick={() => toggleComments(post.postId)} className="flex items-center gap-2 text-xs font-black text-zinc-500 hover:text-white">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                              {post.commentsCount}
                            </button>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Personal Information */}
                <div className="bg-[#121212] p-6 lg:p-8 rounded-[32px] border border-zinc-800 space-y-5">
                  <h4 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">Personal Information</h4>
                  <div className="space-y-4">
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Name</p><p className="font-bold">{currentUser?.name || "—"}</p></div>
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Display Name</p><p className="font-bold">{currentUser?.displayName || "—"}</p></div>
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Email</p><p className="font-bold break-all">{currentUser?.email || "—"}</p></div>
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Role</p><span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${currentUser?.role === "investor" ? "bg-blue-500/20 text-blue-400" : currentUser?.role === "admin" ? "bg-purple-500/20 text-purple-400" : "bg-green-500/20 text-green-400"}`}>{currentUser?.role}</span></div>
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Description</p><p className="font-medium text-zinc-300 text-sm leading-relaxed">{currentUser?.description || "—"}</p></div>
                  </div>
                </div>

                {/* Business Details */}
                <div className="bg-[#121212] p-6 lg:p-8 rounded-[32px] border border-zinc-800 space-y-5">
                  <h4 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">Business Details</h4>
                  <div className="space-y-4">
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Category 1</p><p className="font-bold">{currentUser?.category1 || "—"}</p></div>
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Category 2</p><p className="font-bold">{currentUser?.category2 || "—"}</p></div>
                    {currentUser?.role === "startup" && (
                      <div><p className="text-[10px] font-black text-zinc-600 uppercase">Stage</p><p className="font-bold">{currentUser?.stage || "—"}</p></div>
                    )}
                    {currentUser?.role === "investor" && (
                      <div><p className="text-[10px] font-black text-zinc-600 uppercase">Token Value</p><p className="font-bold">{currentUser?.tokenValue || "—"}</p></div>
                    )}
                  </div>
                </div>

                {/* Subscription & Account */}
                <div className="bg-[#121212] p-6 lg:p-8 rounded-[32px] border border-zinc-800 space-y-5">
                  <h4 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">Subscription</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black text-zinc-600 uppercase">Plan</p>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${currentUser?.isPremium ? "bg-yellow-500 text-black" : "bg-zinc-800 text-zinc-400"}`}>{currentUser?.isPremium ? "PREMIUM" : "BASIC"}</span>
                    </div>
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Pitch Limit</p><p className="font-bold text-xl">{currentUser?.pitchLimit || 0}</p></div>
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Subscription Expires</p><p className="font-bold">{currentUser?.subscriptionExpireDate ? new Date(currentUser.subscriptionExpireDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "No active subscription"}</p></div>
                    {!isInvestor && (
                      <button
                        onClick={() => setIsSubscriptionModalOpen(true)}
                        className="w-full mt-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Upgrade Plan
                      </button>
                    )}
                  </div>
                </div>

                <SubscriptionPopup
                  isOpen={isSubscriptionModalOpen}
                  onClose={() => setIsSubscriptionModalOpen(false)}
                />

                {/* System Info */}
                <div className="bg-[#121212] p-6 lg:p-8 rounded-[32px] border border-zinc-800 space-y-5">
                  <h4 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em]">System Info</h4>
                  <div className="space-y-4">
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">User ID</p><p className="font-mono text-xs text-zinc-400 break-all">{currentUser?._id}</p></div>
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Account Status</p><span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black ${currentUser?.isBlocked ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>{currentUser?.isBlocked ? "BLOCKED" : "ACTIVE"}</span></div>
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Joined</p><p className="font-bold">{formatDate(currentUser?.createdAt)}</p></div>
                    <div><p className="text-[10px] font-black text-zinc-600 uppercase">Last Updated</p><p className="font-bold">{formatDate(currentUser?.updatedAt)}</p></div>
                    {currentUser?.googleId && (
                      <div><p className="text-[10px] font-black text-zinc-600 uppercase">Google Account</p><span className="inline-block px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400">LINKED</span></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="max-w-2xl animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-red-500/5 p-6 lg:p-8 rounded-[32px] border border-red-500/20">
                  <h4 className="text-lg font-black text-red-500 mb-2">Danger Zone</h4>
                  <p className="text-zinc-500 text-sm mb-6">Once deleted, your venture data and connections are gone forever.</p>
                  <button onClick={() => setShowDeleteModal(true)} className="w-full bg-red-600/10 text-red-500 border border-red-500/20 py-4 rounded-2xl font-black text-sm hover:bg-red-600 hover:text-white transition-all">
                    Permanently Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals - Dark Themed */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/60 p-4">
          <div className="bg-[#121212] border border-zinc-800 rounded-[32px] p-6 lg:p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black mb-2">Confirm Deletion</h3>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">This action is permanent. All your data will be purged from the Venture Capital database.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 px-4 py-3 border border-zinc-800 rounded-xl font-bold hover:bg-zinc-800 transition-all">Cancel</button>
              <button onClick={handleDeleteAccount} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {postToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md bg-black/60">
          <div className="bg-[#121212] border border-zinc-800 rounded-[32px] p-6 lg:p-8 max-w-sm w-full shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-xl font-black mb-2">Delete Post?</h3>
            <p className="text-zinc-500 text-sm mb-8">This update will be removed from the feed forever.</p>
            <div className="flex gap-3">
              <button onClick={() => setPostToDelete(null)} className="flex-1 px-4 py-3 border border-zinc-800 rounded-xl font-bold hover:bg-zinc-800 transition-all">Stay</button>
              <button onClick={confirmDeletePost} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}