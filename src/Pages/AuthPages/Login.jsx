import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  useLoginMutation,
  useLazyGetMeQuery,
} from "../../features/auth/authApiSlice";
import { selectIsAuth, setCredentials, selectCurrentUser } from "../../features/auth/authSlice";
import { apiSlice } from "../../store/apiSlice";
import { toast } from "sonner";
import { useFormik } from "formik";
import { loginSchema } from "../../Utils/validationSchemas";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [login, { isLoading, error: apiError }] = useLoginMutation();
  const [triggerGetMe] = useLazyGetMeQuery();
  const isAuth = useSelector(selectIsAuth);

  const error = apiError?.data?.message || apiError?.error || null;

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      role: "startup", // Default role
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      try {
        const data = await login({ email: values.email, password: values.password }).unwrap();
        dispatch(apiSlice.util.resetApiState());
        dispatch(setCredentials(data.user));
        toast.success("Login successful!");
      } catch (err) {
        console.error("Login failed:", err);
        toast.error(err?.data?.message || "Login failed");
      }
    },
  });

  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (isAuth && user) {
      if (user.role === 'admin') {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/home", { replace: true });
      }
    }
  }, [isAuth, navigate, user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("googleAuth") === "success") {
      triggerGetMe()
        .unwrap()
        .then((data) => {
          // Correctly extract user object to match authApiSlice behavior
          const user = data.user || data;
          dispatch(setCredentials(user));
          navigate("/home", { replace: true });
        })
        .catch((err) => {
          console.error("Failed to fetch user after Google login:", err);
        });
    }
  }, [location, triggerGetMe, dispatch, navigate]);

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

      {/* Main Container - Widened to eliminate scroll */}
      <div className="relative z-10 w-full max-w-6xl h-auto min-h-screen lg:min-h-[700px] lg:h-[700px] grid grid-cols-1 lg:grid-cols-2 bg-[#0a0a0a]/80 rounded-none lg:rounded-[40px] overflow-hidden border-0 lg:border border-white/10 backdrop-blur-xl shadow-2xl">

        {/* Left Section - OnlyPipe Branding & Active Step */}
        <div className="relative p-8 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-[#4c1d95]/90 to-[#1e1b4b]/90 min-h-[300px] lg:min-h-0">
          <div className="relative z-10">


            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight">
              Get Started <br /> with Us
            </h1>
            <p className="text-purple-100/60 text-base lg:text-lg mb-8 lg:mb-12 max-w-sm">
              Complete the registration step to access the VC platform and innovation network.
            </p>

            {/* Simplified Stepper: Showing only step 1 */}
            <div className="flex items-center gap-4 p-4 lg:p-5 rounded-2xl bg-white text-black shadow-xl w-fit pr-8 lg:pr-12 transition-transform hover:scale-105 duration-300">
              <span className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full bg-black text-white text-sm lg:text-base font-bold">1</span>
              <span className="font-bold text-xs lg:text-sm">Sign up your account</span>
            </div>
          </div>

          <div className="relative z-10 text-white/30 text-[10px] lg:text-xs font-medium tracking-widest uppercase mt-8 lg:mt-0">
            Founder–Investor Funding Platform
          </div>
        </div>

        {/* Right Section - Form Fields (Exactly as provided) */}
        <div className="p-8 lg:p-16 flex flex-col justify-center bg-black/20 overflow-y-auto">
          <div className="max-w-sm mx-auto w-full">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 text-center">Sign In</h3>
            <p className="text-gray-400 text-center mb-8 text-sm lg:text-base">Enter your credentials to continue</p>

            <form onSubmit={formik.handleSubmit} className="space-y-4 lg:space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="you@example.com"
                  className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.email && formik.errors.email ? "border-red-500" : "border-white/10"
                    } rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300`}
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-xs mt-1 ml-1">{formik.errors.email}</div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.password && formik.errors.password ? "border-red-500" : "border-white/10"
                    } rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300`}
                />
                {formik.touched.password && formik.errors.password && (
                  <div className="text-red-500 text-xs mt-1 ml-1">{formik.errors.password}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 mt-2 shadow-lg"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>

              {/* Google Sign In Section */}
              <div className="relative flex items-center justify-center py-4">
                <div className="w-full border-t border-white/10"></div>
                <span className="absolute bg-[#0a0a0a] px-3 text-[10px] text-gray-500 uppercase tracking-widest font-bold">Or</span>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-center">Join as a</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => formik.setFieldValue("role", "startup")}
                      className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all duration-300 ${formik.values.role === "startup"
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                        }`}
                    >
                      Startup
                    </button>
                    <button
                      type="button"
                      onClick={() => formik.setFieldValue("role", "investor")}
                      className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all duration-300 ${formik.values.role === "investor"
                        ? "bg-white text-black border-white"
                        : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                        }`}
                    >
                      Investor
                    </button>
                  </div>
                </div>

                <a
                  href={`http://localhost:5000/auth/google?userRole=${formik.values.role}`}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-3" alt="Google" />
                  Continue as {formik.values.role === "startup" ? "Startup" : "Investor"}
                </a>
              </div>

              {error && <p className="text-center text-xs text-red-400 mt-4 bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>}
            </form>

            {/* Links Section */}
            <div className="mt-10 flex flex-col items-center gap-3 text-xs font-medium border-t border-white/10 pt-6">
              <a href="/forgetPassword" title="Reset your password" className="text-gray-500 hover:text-white transition-colors">Forget password?</a>
              {/* <a href="/chnagepass" title="Reset your password" className="text-gray-500 hover:text-white transition-colors">Change password?</a> */}

              <div className="text-gray-600">
                Don't have an account? <a href="/register" className="text-white font-bold hover:underline ml-1">Register Now</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}