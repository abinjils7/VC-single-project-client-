import React from 'react';

export default function ConversationList({ conversations, selectedId, onSelect }) {
    return (
        <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
                <div
                    key={conv.id}
                    onClick={() => onSelect(conv)}
                    className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${selectedId === conv.id ? 'bg-blue-50 hover:bg-blue-50' : ''
                        }`}
                >
                    <div className="relative">
                        <img
                            src={conv.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.name}`}
                            alt={conv.name}
                            className="h-10 w-10 rounded-full border border-gray-200"
                        />
                        {conv.isOnline && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{conv.name}</h3>
                            <span className="text-xs text-gray-400">{conv.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                        <span className="h-5 w-5 bg-blue-600 text-white text-xs font-medium rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
