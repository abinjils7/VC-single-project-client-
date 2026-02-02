import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:5000',
        credentials: 'include',
    }),
    tagTypes: ['User', 'Post'],
    // eslint-disable-next-line no-unused-vars
    endpoints: (builder) => ({}),
});
