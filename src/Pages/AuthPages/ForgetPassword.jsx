import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useResetPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "../../features/auth/authApiSlice";
import { useFormik } from "formik";
import { forgotPasswordSchema, resetPasswordSchema } from "../../Utils/validationSchemas";

export default function ForgotPassword() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [errorMessage, seterorrmessege] = useState("");
  const [message, setmessege] = useState("");
  const [otp, setotp] = useState(Array(6).fill(""));
  const [isverified, setisverified] = useState(false);

  const [sendOtp, { isLoading }] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [resetPassword] = useResetPasswordMutation();

  const navigate = useNavigate();

  useEffect(() => {
    if (timeLeft === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const forgotFormik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      try {
        await sendOtp({ email: values.email }).unwrap();
        setmessege("OTP SENT TO YOUR EMAIL");
        seterorrmessege("");
        setTimeLeft(30);
      } catch (error) {
        seterorrmessege(error?.data?.message || "Failed to send OTP");
      }
    },
  });

  const resetFormik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values) => {
      try {
        await resetPassword({ email: forgotFormik.values.email, newPassword: values.password }).unwrap();
        navigate("/login");
      } catch (error) {
        console.log(error);
        seterorrmessege(error?.data?.message || "Failed to reset password");
      }
    },
  });

  const handleverification = async () => {
    try {
      const finalOtp = otp.join("");
      if (finalOtp.length !== 6) {
        seterorrmessege("Please enter full OTP");
        return;
      }
      await verifyOtp({
        email: forgotFormik.values.email,
        otp: finalOtp,
      }).unwrap();
      setisverified(true);
      seterorrmessege("");
    } catch (error) {
      seterorrmessege("Invalid or expired OTP");
      console.log(error);
    }
  };

  return (
    <div className="h-screen w-full relative flex items-center justify-center p-4 overflow-hidden bg-black">
      {/* Global Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60"
        >
          <source src="/assets/Smooth_Floating_Space_Movement_Video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl h-[650px] grid grid-cols-1 lg:grid-cols-2 bg-[#0a0a0a]/80 rounded-[40px] overflow-hidden border border-white/10 backdrop-blur-xl shadow-2xl">

        {/* Left Section - Branding & Dynamic Text */}
        <div className="relative p-12 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-[#4c1d95]/90 to-[#1e1b4b]/90">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16">
              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="font-bold tracking-tight text-white text-xl">Venture Capital</span>
            </div>

            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              {isverified ? "Security" : "Recovery"} <br /> Center
            </h1>
            <h2 className="text-2xl font-semibold text-purple-100/90 mb-4">
              {isverified ? "Create New Password" : "Forgot Your Password?"}
            </h2>
            <p className="text-purple-100/60 text-lg mb-12 max-w-sm">
              {isverified
                ? "Set a strong new password to secure your account."
                : "Enter your email and we'll send you a verification code."}
            </p>
          </div>

          <div className="relative z-10 text-white/30 text-xs font-medium tracking-widest uppercase">
            OTP-Based Verification System
          </div>
        </div>

        {/* Right Section - Form Flow */}
        <div className="p-10 lg:p-16 flex flex-col justify-center bg-black/20 overflow-y-auto">
          <div className="max-w-sm mx-auto w-full">

            {!isverified && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <form className="space-y-4" onSubmit={forgotFormik.handleSubmit}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Registered Email</label>
                    <input
                      type="email"
                      name="email"
                      value={forgotFormik.values.email}
                      onChange={forgotFormik.handleChange}
                      onBlur={forgotFormik.handleBlur}
                      placeholder="you@example.com"
                      className={`w-full px-4 py-3 bg-white/5 border ${forgotFormik.touched.email && forgotFormik.errors.email ? "border-red-500" : "border-white/10"} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                    />
                    {forgotFormik.touched.email && forgotFormik.errors.email && (
                      <div className="text-red-500 text-xs mt-1">{forgotFormik.errors.email}</div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={timeLeft > 0 || isLoading}
                    className={`w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${timeLeft > 0 || isLoading
                      ? "bg-white/10 text-gray-500 cursor-not-allowed border border-white/5"
                      : "bg-white text-black hover:bg-gray-100 shadow-lg"
                      }`}
                  >
                    {isLoading ? "Sending..." : timeLeft > 0 ? `Resend in ${timeLeft}s` : "Send Verification Code"}
                  </button>
                </form>

                {message && (
                  <div className="space-y-6 animate-in slide-in-from-top duration-500">
                    <div className="w-full border-t border-white/10 pt-6">
                      <h4 className="text-sm font-bold text-white mb-6 text-center uppercase tracking-widest">
                        Enter 6-Digit Code
                      </h4>
                      <div className="flex justify-between gap-2 mb-6">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-input-${index}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!/^\d*$/.test(val)) return;
                              const newOtp = [...otp];
                              newOtp[index] = val;
                              setotp(newOtp);
                              if (val && index < 5) {
                                document.getElementById(`otp-input-${index + 1}`)?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace" && !otp[index] && index > 0) {
                                document.getElementById(`otp-input-${index - 1}`)?.focus();
                              }
                            }}
                            className="h-12 w-full bg-white/5 border border-white/10 rounded-lg text-center text-white text-xl font-bold focus:border-purple-500 focus:bg-white/10 outline-none transition-all"
                          />
                        ))}
                      </div>
                      <button
                        onClick={handleverification}
                        className="w-full py-3.5 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-all active:scale-[0.98]"
                      >
                        Verify Code
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isverified && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                <form onSubmit={resetFormik.handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">New Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter strong password"
                      value={resetFormik.values.password}
                      onChange={resetFormik.handleChange}
                      onBlur={resetFormik.handleBlur}
                      className={`w-full px-4 py-3 bg-white/5 border ${resetFormik.touched.password && resetFormik.errors.password ? "border-red-500" : "border-white/10"} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                    />
                    {resetFormik.touched.password && resetFormik.errors.password && (
                      <div className="text-red-500 text-xs mt-1">{resetFormik.errors.password}</div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Repeat new password"
                      value={resetFormik.values.confirmPassword}
                      onChange={resetFormik.handleChange}
                      onBlur={resetFormik.handleBlur}
                      className={`w-full px-4 py-3 bg-white/5 border ${resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword ? "border-red-500" : "border-white/10"} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                    />
                    {resetFormik.touched.confirmPassword && resetFormik.errors.confirmPassword && (
                      <div className="text-red-500 text-xs mt-1">{resetFormik.errors.confirmPassword}</div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4 active:scale-[0.98] hover:bg-gray-100 transition-all shadow-lg"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 p-3 rounded-lg bg-red-400/10 border border-red-400/20 text-center text-red-400 text-xs font-medium">
                {errorMessage}
              </div>
            )}

            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <a href="/login" className="text-xs text-gray-500 hover:text-white transition-colors">
                Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}