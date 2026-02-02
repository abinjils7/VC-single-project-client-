import { apiSlice } from "../../store/apiSlice";
import { setCredentials } from "./authSlice";

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Ensure we are dispatching the user object, not the full response { message, user }
          dispatch(setCredentials(data.user ? data.user : data));
        } catch (err) {
          console.error(err);
        }
      },
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data.user) {
            dispatch(setCredentials(data.user));
          }
        } catch (err) {
          console.error(err);
        }
      },
    }),
    sendOtp: builder.mutation({
      query: (userEmail) => ({
        url: "/otp/send",
        method: "POST",
        body: userEmail,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (otp) => ({
        url: "/otp/verify",
        method: "POST",
        body: otp,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: "/auth/resetPassword",
        method: "POST",
        body: { email: data.email, newpassword: data.newPassword },
      }),
    }),
    ChangePassword: builder.mutation({
      query: (data) => ({
        url: "/auth/changepassword",
        method: "POST",
        body: data,
      }),
    }),
    getMe: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.user ? data.user : data));
        } catch (err) {
          console.error("Session check failed", err);
        }
      },
    }),
    subscribe: builder.mutation({
      query: (data) => ({
        url: "/auth/subscribe",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Update credentials with the new user data (which has updated pitchLimit)
          if (data.user) {
            dispatch(setCredentials(data.user));
          }
        } catch (err) {
          console.error(err);
        }
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useSubscribeMutation,
  useLogoutMutation,
} = authApiSlice;
