/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useChangePasswordMutation } from "../../features/auth/authApiSlice";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { changePasswordSchema } from "../../Utils/validationSchemas";

export default function ChangePassword() {
  const [messege, setmessege] = useState("");
  const [ChangePassword, { isLoading: loading }] = useChangePasswordMutation();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    validationSchema: changePasswordSchema,
    onSubmit: async (values) => {
      try {
        await ChangePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
          email: values.email
        }).unwrap();
        setmessege("password has been updated navigating to home ");
        navigate("/login");
      } catch (error) {
        console.log(error);
        setmessege(error?.data?.message || "Failed to update password");
      }
    },
  });

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

        {/* Left Section - Branding */}
        <div className="relative p-12 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-[#4c1d95]/90 to-[#1e1b4b]/90">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-16">
              <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="font-bold tracking-tight text-white text-xl">OnlyPipe</span>
            </div>

            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Secure Your <br /> Account
            </h1>
            <p className="text-purple-100/60 text-lg mb-12 max-w-sm">
              Choose a strong password you haven’t used before to keep your account safe.
            </p>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white text-black shadow-xl w-fit pr-12 transition-transform hover:scale-105 duration-300">
              <span className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white text-base font-bold">!</span>
              <span className="font-bold text-sm">Update Security</span>
            </div>
          </div>

          <div className="relative z-10 text-white/30 text-xs font-medium tracking-widest uppercase">
            Privacy & Protection
          </div>
        </div>

        {/* Right Section - Form */}
        <div className="p-10 lg:p-16 flex flex-col justify-center bg-black/20 overflow-y-auto">
          <div className="max-w-sm mx-auto w-full">
            <h3 className="text-3xl font-bold text-white mb-2 text-center">Set New Password</h3>
            <p className="text-gray-400 text-center mb-8 text-sm">Fill in your details to update credentials</p>

            <form className="space-y-4" onSubmit={formik.handleSubmit}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.email && formik.errors.email ? "border-red-500" : "border-white/10"} rounded-xl text-white text-sm focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all duration-300`}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Enter current password"
                  value={formik.values.currentPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.currentPassword && formik.errors.currentPassword ? "border-red-500" : "border-white/10"} rounded-xl text-white text-sm focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all duration-300`}
                />
                {formik.touched.currentPassword && formik.errors.currentPassword && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.currentPassword}</div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Enter new password"
                  value={formik.values.newPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.newPassword && formik.errors.newPassword ? "border-red-500" : "border-white/10"} rounded-xl text-white text-sm focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all duration-300`}
                />
                {formik.touched.newPassword && formik.errors.newPassword && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.newPassword}</div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Confirm Password</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  placeholder="Re-enter new password"
                  value={formik.values.confirmNewPassword}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.confirmNewPassword && formik.errors.confirmNewPassword ? "border-red-500" : "border-white/10"} rounded-xl text-white text-sm focus:border-purple-500/50 focus:bg-white/10 outline-none transition-all duration-300`}
                />
                {formik.touched.confirmNewPassword && formik.errors.confirmNewPassword && (
                  <div className="text-red-500 text-xs mt-1">{formik.errors.confirmNewPassword}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4 active:scale-[0.98] hover:bg-gray-100 transition-all duration-200 disabled:opacity-50 shadow-lg"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>

              {messege && (
                <span className={`text-sm mt-4 block text-center p-2 rounded-lg border ${messege.includes("faild") || messege.includes("Failed") ? "text-red-400 bg-red-400/10 border-red-400/20" : "text-green-400 bg-green-400/10 border-green-400/20"}`}>
                  {messege}
                </span>
              )}
            </form>

            <div className="mt-8 text-center border-t border-white/10 pt-6">
              <a
                href="/login"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Back
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}