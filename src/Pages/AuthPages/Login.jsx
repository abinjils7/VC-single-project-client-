import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  useLoginMutation,
  useLazyGetMeQuery,
} from "../../features/auth/authApiSlice";
import { selectIsAuth, setCredentials } from "../../features/auth/authSlice";
import { apiSlice } from "../../store/apiSlice";

import { toast } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [login, { isLoading, error: apiError }] = useLoginMutation();
  const [triggerGetMe] = useLazyGetMeQuery();
  const isAuth = useSelector(selectIsAuth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  // Extract backend error safely
  const error = apiError?.data?.message || apiError?.error || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form).unwrap();
      dispatch(apiSlice.util.resetApiState()); // Clear any previous user's cache
      dispatch(setCredentials(data));
      toast.success("Login successful!");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err?.data?.message || "Login failed");
    }
  };

  useEffect(() => {
    if (isAuth) {
      navigate("/home", { replace: true });
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("googleAuth") === "success") {
      triggerGetMe()
        .unwrap()
        .then((data) => {
          dispatch(setCredentials(data));
          navigate("/home", { replace: true });
        })
        .catch((err) => {
          console.error("Failed to fetch user after Google login:", err);
        });
    }
  }, [location, triggerGetMe, dispatch, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* LEFT SIDE - Brand/Info Section */}
          <div className="md:w-2/5 relative p-10 text-white flex flex-col justify-between overflow-hidden min-h-[400px] md:min-h-full">
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
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl ring-1 ring-white/10">
                <h1 className="text-sm font-bold tracking-widest uppercase text-gray-300 mb-6">
                  VC Platform
                </h1>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-gray-400 drop-shadow-sm">
                  Welcome Back
                </h2>
                <p className="text-gray-100 text-lg font-light leading-relaxed">
                  Sign in to access your account and connect with the future of
                  innovation.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Form Section */}
          <div className="md:w-3/5 p-10">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign In</h3>
              <p className="text-gray-500 mb-8">
                Enter your credentials to continue
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </button>

                {/* Google Sign In Button */}

                {/* //model open fucntion slect role 
                next() api call */}

                <div className="mt-4">
                  <a
                    href="http://localhost:5000/auth/google"
                    className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <img
                      className="h-5 w-5 mr-2"
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google logo"
                    />
                    Sign in with Google
                  </a>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-center">
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  </div>
                )}
              </form>

              {/* Links Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col space-y-4">
                  {/* Forget Password Link */}
                  <div className="text-center">
                    <a
                      href="/forgetPassword"
                      className="text-sm text-gray-600 hover:text-black transition-colors inline-flex items-center justify-center"
                    >
                      <span>Forget password?</span>
                      <svg
                        className="w-3 h-3 ml-1"
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
                    </a>
                  </div>

                  {/* Change Password Link */}
                  <div className="text-center">
                    <a
                      href="/changePassword"
                      className="text-sm text-gray-600 hover:text-black transition-colors inline-flex items-center justify-center"
                    >
                      <span>Change password</span>
                      <svg
                        className="w-3 h-3 ml-1"
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
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
