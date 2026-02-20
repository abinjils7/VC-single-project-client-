import React, { useRef, useEffect, memo } from 'react';

const MessageItem = memo(({ msg, isOwn }) => (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
        <div
            className={`max-w-[70%] rounded-[22px] px-4 py-2.5 smooth-transition ${isOwn
                ? 'bg-[#3797f0] text-white rounded-br-md'
                : 'bg-[#262626] text-[#f0f0f0] rounded-bl-md'
                }`}
        >
            <p className="text-[15px] leading-snug">{msg.content}</p>
            <p
                className={`text-[11px] mt-1 text-right ${isOwn ? 'text-blue-100/70' : 'text-[#737373]'
                    }`}
            >
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        </div>
    </div>
));

const MessageList = memo(({ messages, currentUserId }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {messages.map((msg, index) => (
                <MessageItem
                    key={msg.id || index}
                    msg={msg}
                    isOwn={msg.senderId === currentUserId}
                />
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
});

export default MessageList;
