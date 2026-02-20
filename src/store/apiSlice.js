import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// ==========================================
// Base query with 503 (Maintenance) interceptor
// ==========================================
// This wraps the default fetchBaseQuery.
// If any API response returns 503, we redirect to /maintenance.

const rawBaseQuery = fetchBaseQuery({
    baseUrl: 'https://vc-single-project-server.onrender.com',
    credentials: 'include',
});

import { setCredentials, logOut } from '../features/auth/authSlice';

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    // If the server returns 503 (maintenance mode), redirect to maintenance page
    if (result.error && result.error.status === 503) {
        if (window.location.pathname !== '/maintenance') {
            window.location.href = '/maintenance';
        }
    }

    // If the server returns 401 (Unauthorized), try to refresh the token
    if (result.error && result.error.status === 401) {
        // limit to avoiding infinite loop
        // @ts-ignore
        const hasTriedToRefresh = extraOptions?.shoudRetry !== true;

        if (hasTriedToRefresh) {
            // try to get a new token
            const refreshResult = await rawBaseQuery(
                { url: '/auth/refresh', method: 'POST' },
                api,
                extraOptions
            );

            if (refreshResult.data) {
                // store the new token
                // api.dispatch(setCredentials({ ...refreshResult.data }));
                // We only get accessToken back, but we need to update state if we store it there.
                // However, since we use httpOnly cookies, the browser handles the storage.
                // We just need to retry the initial query.

                // retry the initial query
                result = await rawBaseQuery(args, api, { ...extraOptions, shoudRetry: true });
            } else {
                // refresh failed - do nothing or log out
                api.dispatch(logOut());
            }
        }
    }

    return result;
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: baseQueryWithReauth,  // <-- Uses our custom wrapper with Reauth
    tagTypes: ['User', 'Post', 'Notification'],
    // eslint-disable-next-line no-unused-vars
    endpoints: (builder) => ({}),
});

