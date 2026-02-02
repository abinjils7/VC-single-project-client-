
import { useState } from "react";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* LEFT SIDE - INFO */}
          <div className="lg:w-2/5 bg-gradient-to-br from-black to-gray-900 p-10 text-white flex flex-col justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-8">Reset Password</h1>
              <h2 className="text-3xl font-bold mb-4">
                Create a New Password
              </h2>
              <p className="text-gray-300 text-lg">
                Choose a strong password that you haven’t used before to keep
                your account secure.
              </p>
            </div>

            <p className="text-gray-400 text-sm">
              Your new password should be at least 8 characters long.
            </p>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div className="lg:w-3/5 p-10">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Set New Password
              </h3>
              <p className="text-gray-500 mb-8">
                Enter and confirm your new password
              </p>

              <form className="space-y-6">
                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-black focus:border-transparent
                      transition-colors"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg
                      focus:ring-2 focus:ring-black focus:border-transparent
                      transition-colors"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-black text-white
                    font-semibold hover:bg-gray-800 transition"
                >
                  Update Password
                </button>
              </form>

              {/* Back to login */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <a
                  href="/login"
                  className="text-sm text-gray-600 hover:text-black transition-colors inline-flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2 rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                  Back to Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
