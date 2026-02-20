import { apiSlice } from "../../store/apiSlice";

export const chatApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getChats: builder.query({
            query: () => '/chat',
            providesTags: ['Chat'],
        }),
        getMessages: builder.query({
            query: (chatId) => `/chat/${chatId}/messages`,
            providesTags: (result, error, chatId) => [{ type: 'Message', id: chatId }],
        }),
        sendMessage: builder.mutation({
            query: ({ chatId, content }) => ({
                url: '/chat/message',
                method: 'POST',
                body: { chatId, message: content },
            }),
            invalidatesTags: (result, error, { chatId }) => ['Chat', { type: 'Message', id: chatId }],
        }),
    }),
});

export const {
    useGetChatsQuery,
    useGetMessagesQuery,
    useSendMessageMutation
} = chatApiSlice;
