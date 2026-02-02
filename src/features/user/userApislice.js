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
  }),
});

export const { useGetUserQuery } = userApiSlice;
