export default function IncomingCallModal({ callerName, onAccept, onReject }) {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
                {/* Avatar */}
                <div className="mb-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-3xl font-bold text-white">
                            {callerName?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{callerName || "Unknown"}</h2>
                    <p className="text-gray-500 mt-1 animate-pulse">Incoming video call...</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center space-x-8">
                    {/* Reject */}
                    <button
                        onClick={onReject}
                        className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                    >
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z" />
                        </svg>
                    </button>

                    {/* Accept */}
                    <button
                        onClick={onAccept}
                        className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-lg"
                    >
                        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
