import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";
import { PLANS } from "../Pages/SubscriptionPages/SubscriptionPlans";
import { toast } from "sonner";
import { useSubscribeMutation } from "../features/auth/authApiSlice";

const SubscriptionPopup = ({ isOpen: controlledIsOpen, onClose: controlledOnClose }) => {
  const user = useSelector(selectCurrentUser);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const [hasClosed, setHasClosed] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [loading, setLoading] = useState(null);

  // Determine if controlled or uncontrolled
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  // Use RTK Query mutation
  const [subscribe, { isLoading }] = useSubscribeMutation();
  const dispatch = useDispatch();

  // Check pitch limit (Only for uncontrolled mode)
  useEffect(() => {
    if (isControlled) return;

    // Handle case where user might be wrapped in { user: ... } or direct
    const actualUser = user?.user || user;

    if (actualUser && actualUser.pitchLimit <= 0 && !hasClosed) {
      setInternalIsOpen(true);
    } else {
      setInternalIsOpen(false);
    }
  }, [user, hasClosed, isControlled]);

  // Countdown logic (Only for uncontrolled mode)
  useEffect(() => {
    if (isControlled) return;

    let timer;
    if (isOpen && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, countdown, isControlled]);

  const handleClose = () => {
    if (isControlled) {
      if (controlledOnClose) controlledOnClose();
    } else {
      if (countdown === 0) {
        setInternalIsOpen(false);
        setHasClosed(true);
      }
    }
  };

  const handleSubscribe = async (plan) => {

    try {

      setLoading(plan.id);

      const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/payment/create-order`;
      console.log("Initiating Payment to:", apiUrl);
      console.log("Plan Details:", plan);

      // 1. Create Razorpay order from backend
      const response = await fetch(
        apiUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // important if using cookies
          body: JSON.stringify({
            amount: plan.price,
            planId: plan.id,
          }),
        }
      );

      console.log("Create Order Response Status:", response.status);

      const order = await response.json();

      if (!order.id) {
        throw new Error("Order creation failed");
      }

      // 2. Razorpay checkout options
      const options = {

        key: import.meta.env.VITE_RAZORPAY_KEY_ID,

        amount: order.amount,

        currency: order.currency,

        name: "Startup Platform",

        description: `${plan.name} Subscription`,

        order_id: order.id,

        handler: async function (razorpayResponse) {

          try {

            // 3. Verify payment with backend
            const verifyResponse = await fetch(
              `${import.meta.env.VITE_BACKEND_URL}/api/payment/verify-payment`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  ...razorpayResponse,
                  planId: plan.id,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {

              toast.success(`Successfully subscribed to ${plan.name}`);
              setIsOpen(false);
              setHasClosed(true);

              navigate("/home");

            } else {
              console.error("Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error", err);
          }
        },

        modal: {
          ondismiss: function () {

            toast.error("Payment cancelled");

          }
        },

        theme: {
          color: "#6366F1",
        },

        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999"
        },
        retry: {
          enabled: false
        }
      };

      // 4. Open Razorpay
      const razorpay = new window.Razorpay(options);

      razorpay.open();

    } catch (error) {
      console.error("Payment Process Error:", error);
      console.log("Error details:", error.message, error.stack);
      console.log("Using Backend URL:", import.meta.env.VITE_BACKEND_URL);

      toast.error("Payment failed. Check console for details.");
    } finally {
      setLoading(null);
    }
  };

  const handleFreeTrial = async () => {
    try {
      setLoading("free-trial");
      const result = await subscribe({ isFreeTrial: true }).unwrap();
      toast.success(result.message);
      setIsOpen(false);
      setHasClosed(true);
    } catch (error) {
      console.error("Free trial error:", error);
      toast.error(error?.data?.message || "Failed to activate free trial");
    } finally {
      setLoading(null);
    }
  };


  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto font-sans"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay - Darker for the theme */}
        <div
          className="fixed inset-0 bg-[#050505] bg-opacity-90 transition-opacity backdrop-blur-sm"
          aria-hidden="true"
        ></div>

        {/* Center modal */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Main Modal Container - Dark Theme */}
        <div className="inline-block align-bottom bg-[#0f1016] rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full p-8 relative border border-white/10">
          {/* Top right close button */}
          <button
            onClick={handleClose}
            disabled={!isControlled && countdown > 0}
            className={`absolute top-6 right-6 text-gray-400 hover:text-white transition-colors focus:outline-none ${!isControlled && countdown > 0 ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span className="sr-only">Close</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-white/10 pb-6">
            <div>
              <h3
                className="text-3xl font-bold text-white mb-2"
                id="modal-title"
              >
                Choose your plan
              </h3>
              <p className="text-gray-400 text-lg">
                Unlock endless possibilities
              </p>
            </div>

            <div className="mt-4 sm:mt-0 flex items-center gap-4">
              <span className="text-red-400 font-medium text-sm">
                You've run out of Pitches!
              </span>
              {user && !user.hasUsedFreeTrial && (
                <button
                  onClick={handleFreeTrial}
                  disabled={loading === "free-trial"}
                  className="px-6 py-2 rounded-full font-medium text-white bg-green-500/10 text-green-400 border border-green-500/50 hover:bg-green-500 hover:text-white transition-all"
                >
                  {loading === "free-trial" ? "Activating..." : "Continue with Free Trial"}
                </button>
              )}
              <button
                onClick={handleClose}
                disabled={!isControlled && countdown > 0}
                className={`px-6 py-2 rounded-full font-medium text-white transition-all
                                    ${!isControlled && countdown > 0
                    ? "bg-white/10 text-gray-400 cursor-not-allowed"
                    : "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white"
                  }`}
              >
                {!isControlled && countdown > 0 ? `Close in ${countdown}s` : "Close"}
              </button>
            </div>
          </div>

          <div className="mt-2">
            {/* Grid of Plans */}
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl p-1 transition-all duration-300
                                        ${plan.recommended
                      ? "bg-linear-to-b from-white/10 to-transparent shadow-2xl shadow-purple-900/20"
                      : "bg-transparent"
                    }`}
                >
                  <div
                    className={`flex-1 flex flex-col bg-[#18181b] rounded-[1.3rem] border border-white/5 p-8 hover:border-white/20 transition-colors h-full`}
                  >
                    {plan.recommended && (
                      <div className="absolute top-5 right-5">
                        <span className="bg-white/10 border border-white/10 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                          Popular
                        </span>
                      </div>
                    )}

                    <h3
                      className={`text-2xl font-bold mb-2 ${plan.recommended ? "text-purple-300" : "text-white"}`}
                    >
                      {plan.name}
                    </h3>

                    {/* Description placeholder if needed, relying on visual hierarchy for now */}
                    <p className="text-gray-400 text-sm mb-6 h-10">
                      {plan.name === "Basic" &&
                        "For personal use and exploration of AI technology."}
                      {plan.name === "Premium" &&
                        "Perfect for professionals and small businesses."}
                      {plan.name === "Enterprise" &&
                        "For large businesses requiring specialized support."}
                    </p>

                    <div className="mb-6 flex items-baseline">
                      <span className="text-5xl font-bold text-white tracking-tight">
                        ₹{plan.price}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 ml-2">/month</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <ul className="space-y-4">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-start">
                            {/* Custom Checkmark Style: Solid Teal Circle */}
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="h-5 w-5 rounded-full bg-[#2dd4bf] flex items-center justify-center">
                                <svg
                                  className="h-3.5 w-3.5 text-black font-bold"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            </div>
                            <span className="ml-3 text-gray-300 text-sm font-medium leading-5">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8">
                      <button
                        onClick={() => handleSubscribe(plan)}
                        disabled={isLoading}
                        className={`w-full flex items-center justify-center px-4 h-12 text-sm font-bold rounded-full transition-all transform active:scale-95
                                                    ${plan.recommended
                            ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25 border-none"
                            : plan.name ===
                              "Enterprise" ||
                              plan.price > 50 // Detecting Enterprise logic visually
                              ? "bg-transparent border border-white/20 text-white hover:bg-white/5"
                              : "bg-white/10 text-white hover:bg-white/20 border border-transparent"
                          } 
                                                    disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {selectedPlanId === plan.id && isLoading ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Processing...
                          </span>
                        ) : plan.name === "Enterprise" ? (
                          "Contact sale"
                        ) : (
                          "Get started"
                        )}
                      </button>
                    </div>
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
