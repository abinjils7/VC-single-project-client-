import { apiSlice } from "../../store/apiSlice";

export const notificationApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: () => "/notifications",
            providesTags: ["Notification"],
        }),
        markAsRead: builder.mutation({
            query: (notificationId) => ({
                url: `/notifications/${notificationId}/read`,
                method: "PUT",
            }),
            invalidatesTags: ["Notification"],
        }),
        markAllAsRead: builder.mutation({
            query: () => ({
                url: "/notifications/read-all",
                method: "PUT",
            }),
            invalidatesTags: ["Notification"],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} = notificationApiSlice;
