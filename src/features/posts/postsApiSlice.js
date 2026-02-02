import { apiSlice } from "../../store/apiSlice";

export const postsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg?.role) params.append("role", arg.role);
        if (arg?.userId) params.append("userId", arg.userId);
        return `/post/getpost?${params.toString()}`;
      },
      providesTags: ["Post"],
    }),
    createPost: builder.mutation({
      query: (postData) => ({
        url: "/post/newpost",
        method: "POST",
        body: postData,
      }),
      invalidatesTags: ["Post"],
    }),
    likePost: builder.mutation({
      query: ({ postId, userId }) => ({
        url: `/post/${postId}/like`,
        method: "PUT",
        body: { userId },
      }),
      invalidatesTags: ["Post"],
      async onQueryStarted({ postId, userId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getPosts", undefined, (draft) => {
            const post = draft.find((p) => p.postId === postId);
            if (post) {
              if (!post.likes) post.likes = [];
              if (!post.likes.includes(userId)) {
                post.likes.push(userId);
              }
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    unlikePost: builder.mutation({
      query: ({ postId, userId }) => ({
        url: `/post/${postId}/unlike`,
        method: "PUT",
        body: { userId },
      }),
      invalidatesTags: ["Post"],
      async onQueryStarted({ postId, userId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData("getPosts", undefined, (draft) => {
            const post = draft.find((p) => p.postId === postId);
            if (post && post.likes) {
              post.likes = post.likes.filter((id) => id !== userId);
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    addComment: builder.mutation({
      query: ({ postId, ...commentData }) => ({
        url: `/post/${postId}/comment`,
        method: "POST",
        body: commentData,
      }),
      invalidatesTags: ["Post"],
    }),
    deleteComment: builder.mutation({
      query: ({ postId, commentId }) => ({
        url: `/post/${postId}/comment/${commentId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useCreatePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useAddCommentMutation,
  useDeleteCommentMutation,
} = postsApiSlice;
