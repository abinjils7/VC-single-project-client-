import React, { useRef, useEffect } from 'react';

export default function MessageList({ messages, currentUserId }) {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => {
                const isOwn = msg.senderId === currentUserId;
                return (
                    <div
                        key={msg.id || index}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isOwn
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'
                                }`}
                        >
                            <p className="text-sm">{msg.content}</p>
                            <p
                                className={`text-xs mt-1 text-right ${isOwn ? 'text-blue-100' : 'text-gray-400'
                                    }`}
                            >
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}
