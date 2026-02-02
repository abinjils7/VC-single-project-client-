import { apiSlice } from "../../store/apiSlice";

export const pitchApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createPitch: builder.mutation({
            query: (pitchData) => ({
                url: "/pitch/create",
                method: "POST",
                body: pitchData,
            }),
            invalidatesTags: ["Pitch"],
        }),
        getPitchesForInvestor: builder.query({
            query: (investorId) => `/pitch/investor/${investorId}`,
            providesTags: ["Pitch"],
        }),
        getStartupPitches: builder.query({
            query: (startupId) => `/pitch/startup/${startupId}`,
            providesTags: ["Pitch"],
        }),
        updatePitchStatus: builder.mutation({
            query: ({ pitchId, status }) => ({
                url: `/pitch/status/${pitchId}`,
                method: "PUT",
                body: { status },
            }),
            invalidatesTags: ["Pitch"],
        }),
    }),
});

export const { useCreatePitchMutation, useGetPitchesForInvestorQuery, useGetStartupPitchesQuery, useUpdatePitchStatusMutation } = pitchApiSlice;
