import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const PLANS = [
    {
        id: 'silver',
        name: 'Silver',
        price: 9.99,
        pitchLimit: 10,
        postLimit: 5,
        features: [
            '10 actions per month',
            'Basic Analytics',
            'Email Support'
        ],
        color: 'bg-gray-400',
        hover: 'hover:bg-gray-500',
        recommended: false
    },
    {
        id: 'platinum',
        name: 'Platinum',
        price: 49.99,
        pitchLimit: 20,
        postLimit: 20,
        features: [
            '20actions per month',
            'Advanced Analytics',
            'Priority Support',
            'Verified Badge'
        ],
        color: 'bg-indigo-500',
        hover: 'hover:bg-indigo-600',
        recommended: true
    },
    {
        id: 'gold',
        name: 'Gold',
        price: 99.99,
        pitchLimit: -1, // Unlimited
        postLimit: -1,
        features: [
            '99 actions per month',
            'Premium Analytics',
            '24/7 Dedicated Support',
            'Featured Profile',
            'Direct Investor Chat'
        ],
        color: 'bg-yellow-500',
        hover: 'hover:bg-yellow-600',
        recommended: false
    }
];

export const PlansGrid = ({ plans, handleSubscribe, loading }) => (
    <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-8">
        {plans.map((plan) => (
            <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-xl flex flex-col ${plan.recommended ? 'ring-4 ring-indigo-500 scale-105 z-10' : ''
                    }`}
            >
                {plan.recommended && (
                    <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md uppercase tracking-wide">
                        Recommended
                    </div>
                )}

                <div className="p-8 flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                        <span className="text-4xl font-extrabold text-gray-900">₹{plan.price}</span>
                        <span className="ml-1 text-xl text-gray-500">/month</span>
                    </div>

                    <p className="mt-2 text-sm text-gray-500 font-medium">
                        {plan.id === 'gold' ? 'Administrator Level Access' : 'Standard Access'}
                    </p>

                    <ul className="mt-6 space-y-4">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex">
                                <svg
                                    className="flex-shrink-0 h-6 w-6 text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="ml-3 text-gray-600 text-sm">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="p-8 bg-gray-50 rounded-b-2xl">
                    <button
                        onClick={() => handleSubscribe(plan)}
                        disabled={loading !== null}
                        className={`w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white transition-all duration-200 transform hover:scale-[1.02] shadow-lg ${plan.color} ${plan.hover} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading === plan.id ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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
);

export default function SubscriptionPlans() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(null);

    const handleSubscribe = (plan) => {
        setLoading(plan.id);

        // Simulate API call
        setTimeout(() => {
            toast.success(`Successfully subscribed to ${plan.name} plan!`);
            // Here you would typically redirect to a payment gateway or handle the subscription logic
            setLoading(null);
            navigate('/home');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Upgrade Your Plan
                    </h2>
                    <p className="mt-4 text-xl text-gray-600">
                        Choose the perfect plan to accelerate your startup's growth.
                    </p>
                </div>

                <PlansGrid plans={PLANS} handleSubscribe={handleSubscribe} loading={loading} />
            </div>
        </div>
    );
}
