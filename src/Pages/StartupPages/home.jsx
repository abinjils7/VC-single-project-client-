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
import Sidebar from "../../Components/Sidebar";

import { toast } from "react-hot-toast";

export default function HomePage() {
  const user = useSelector(selectCurrentUser);
  const { data: userData } = useGetUserQuery();
  const currentUser = userData || user;

  const {
    data: postsData = [],
    isLoading: loadingPosts,
    error: postsError,
    refetch: refetchPosts,
  } = useGetPostsQuery({ role: currentUser?.role });

  const [createPost, { isLoading: isCreatingPost, error: createPostError }] =
    useCreatePostMutation();

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [addComment] = useAddCommentMutation();



  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [selectedInvestorId, setSelectedInvestorId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [pitchedPostIds, setPitchedPostIds] = useState([]);

  // Fetch existing pitches
  const { data: startupPitches = [] } = useGetStartupPitchesQuery(
    currentUser?._id || currentUser?.user?._id || currentUser?.id,
    {
      skip: !currentUser || currentUser.role !== "startup",
    }
  );

  useEffect(() => {
    if (startupPitches.length > 0) {
      // Map pitched posts. We filter for those that have a postId.
      const pitchedPosts = startupPitches
        .map((pitch) => pitch.postId)
        .filter((id) => id !== undefined && id !== null);
      setPitchedPostIds(pitchedPosts);
    }
  }, [startupPitches]);

  const navigate = useNavigate();

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
    // likesCount: post.likesCount || 0, // Removed legacy field
    comments: (post.comments || []).map(c => ({
      userId: c.userId?._id || c.userId,
      userName: c.userId?.name,
      content: c.subject,
      timestamp: c.createdAt
    })),
    likesCount: post.likes ? post.likes.length : 0,
    isLiked: post.likes?.includes(currentUser?._id || currentUser?.user?._id || currentUser?.id),
    commentsCount:
      post.commentsCount || (post.comments ? post.comments.length : 0),
  }));

  const isLoading = loadingPosts;

  console.log(posts);


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
      const currentUserObj = userData || user;
      const authorId =
        currentUserObj?._id || currentUserObj?.user?._id || currentUserObj?.id;

      if (!authorId) {
        console.error("User ID not found", currentUserObj);
        toast.error("Unable to identify user. Please try logging in again.");
        return;
      }

      const formData = new FormData();
      formData.append("authorId", authorId);
      formData.append("postId", crypto.randomUUID());
      formData.append("content", newPostContent.trim());
      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      await createPost(formData).unwrap();
      toast.success("Post created successfully!");
      setNewPostContent("");
      handleRemoveImage();
      refetchPosts();
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Failed to create post. Please try again.");
    }
  };

  // Handle enter key for post creation
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleCreatePost();
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      const currentUserObj = userData || user;
      const userId = currentUserObj?._id || currentUserObj?.user?._id || currentUserObj?.id;

      if (!userId) {
        alert("Please log in to like posts");
        return;
      }

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
      const currentUserObj = userData || user;
      const userId = currentUserObj?._id || currentUserObj?.user?._id || currentUserObj?.id;

      if (!userId) {
        alert("Please log in to comment");
        return;
      }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }


  const isInvestor = currentUser?.role === "investor";
  const isStartup = currentUser?.role === "startup";

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

          <div
            className="flex items-center space-x-4"
            onClick={() => navigate("/profile")}
          >
            <div className="text-right">
              <p className="text-sm text-gray-500">Wlcome to VC</p>
              <p className="text-sm font-medium">
                <span className="text-black">{currentUser?.name}</span>
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
            <Sidebar />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Feed</h2>
              <p className="text-gray-600">Latest updates from the community</p>
            </div>

            {/* Create Post Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <img
                  src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || "User"}`}
                  alt={currentUser?.name}
                  className="h-12 w-12 rounded-full border border-gray-200"
                />
                <div className="flex-1">
                  <textarea
                    placeholder={
                      isInvestor
                        ? "Post your investment requirements..."
                        : "Share your startup updates..."
                    }
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none transition-all"
                    rows="3"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isCreatingPost}
                  />

                  {imagePreview && (
                    <div className="mt-3 relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-60 rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-gray-900 text-white rounded-full p-1 hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Error message */}
                  {createPostError && (
                    <div className="mt-3 text-red-600 text-sm">
                      Failed to create post. Please try again.
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileAttach}
                          disabled={isCreatingPost}
                        />
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
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Photo</span>
                      </label>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={isCreatingPost || !newPostContent.trim()}
                      className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isCreatingPost ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin h-4 w-4 mr-2 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Posting...
                        </span>
                      ) : isInvestor ? (
                        "Post Requirement"
                      ) : (
                        "Create Post"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Section */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                  <p className="text-gray-500">
                    No posts yet. Start the conversation!
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
                        {post.authorRole === "investor" && (
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Requirement
                            </span>
                            {pitchedPostIds.includes(post.id) ? (
                              <button
                                disabled
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded-full cursor-default"
                              >
                                Submitted Pitch
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedInvestorId(post.authorId._id || post.authorId);
                                  setSelectedPostId(post.id);
                                  setIsPitchModalOpen(true);
                                }}
                                className="px-3 py-1 text-xs bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                              >
                                Send Pitch
                              </button>
                            )}
                          </div>
                        )}
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
                        <button className="flex items-center space-x-2 hover:text-gray-900 transition-colors">
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
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                          <span>Share</span>
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
          </div>
        </div>
      </div>
      <PitchModal
        isOpen={isPitchModalOpen}
        onClose={() => setIsPitchModalOpen(false)}
        investorId={selectedInvestorId}
        postId={selectedPostId}
        onSuccess={() => {
          if (selectedPostId) {
            setPitchedPostIds((prev) => [...prev, selectedPostId]);
          }
        }}
      />
    </div >
  );
}
