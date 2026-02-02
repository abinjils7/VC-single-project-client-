/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useChangePasswordMutation } from "../../features/auth/authApiSlice";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setemail] = useState("");
  const [messege, setmessege] = useState("");

  const [ChangePassword, { isLoading: loading }] = useChangePasswordMutation();

  const navigate = useNavigate();
  const handleChangepass = async (e) => {
    e.preventDefault();

    try {
      console.log(currentPassword, newPassword, email, confirmPassword);
      if (newPassword != confirmPassword) {
        return setmessege("new password confirmation faild try again");
      }
      await ChangePassword({ currentPassword, newPassword, email }).unwrap();
      setmessege("password has been updated navigating to home ");
      navigate("/login");
    } catch (error) {
      console.log(error);
      setmessege(error?.data?.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center">
          Set New Password
        </h2>
        <p className="text-sm text-gray-600 text-center mt-2">
          Choose a strong password you haven’t used before.
        </p>

        {/* Form */}

        <form className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              onChange={(e) => setemail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border bSorder-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              current Password
            </label>
            <input
              type="password"
              placeholder="Enter youre current password"
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border bSorder-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
            />
          </div>
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password"
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter new password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            onClick={handleChangepass}
          >
            Update Password
          </button>
          <span className="text-red-500 text-sm mt-2 block text-center">{messege}</span>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}
