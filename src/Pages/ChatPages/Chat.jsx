/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import ConversationList from '../../Components/Chat/ConversationList';
import MessageList from '../../Components/Chat/MessageList';
import MessageInput from '../../Components/Chat/MessageInput';
import VideoCall from '../../Components/VideoCall';
import IncomingCallModal from '../../Components/IncomingCallModal';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { useGetChatsQuery, useGetMessagesQuery, useSendMessageMutation } from '../../features/chat/chatApiSlice';
import { io } from 'socket.io-client';
import useWebRTC from '../../Hooks/useWebRTC';
import MobileNav from '../../Components/MobileNav';

export default function ChatPage() {
    const currentUser = useSelector(selectCurrentUser);
    const { data: chatsData, isLoading: isLoadingChats, refetch: refetchChats } = useGetChatsQuery();
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [unreadChats, setUnreadChats] = useState({});
    const socketRef = useRef();
    const selectedConversationRef = useRef(null);

    // Transform chats for UI
    const conversations = chatsData?.map(chat => {
        const otherParticipant = chat.participants.find(p => p._id !== currentUser?._id) || chat.participants[0];
        return {
            id: chat._id,
            name: otherParticipant?.displayName || otherParticipant?.name || 'Unknown User',
            avatar: otherParticipant?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParticipant?.name || 'User'}`,
            lastMessage: chat.lastMessage,
            lastMessageTime: chat.lastMessageTime,
            unreadCount: unreadChats[chat._id] || 0,
            isOnline: false
        };
    }) || [];

    const { data: messagesData, refetch: refetchMessages } = useGetMessagesQuery(selectedConversation?.id, {
        skip: !selectedConversation,
    });

    const [sendMessageMutation] = useSendMessageMutation();

    // WebRTC video call hook
    const {
        callState,
        incomingCall,
        localStream,
        remoteStream,
        isMuted,
        isCameraOff,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
    } = useWebRTC(socketRef, currentUser?._id);

    // Transform messages for UI
    const messages = messagesData?.map(msg => ({
        id: msg._id,
        senderId: msg.senderId,
        content: msg.message,
        timestamp: msg.createdAt
    })) || [];

    // Keep ref in sync
    useEffect(() => {
        selectedConversationRef.current = selectedConversation;
    }, [selectedConversation]);

    // Socket Connection
    useEffect(() => {
        socketRef.current = io('http://localhost:5000', { withCredentials: true });

        if (currentUser?._id) {
            socketRef.current.emit('register_user', currentUser._id);
        }

        socketRef.current.on('connect', () => console.log("Connected to socket server"));

        socketRef.current.on('receive_message', (newMessage) => {
            const currentSelected = selectedConversationRef.current;
            if (!currentSelected || newMessage.chatId !== currentSelected.id) {
                setUnreadChats(prev => ({ ...prev, [newMessage.chatId]: (prev[newMessage.chatId] || 0) + 1 }));
            }
        });

        return () => { if (socketRef.current) socketRef.current.disconnect(); };
    }, []);

    // Join Rooms
    useEffect(() => {
        if (socketRef.current && chatsData?.length > 0) {
            chatsData.forEach(chat => socketRef.current.emit('join_chat', chat._id));
        }
    }, [chatsData]);

    // Handle Active Conversation Messages
    useEffect(() => {
        if (selectedConversation && socketRef.current) {
            socketRef.current.emit('join_chat', selectedConversation.id);
            const handleReceiveMessage = (newMessage) => {
                if (newMessage.chatId === selectedConversation.id) {
                    refetchMessages();
                    refetchChats();
                }
            };
            socketRef.current.on('receive_message', handleReceiveMessage);
            return () => socketRef.current.off('receive_message', handleReceiveMessage);
        }
    }, [selectedConversation, refetchMessages, refetchChats]);

    const handleSendMessage = async (content) => {
        if (!selectedConversation || !content.trim()) return;
        try {
            const result = await sendMessageMutation({ chatId: selectedConversation.id, content }).unwrap();
            socketRef.current.emit('send_message', {
                chatId: selectedConversation.id,
                senderId: currentUser._id,
                message: content,
                createdAt: new Date().toISOString(),
                _id: result._id
            });
            refetchMessages();
            refetchChats();
        } catch (error) { console.error("Failed to send message", error); }
    };

    // Instagram Font Stack
    const instaFont = { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden pb-16 lg:pb-0" style={instaFont}>
            <MobileNav />



            {/* SIDEBAR - CONVERSATION LIST */}
            {/* Show on mobile if NO conversation selected. Always show on Desktop. */}
            <div className={`w-full lg:w-[350px] border-r border-[#262626] flex flex-col bg-black shrink-0 ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>

                {/* Sidebar Header */}
                <div className="h-[75px] px-6 flex items-center justify-between border-b border-[#262626] shrink-0">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <h2 className="text-xl font-bold tracking-tight">{currentUser?.displayName || currentUser?.name}</h2>
                        <svg className="w-3 h-3 text-white rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <button className="text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto pt-2">
                    <div className="px-6 pb-2 flex justify-between items-center">
                        <h3 className="font-bold text-[16px]">Messages</h3>
                        <span className="text-[#a8a8a8] text-sm font-semibold cursor-pointer">Requests</span>
                    </div>

                    <ConversationList
                        conversations={conversations}
                        selectedId={selectedConversation?.id}
                        onSelect={(conv) => {
                            setSelectedConversation(conv);
                            setUnreadChats(prev => {
                                const updated = { ...prev };
                                delete updated[conv.id];
                                return updated;
                            });
                        }}
                    />
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className={`flex-1 flex flex-col bg-black relative min-w-0 ${selectedConversation ? 'flex' : 'hidden lg:flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-[75px] px-4 lg:px-6 border-b border-[#262626] flex items-center justify-between bg-black z-20 shrink-0">
                            <div className="flex items-center gap-4">
                                {/* Back Button for Mobile */}
                                <button
                                    className="lg:hidden text-white"
                                    onClick={() => setSelectedConversation(null)}
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
                                    <img
                                        src={selectedConversation.avatar}
                                        alt={selectedConversation.name}
                                        className="h-10 w-10 lg:h-11 lg:w-11 rounded-full object-cover border border-[#262626]"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-[16px] text-white leading-tight">{selectedConversation.name}</h3>
                                        {selectedConversation.isOnline ? (
                                            <p className="text-[12px] text-[#a8a8a8]">Active now</p>
                                        ) : (
                                            <p className="text-[12px] text-[#a8a8a8]">View profile</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 lg:gap-6 text-white">
                                <button
                                    className="hover:text-[#a8a8a8] transition-colors"
                                    onClick={() => {
                                        const other = chatsData?.find(c => c._id === selectedConversation.id)?.participants?.find(p => p._id !== currentUser?._id);
                                        if (other) startCall(other._id, currentUser?.name || 'User');
                                    }}
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                                <button className="hover:text-[#a8a8a8] transition-colors"><svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                            </div>
                        </div>

                        {/* Messages List Area */}
                        <div className="flex-1 overflow-y-auto px-4 py-2 bg-black">
                            <MessageList
                                messages={messages}
                                currentUserId={currentUser?._id}
                            />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 lg:p-5 bg-black shrink-0">
                            <div className="relative flex items-center bg-[#262626] rounded-[22px] px-2 py-1 min-h-[44px] border border-transparent focus-within:border-[#a8a8a8] transition-colors">
                                <button className="p-2 text-white hover:text-[#a8a8a8] transition-colors rounded-full shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </button>

                                <div className="flex-1">
                                    <MessageInput onSendMessage={handleSendMessage} />
                                </div>

                                {messages.length === 0 && (
                                    <div className="flex items-center gap-2 pr-2 shrink-0">
                                        <button className="p-2 text-white hover:text-[#a8a8a8]"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                                        <button className="p-2 text-white hover:text-[#a8a8a8]"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State - Instagram Style */
                    <div className="flex-1 flex flex-col items-center justify-center bg-black text-center">
                        <div className="w-24 h-24 rounded-full border-2 border-white flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </div>
                        <h2 className="text-xl font-normal text-white mb-2">Your Messages</h2>
                        <p className="text-[#a8a8a8] text-sm mb-6">Send private photos and messages to a friend or group.</p>
                        <button className="bg-[#0095f6] hover:bg-[#1877f2] text-white px-4 py-1.5 rounded-[8px] text-sm font-semibold transition-colors">
                            Send Message
                        </button>
                    </div>
                )}

                {/* Video Call & Incoming Modals */}
                {(callState === 'calling' || callState === 'connected') && (
                    <div className="fixed inset-0 z-[100] bg-black">
                        <VideoCall
                            localStream={localStream}
                            remoteStream={remoteStream}
                            isMuted={isMuted}
                            isCameraOff={isCameraOff}
                            onToggleMute={toggleMute}
                            onToggleCamera={toggleCamera}
                            onEndCall={endCall}
                            calleeName={selectedConversation?.name}
                            callState={callState}
                        />
                    </div>
                )}

                {callState === 'incoming' && incomingCall && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm">
                        <div className="bg-[#262626] border border-[#363636] p-8 rounded-[20px] shadow-2xl text-center max-w-sm w-full">
                            <IncomingCallModal
                                callerName={incomingCall.callerName}
                                onAccept={acceptCall}
                                onReject={rejectCall}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}