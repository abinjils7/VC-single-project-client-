/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser, logOut } from "../../features/auth/authSlice";
import { useGetUserQuery } from "../../features/user/userApislice";
import { apiSlice } from "../../store/apiSlice";
import Sidebar from "../../Components/Sidebar";
import {
  useGetPostsQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useAddCommentMutation,
} from "../../features/posts/postsApiSlice";

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const {
    data: userData,
    isLoading: loadingUser,
    refetch: refetchUser,
  } = useGetUserQuery();

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [addComment] = useAddCommentMutation();

  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  // Use userData from the API query
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
    timestamp: post.createdAt
      ? new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      })
      : "",
    comments: (post.comments || []).map(c => ({
      userId: c.userId?._id || c.userId,
      userName: c.userId?.name,
      content: c.subject,
      timestamp: c.createdAt
    })),
    likesCount: post.likes ? post.likes.length : 0,
    isLiked: post.likes?.includes(userId),
    commentsCount:
      post.commentsCount || (post.comments ? post.comments.length : 0),
  }));

  const handleLike = async (postId, isLiked) => {
    try {
      if (!userId) return;
      if (isLiked) {
        await unlikePost({ postId, userId }).unwrap();
      } else {
        await likePost({ postId, userId }).unwrap();
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleCommentSubmit = async (postIdStr) => {
    const content = commentInputs[postIdStr];
    if (!content?.trim()) return;

    try {
      if (!userId) return;
      await addComment({
        postId: postIdStr,
        userId,
        subject: content,
      }).unwrap();

      setCommentInputs((prev) => ({ ...prev, [postIdStr]: "" }));
      refetchPosts();
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleCommentChange = (postIdStr, value) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postIdStr]: value,
    }));
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    displayName: "",
    description: "",
    email: "",
    category1: "",
    category2: "",
    tokenValue: "",
  });



  useEffect(() => {
    if (currentUser) {
      setEditForm({
        name: currentUser.name || "",
        displayName: currentUser.displayName || "",
        description: currentUser.description || "",
        email: currentUser.email || "",
        category1: currentUser.category1 || "",
        category2: currentUser.category2 || "",
        tokenValue: currentUser.tokenValue || "",
      });
    }
  }, [currentUser]);

  const handleSaveProfile = async () => {
    try {
      // NOTE: You need to add useUpdateProfileMutation to your userApiSlice
      // import { useUpdateProfileMutation } from "../../features/user/userApislice";
      // const [updateProfile] = useUpdateProfileMutation();
      // await updateProfile(editForm).unwrap();

      console.log("Saving profile:", editForm);

      refetchUser(); // Refresh user data
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">VC</h1>
              <p className="text-xs text-gray-500">Venture Capital</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">profile</p>
              <p className="text-sm font-medium">
                <span className="text-black">
                  {currentUser?.displayName || currentUser?.name} (
                  {currentUser?.role})
                </span>
              </p>
            </div>
            <img
              src={
                currentUser?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || "User"
                }`
              }
              alt={currentUser?.name}
              className="h-10 w-10 rounded-full border border-gray-300"
            />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar - Dashboard Area */}
          <div className="lg:col-span-2">
            <Sidebar showLogout={true} />
          </div>

          {/* Main Profile Content */}
          <div className="lg:col-span-10">
            {/* Profile Header */}
            <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden shadow-sm">
              {/* Cover Photo */}
              <div className="h-48 bg-gradient-to-r from-gray-900 to-gray-700 relative">
                <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                  <div className="relative">
                    <img
                      src={
                        currentUser?.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || "User"}`
                      }
                      alt={currentUser?.name}
                      className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
                    />
                  </div>
                </div>
                <div className="absolute bottom-6 right-6">
                  {currentUser?.isPremium && (
                    <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-medium rounded-full shadow-md">
                      ⭐ Premium Member
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-16 pb-6 px-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {currentUser?.displayName || currentUser?.name}
                    </h1>
                    <p className="text-gray-600 mt-1">
                      {currentUser?.description || "No description provided"}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span
                        className={`px-3 py-1 text-sm rounded-full ${isInvestor ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                      >
                        {currentUser?.role?.toUpperCase() || "USER"}
                      </span>
                      <span className="text-gray-500">
                        Member since {formatDate(currentUser?.createdAt)}
                      </span>
                    </div>
                  </div>
                  {/* <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button> */}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-green-500">Pitch Limit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentUser?.pitchLimit || 0}
                    </p>
                  </div>

                  {isInvestor && (
                    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-500">Token Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {currentUser?.tokenValue || "N/A"}
                      </p>
                    </div>
                  )}
                  <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`text-lg font-bold ${currentUser?.isBlocked ? "text-red-600" : "text-green-600"}`}
                    >
                      {currentUser?.isBlocked ? "Blocked" : "Active"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 mb-6 shadow-sm">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`py-4 px-6 font-medium text-sm ${activeTab === "overview" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"} transition-colors`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`py-4 px-6 font-medium text-sm ${activeTab === "details" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"} transition-colors`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab("account")}
                    className={`py-4 px-6 font-medium text-sm ${activeTab === "account" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-500 hover:text-gray-700"} transition-colors`}
                  >
                    Account
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* User Posts Section */}
                    <div className="space-y-6">
                      <h3 className="font-semibold text-gray-900">Your Posts</h3>
                      {posts.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
                          <p className="text-gray-500">
                            You haven't posted anything yet.
                          </p>
                        </div>
                      ) : (
                        posts.map((post) => (
                          <div
                            key={post.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm"
                          >
                            {/* Post Header */}
                            <div className="p-6 border-b border-gray-100">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorId}`}
                                    alt={post.authorName}
                                    className="h-10 w-10 rounded-full border border-gray-200"
                                  />
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {post.authorName}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                      {post.timestamp}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Post Content */}
                              <div className="mt-4">
                                <p className="text-gray-700 whitespace-pre-line">
                                  {post.content}
                                </p>
                                {post.postImage && (
                                  <div className="mt-4">
                                    <img
                                      src={`http://localhost:5000/${post.postImage}`}
                                      alt="Post text"
                                      className="rounded-lg w-full object-cover max-h-[500px]"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Post Actions */}
                            <div className="px-6 py-3 border-b border-gray-100">
                              <div className="flex items-center space-x-6 text-gray-600">
                                <button
                                  onClick={() => handleLike(post.postId, post.isLiked)}
                                  className={`flex items-center space-x-2 transition-colors ${post.isLiked ? "text-red-500 hover:text-red-600" : "hover:text-gray-900"
                                    }`}
                                >
                                  <svg
                                    className="h-5 w-5"
                                    fill={post.isLiked ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                    />
                                  </svg>
                                  <span>{post.likesCount} Likes</span>
                                </button>
                                <button
                                  onClick={() => toggleComments(post.postId)}
                                  className={`flex items-center space-x-2 transition-colors ${expandedComments[post.postId] ? "text-blue-600" : "hover:text-gray-900"}`}
                                >
                                  <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                  </svg>
                                  <span>{post.commentsCount} Comments</span>
                                </button>
                              </div>
                            </div>

                            {/* Comments Section */}
                            {expandedComments[post.postId] && (
                              <div className="p-6 bg-gray-50 border-t border-gray-100">
                                <h4 className="font-medium text-gray-900 mb-4">
                                  Comments
                                </h4>

                                {/* Comments List */}
                                {post.comments && post.comments.length > 0 ? (
                                  <div className="space-y-4 mb-6">
                                    {post.comments.map((comment, index) => (
                                      <div key={index} className="flex space-x-3">
                                        <img
                                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId || "comment"}`}
                                          alt="Commenter"
                                          className="h-8 w-8 rounded-full border border-gray-200"
                                        />
                                        <div className="flex-1">
                                          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                            <div className="flex items-center justify-between">
                                              <span className="font-medium text-sm text-gray-900">
                                                {comment.userName ||
                                                  `User ${comment.userId ? comment.userId.slice(-4) : "Unknown"}`}
                                              </span>
                                              <span className="text-xs text-gray-400">
                                                {comment.timestamp
                                                  ? new Date(
                                                    comment.timestamp,
                                                  ).toLocaleDateString()
                                                  : "Recently"}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-700 mt-1">
                                              {comment.content}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500 mb-6 italic">
                                    No comments yet. Be the first to share your thoughts!
                                  </p>
                                )}

                                {/* Add Comment Input */}
                                <div className="flex items-center space-x-3">
                                  <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || "User"}`}
                                    alt={currentUser?.name}
                                    className="h-8 w-8 rounded-full border border-gray-200"
                                  />
                                  <div className="flex-1 relative">
                                    <input
                                      type="text"
                                      placeholder="Add a comment..."
                                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white shadow-sm"
                                      value={commentInputs[post.postId] || ""}
                                      onChange={(e) => handleCommentChange(post.postId, e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleCommentSubmit(post.postId);
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => handleCommentSubmit(post.postId)}
                                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                      <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Display Name
                            </label>
                            <input
                              type="text"
                              value={editForm.displayName}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  displayName: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email
                            </label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  email: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                description: e.target.value,
                              })
                            }
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                            placeholder="Tell others about yourself..."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category 1
                            </label>
                            <input
                              type="text"
                              value={editForm.category1}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  category1: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                              placeholder="E-commerce"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Category 2
                            </label>
                            <input
                              type="text"
                              value={editForm.category2}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  category2: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                              placeholder="AI / ML"
                            />
                          </div>
                          {isInvestor && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Token Value
                              </label>
                              <input
                                type="text"
                                value={editForm.tokenValue}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    tokenValue: e.target.value,
                                  })
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                                placeholder="60k"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            className="px-6 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all shadow-md"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">
                            About
                          </h3>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                            {currentUser?.description ||
                              "No description provided"}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">
                              Categories
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {currentUser?.category1 && (
                                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-medium">
                                  {currentUser.category1}
                                </span>
                              )}
                              {currentUser?.category2 && (
                                <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full font-medium">
                                  {currentUser.category2}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">
                              Contact Information
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600">
                                <svg
                                  className="h-5 w-5 mr-2 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                {currentUser?.email || "Email not provided"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "details" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Account Details
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium text-gray-900">
                              {currentUser?.name || "Not set"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Display Name
                            </p>
                            <p className="font-medium text-gray-900">
                              {currentUser?.displayName || "Not set"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">User ID</p>
                            <p className="font-mono text-sm text-gray-600 truncate">
                              {currentUser?._id || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Subscription Details
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-500">
                                Premium Status
                              </p>
                              <p
                                className={`font-medium ${currentUser?.isPremium ? "text-yellow-600" : "text-gray-600"}`}
                              >
                                {currentUser?.isPremium
                                  ? "Premium Member"
                                  : "Basic Member"}
                              </p>
                            </div>
                            {currentUser?.isPremium && (
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                ⭐ Premium
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Active Subscription
                            </p>
                            <p className="font-medium text-gray-900">
                              {currentUser?.activeSubscriptionId ||
                                "No active subscription"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Timestamps
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            Account Created
                          </p>
                          <p className="font-medium text-gray-900">
                            {formatDate(currentUser?.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="font-medium text-gray-900">
                            {formatDate(currentUser?.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "account" && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-xl border border-red-200 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Danger Zone
                      </h4>
                      <p className="text-sm text-gray-600 mb-4">
                        These actions are irreversible. Please proceed with
                        caution.
                      </p>
                      <div className="space-y-3">
                        <button className="w-full text-left p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700">
                                Block Account
                              </p>
                              <p className="text-sm text-red-600">
                                Temporarily disable your account
                              </p>
                            </div>
                            <svg
                              className="h-5 w-5 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.282 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                          </div>
                        </button>

                        <button className="w-full text-left p-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-700">
                                Delete Account
                              </p>
                              <p className="text-sm text-red-600">
                                Permanently delete your account and all data
                              </p>
                            </div>
                            <svg
                              className="h-5 w-5 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                      <h4 className="font-semibold text-gray-900 mb-4">
                        Account Actions
                      </h4>
                      <div className="space-y-3">
                        <button className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                Reset Password
                              </p>
                              <p className="text-sm text-gray-600">
                                Change your account password
                              </p>
                            </div>
                            <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                              />
                            </svg>
                          </div>
                        </button>

                        <button className="w-full text-left p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                Export Data
                              </p>
                              <p className="text-sm text-gray-600">
                                Download all your account data
                              </p>
                            </div>
                            <svg
                              className="h-5 w-5 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
