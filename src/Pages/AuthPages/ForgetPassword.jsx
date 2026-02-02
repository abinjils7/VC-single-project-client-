import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useResetPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "../../features/auth/authApiSlice";

export default function ForgotPassword() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [useremail, setuseremail] = useState("");
  const [errorMessage, seterorrmessege] = useState("");
  const [message, setmessege] = useState("");
  const [otp, setotp] = useState(Array(6).fill(""));
  const [isverified, setisverified] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!useremail) return;

    try {
      await sendOtp({ email: useremail }).unwrap();
      setmessege("OTP SENT TO YOUR EMAIL");
      seterorrmessege("");
      setTimeLeft(30);
    } catch (error) {
      seterorrmessege(error?.data?.message || "Failed to send OTP");
    }
  };

  const handleverification = async () => {
    try {
      const finalOtp = otp.join("");

      if (finalOtp.length !== 6) {
        seterorrmessege("Please enter full OTP");
        return;
      }

      await verifyOtp({
        email: useremail,
        otp: finalOtp,
      }).unwrap();

      setisverified(true); // ✅ FIX
      seterorrmessege("");
    } catch (error) {
      seterorrmessege("Invalid or expired OTP");
      console.log(error);
    }
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      seterorrmessege("newPassword and confirmPassword must be same");
    }
    try {
      await resetPassword({ email: useremail, newPassword: newPassword });
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* LEFT SIDE */}
          <div className="lg:w-2/5 relative p-10 text-white flex flex-col justify-between overflow-hidden min-h-[400px] lg:min-h-full">
            {/* Background Image */}
            <div
              className="absolute inset-0 z-0 transition-transform duration-1000 hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://github.com/images/signup/tres-amigos@2x.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-0" />

            {/* Glass Content */}
            <div className="relative z-10 flex flex-col justify-center h-full">
              <h1 className="text-sm font-bold tracking-widest uppercase text-gray-300 mb-6">
                Reset Password
              </h1>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400 drop-shadow-sm">
                {isverified ? "Create New Password" : "Forgot Your Password?"}
              </h2>
              <p className="text-gray-100 text-lg font-light leading-relaxed">
                {isverified
                  ? "Set a strong new password to secure your account."
                  : "Enter your email and we’ll send you a verification code."}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="lg:w-3/5 p-10">
            <div className="max-w-md mx-auto">
              {/* ================= EMAIL + OTP SECTION ================= */}
              {!isverified && (
                <>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <input
                      type="email"
                      value={useremail}
                      onChange={(e) => setuseremail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                      required
                    />

                    <button
                      type="submit"
                      disabled={timeLeft > 0 || isLoading}
                      className={`w-full py-3 rounded-lg font-semibold ${
                        timeLeft > 0 || isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      {isLoading
                        ? "Sending..."
                        : timeLeft > 0
                          ? `Resend in ${timeLeft}s`
                          : "Send Verification Code"}
                    </button>
                  </form>

                  {message && (
                    <div className="mt-10 pt-8 border-t border-gray-200">
                      <h4 className="text-xl font-bold text-center mb-6">
                        Enter Verification Code
                      </h4>

                      <div className="flex justify-center gap-3 mb-8">
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

                              // Auto-focus next input
                              if (val && index < 5) {
                                document
                                  .getElementById(`otp-input-${index + 1}`)
                                  ?.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              if (
                                e.key === "Backspace" &&
                                !otp[index] &&
                                index > 0
                              ) {
                                document
                                  .getElementById(`otp-input-${index - 1}`)
                                  ?.focus();
                              }
                            }}
                            className="h-14 w-14 border rounded-lg text-center text-xl font-semibold focus:ring-2 focus:ring-black"
                          />
                        ))}
                      </div>

                      <button
                        onClick={handleverification}
                        className="w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800"
                      >
                        Verify Code
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* ================= RESET PASSWORD SECTION ================= */}
              {isverified && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-center">
                    Set New Password
                  </h3>

                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                  />

                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
                  />

                  <button
                    className="w-full py-3 rounded-lg bg-black text-white font-semibold hover:bg-gray-800"
                    onClick={updatePassword}
                  >
                    Update Password
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="mt-4 text-center text-red-600 font-medium">
                  {errorMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
