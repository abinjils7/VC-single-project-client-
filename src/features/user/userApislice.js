import { apiSlice } from "../../store/apiSlice";
import { userProfile } from "../auth/authSlice";

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: () => "/user",
      providesTags: ["User"],
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          userProfile(data);
        } catch (err) {
          console.log("Error fetching user", err);
        }
      },
    }),
    updateUser: builder.mutation({
      query: (data) => ({
        url: "/user/update",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: () => ({
        url: "/user/delete",
        method: "DELETE",
      }),
    }),
  }),
});

export const { useGetUserQuery, useUpdateUserMutation, useDeleteUserMutation } = userApiSlice;
