import { apiSlice } from "../../store/apiSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAdminStats: builder.query({
            query: () => "/admin/stats",
            keepUnusedDataFor: 5,
        }),
        getAllUsers: builder.query({
            query: () => "/admin/users",
            providesTags: ["AdminUsers"],
        }),
        blockUser: builder.mutation({
            query: (body) => ({
                url: "/admin/block-user",
                method: "POST",
                body,
            }),
            invalidatesTags: ["AdminUsers"],
        }),
        getReports: builder.query({
            query: () => "/admin/reports",
            providesTags: ["AdminReports"],
        }),
        dismissReport: builder.mutation({
            query: (reportId) => ({
                url: `/admin/reports/${reportId}/dismiss`,
                method: "PUT",
            }),
            invalidatesTags: ["AdminReports"],
        }),
        actionReport: builder.mutation({
            query: ({ reportId, banUser }) => ({
                url: `/admin/reports/${reportId}/action`,
                method: "POST",
                body: { banUser },
            }),
            invalidatesTags: ["AdminReports", "AdminUsers", "Post"],
        }),

        // ---- Maintenance Mode (NEW) ----

        // Toggle maintenance ON or OFF
        toggleMaintenance: builder.mutation({
            query: (body) => ({
                url: "/admin/maintenance",
                method: "POST",
                body, // { maintenanceMode: true/false }
            }),
        }),

        // Get current maintenance status
        getMaintenanceStatus: builder.query({
            query: () => "/admin/maintenance-status",
        }),
    }),
});

export const {
    useGetAdminStatsQuery,
    useGetAllUsersQuery,
    useBlockUserMutation,
    useGetReportsQuery,
    useDismissReportMutation,
    useActionReportMutation,
    useToggleMaintenanceMutation,      // <-- NEW
    useGetMaintenanceStatusQuery,      // <-- NEW
} = adminApiSlice;
