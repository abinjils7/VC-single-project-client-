import React, { useState } from 'react';
import ConversationList from '../../Components/Chat/ConversationList';
import MessageList from '../../Components/Chat/MessageList';
import MessageInput from '../../Components/Chat/MessageInput';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';

// Mock data
const MOCK_CONVERSATIONS = [
    {
        id: 1,
        name: 'Alice Investor',
        lastMessage: 'Let\'s schedule a meeting for next week.',
        lastMessageTime: '10:30 AM',
        unreadCount: 2,
        isOnline: true,
    },
    {
        id: 2,
        name: 'Bob Capital',
        lastMessage: 'Great pitch! Reviewed your deck.',
        lastMessageTime: 'Yesterday',
        unreadCount: 0,
        isOnline: false,
    },
];

const MOCK_MESSAGES = [
    { id: 1, senderId: 'current-user', content: 'Hi Alice, thanks for connecting!', timestamp: Date.now() - 100000 },
    { id: 2, senderId: 1, content: 'Hello! I loved your pitch video.', timestamp: Date.now() - 90000 },
    { id: 3, senderId: 1, content: 'Let\'s schedule a meeting for next week.', timestamp: Date.now() - 80000 },
];

export default function ChatPage() {
    const currentUser = useSelector(selectCurrentUser);
    const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
    const [selectedConversation, setSelectedConversation] = useState(MOCK_CONVERSATIONS[0]);
    const [messages, setMessages] = useState(MOCK_MESSAGES);

    const handleSendMessage = (content) => {
        const newMessage = {
            id: Date.now(),
            senderId: currentUser?._id || 'current-user', // Fallback for dev
            content,
            timestamp: Date.now(),
        };
        setMessages([...messages, newMessage]);
    };

    return (
        <div className="flex h-screen bg-white">
            {/* Sidebar - Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                    <button className="text-gray-500 hover:text-gray-700">
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Search conversations"
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                <ConversationList
                    conversations={conversations}
                    selectedId={selectedConversation?.id}
                    onSelect={setSelectedConversation}
                />
            </div>

            {/* Main Chat Area */}
            {selectedConversation ? (
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                        <div className="flex items-center space-x-3">
                            <img
                                src={selectedConversation.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedConversation.name}`}
                                alt={selectedConversation.name}
                                className="h-10 w-10 rounded-full border border-gray-200"
                            />
                            <div>
                                <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                                {selectedConversation.isOnline && (
                                    <span className="text-xs text-green-500 font-medium">Online</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-500">
                            <button className="hover:text-gray-700">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </button>
                            <button className="hover:text-gray-700">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </button>
                            <button className="hover:text-gray-700">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <MessageList
                        messages={messages}
                        currentUserId={currentUser?._id || 'current-user'}
                    />

                    <MessageInput onSendMessage={handleSendMessage} />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-center p-8">
                    <div className="bg-white p-6 rounded-full mb-6 shadow-sm">
                        <svg className="h-12 w-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Messages</h2>
                    <p className="text-gray-500 max-w-sm">
                        Send private photos and messages to a friend or group.
                    </p>
                    <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        Send Message
                    </button>
                </div>
            )}
        </div>
    );
}
