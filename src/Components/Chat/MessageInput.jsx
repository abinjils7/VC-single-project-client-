import React, { useState } from 'react';

export default function MessageInput({ onSendMessage }) {
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center w-full">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message..."
                className="flex-1 bg-transparent text-white text-[14px] placeholder-[#a8a8a8] outline-none border-none py-1 px-2"
            />
            {message.trim() && (
                <button
                    type="submit"
                    className="text-[#0095f6] font-semibold text-[14px] hover:text-white transition-colors pr-2 shrink-0"
                >
                    Send
                </button>
            )}
        </form>
    );
}
