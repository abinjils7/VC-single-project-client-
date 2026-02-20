import React, { memo } from 'react';

const ConversationItem = memo(({ conv, isSelected, onSelect }) => {
    const hasUnread = conv.unreadCount > 0;
    return (
        <div
            onClick={() => onSelect(conv)}
            className={`flex items-center space-x-3 px-4 py-3 cursor-pointer smooth-transition active:bg-gray-800/50 ${isSelected
                ? 'bg-[#1a1a1a]'
                : 'hover:bg-[#121212]'
                }`}
        >
            {/* Red dot indicator - Instagram style */}
            <div className="flex items-center justify-center w-3 shrink-0">
                {hasUnread && (
                    <span className="h-2 w-2 bg-red-500 rounded-full animate-fade-in"></span>
                )}
            </div>
            <div className="relative">
                <img
                    src={conv.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.name}`}
                    alt={conv.name}
                    className="h-14 w-14 rounded-full object-cover border border-[#262626]"
                />
                {conv.isOnline && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-black animate-fade-in"></span>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className={`text-[14px] truncate ${hasUnread ? 'font-bold text-white' : 'font-normal text-white'}`}>{conv.name}</h3>
                    <span className={`text-xs ml-2 shrink-0 ${hasUnread ? 'text-white font-semibold' : 'text-[#a8a8a8]'}`}>
                        {conv.lastMessageTime ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                </div>
                <p className={`text-[13px] truncate ${hasUnread ? 'font-semibold text-[#e0e0e0]' : 'text-[#a8a8a8]'}`}>{conv.lastMessage}</p>
            </div>
        </div>
    );
});

const ConversationList = memo(({ conversations, selectedId, onSelect }) => {
    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {conversations.map((conv) => (
                <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isSelected={selectedId === conv.id}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
});

export default ConversationList;
