import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { PLANS } from '../Pages/SubscriptionPages/SubscriptionPlans';
import { toast } from 'react-hot-toast';
import { useSubscribeMutation } from '../features/auth/authApiSlice';


const SubscriptionPopup = () => {
    const user = useSelector(selectCurrentUser);
    const [isOpen, setIsOpen] = useState(false);
    const [countdown, setCountdown] = useState(20);

    const [hasClosed, setHasClosed] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    // Use RTK Query mutation
    const [subscribe, { isLoading }] = useSubscribeMutation();
    const dispatch = useDispatch();

    // Check pitch limit
    useEffect(() => {
        // Handle case where user might be wrapped in { user: ... } or direct
        const actualUser = user?.user || user;

        if (actualUser && actualUser.pitchLimit <= 0 && !hasClosed) {
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    }, [user, hasClosed]);

    // Countdown logic
    useEffect(() => {
        let timer;
        if (isOpen && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOpen, countdown]);

    const handleClose = () => {
        if (countdown === 0) {
            setIsOpen(false);
            setHasClosed(true);
        }
    };

    const handleSubscribe = async (plan) => {
        setSelectedPlanId(plan.id);
        try {
            const res = await subscribe({
                pitchLimit: plan.pitchLimit === -1 ? 9999 : plan.pitchLimit
            }).unwrap();

            toast.success(`Successfully subscribed to ${plan.name} plan!`);
            setIsOpen(false);
            setCountdown(20);
            // User update handled in mutation onQueryStarted
        } catch (error) {
            console.error(error);
            toast.error("Subscription failed. Please try again.");
        } finally {
            setSelectedPlanId(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

                {/* Center modal */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full p-6 relative">

                    {/* Top right close button */}
                    <button
                        onClick={handleClose}
                        disabled={countdown > 0}
                        className={`absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none ${countdown > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-gray-900" id="modal-title">
                            You've run out of Pitches!
                        </h3>
                        <button
                            onClick={handleClose}
                            disabled={countdown > 0}
                            className={`px-4 py-2 rounded-md font-medium text-white transition-colors
                                ${countdown > 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {countdown > 0 ? `Close in ${countdown}s` : 'Close'}
                        </button>
                    </div>

                    <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-6">
                            Upgrade your plan to continue pitching to investors.
                        </p>

                        {/* Reuse the grid but maybe scale it down or just render it */}
                        <div className="mt-8 grid gap-6 lg:grid-cols-3">
                            {PLANS.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative bg-gray-50 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow ${plan.recommended ? 'ring-2 ring-indigo-500' : ''}`}
                                >
                                    {plan.recommended && (
                                        <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-indigo-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow uppercase tracking-wide">
                                            Recommended
                                        </div>
                                    )}

                                    <div className="p-6 flex-1">
                                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                        <div className="mt-2 flex items-baseline">
                                            <span className="text-3xl font-extrabold text-gray-900">${plan.price}</span>
                                        </div>

                                        <ul className="mt-4 space-y-3">
                                            {plan.features.slice(0, 3).map((feature, index) => (
                                                <li key={index} className="flex items-start">
                                                    <svg className="flex-shrink-0 h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="ml-2 text-gray-600 text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="p-6 bg-gray-100 rounded-b-xl border-t border-gray-200">
                                        <button
                                            onClick={() => handleSubscribe(plan)}
                                            disabled={isLoading}
                                            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white transition-all transform active:scale-95 shadow ${plan.color} ${plan.hover} disabled:opacity-50 disabled:cursor-not-allowed`}
                                        >
                                            {selectedPlanId === plan.id && isLoading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </span>
                                            ) : (
                                                `Choose ${plan.name}`
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPopup;
