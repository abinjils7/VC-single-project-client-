import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRegisterMutation } from "../../features/auth/authApiSlice";
import { selectIsAuth } from "../../features/auth/authSlice";
import { toast } from "sonner";
import { useFormik } from "formik";
import { registerSchema } from "../../Utils/validationSchemas";

const ROLES = [
    { label: "Startup", value: "startup" },
    { label: "Funder / Investor", value: "investor" },
];

const INDUSTRIES = [
    "Technology", "SaaS", "FinTech", "HealthTech", "EdTech", "E-commerce",
    "AI / ML", "Web3 / Blockchain", "Logistics", "Climate / Energy", "Media", "Entertainment",
];

const STAGES = ["Idea", "Seed", "MVP", "Growth", "Scale"];

export default function Register() {
    const navigate = useNavigate();
    const [register, { isLoading: loading }] = useRegisterMutation();
    const isAuth = useSelector(selectIsAuth);

    useEffect(() => {
        if (isAuth) {
            navigate("/login");
        }
    }, [isAuth, navigate]);

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            password: "",
            role: "startup", // Default role
            displayName: "",
            description: "",
            category1: "",
            category2: "",
            stage: "Idea", // Default stage
            tokenValue: "",
            earningPotential: "",
        },
        validationSchema: registerSchema,
        onSubmit: async (values) => {
            const payload = { ...values };
            // Clean up payload based on role
            if (values.role !== "startup") {
                delete payload.stage;
                delete payload.earningPotential;
            }
            if (values.role !== "investor") {
                delete payload.tokenValue;
            }

            try {
                await register(payload).unwrap();
                toast.success("Registration successful! Please login.");
                navigate("/login");
            } catch (error) {
                toast.error(error?.data?.message || "Registration failed.");
            }
        },
    });

    return (
        <div className="h-screen w-full relative flex items-center justify-center p-4 overflow-hidden bg-black">
            {/* Global Video Background */}
            <div className="absolute inset-0 z-0">
                <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60">
                    <source src="/assets/Smooth_Floating_Space_Movement_Video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
            </div>

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-6xl h-auto min-h-screen lg:min-h-[85vh] lg:h-[85vh] grid grid-cols-1 lg:grid-cols-2 bg-[#0a0a0a]/80 rounded-none lg:rounded-[40px] overflow-hidden border-0 lg:border border-white/10 backdrop-blur-xl shadow-2xl">

                {/* Left Side: Brand/Info */}
                <div className="relative p-8 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-[#4c1d95]/90 to-[#1e1b4b]/90 min-h-[300px] lg:min-h-0">
                    <div className="relative z-10">


                        <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 lg:mb-6 leading-tight animate-in fade-in slide-in-from-left duration-700">
                            Join Our <br /> Community
                        </h1>
                        <p className="text-purple-100/60 text-base lg:text-lg mb-8 lg:mb-10 max-w-sm">
                            Connect with {formik.values.role === "startup" ? "investors" : "startups"} that align with your vision.
                        </p>

                        <div className="flex items-center gap-4 p-4 lg:p-5 rounded-2xl bg-white text-black shadow-xl w-fit pr-8 lg:pr-10 transition-transform hover:scale-105 duration-300">
                            <span className="w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-full bg-black text-white text-sm lg:text-base font-bold">1</span>
                            <span className="font-bold text-xs lg:text-sm">Sign up your account</span>
                        </div>
                    </div>

                    <div className="relative z-10 pt-6 border-t border-white/10 mt-8 lg:mt-0">
                        <p className="text-gray-300 italic text-xs lg:text-sm mb-2">
                            {formik.values.role === "startup"
                                ? "Secured $2M funding by showcasing our potential."
                                : "Found the perfect match within 48 hours."}
                        </p>
                        <p className="text-white font-bold text-[10px] lg:text-xs uppercase tracking-widest">
                            {formik.values.role === "startup" ? "Alex Rivera — CEO" : "Sarah Chen — Founder"}
                        </p>
                    </div>
                </div>

                {/* Right Side: Form (Scrollable content inside fixed container) */}
                <div className="p-8 lg:p-14 flex flex-col bg-black/20 overflow-y-auto">
                    <div className="w-full">
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-white">Create Account</h3>
                            <p className="text-gray-500 text-sm">Fill in your details to get started</p>
                        </div>

                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Role *</label>
                                    <select
                                        name="role"
                                        value={formik.values.role}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all"
                                    >
                                        <option value="" className="bg-[#0a0a0a]">Select Role</option>
                                        {ROLES.map((r) => <option key={r.value} value={r.value} className="bg-[#0a0a0a]">{r.label}</option>)}
                                    </select>
                                    {formik.touched.role && formik.errors.role && (
                                        <div className="text-red-500 text-xs mt-1">{formik.errors.role}</div>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Full Name *</label>
                                    <input
                                        name="name"
                                        placeholder="John Doe"
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                                    />
                                    {formik.touched.name && formik.errors.name && (
                                        <div className="text-red-500 text-xs mt-1">{formik.errors.name}</div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Email Address *</label>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="text-red-500 text-xs mt-1">{formik.errors.email}</div>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Password *</label>
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formik.values.password}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                                    />
                                    {formik.touched.password && formik.errors.password && (
                                        <div className="text-red-500 text-xs mt-1">{formik.errors.password}</div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">{formik.values.role === "startup" ? "Startup Name" : "Funder / Firm Name"} *</label>
                                <input
                                    name="displayName"
                                    value={formik.values.displayName}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    placeholder={formik.values.role === "startup" ? "Your Startup Name" : "Your Fund Name"}
                                    className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.displayName && formik.errors.displayName ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                                />
                                {formik.touched.displayName && formik.errors.displayName && (
                                    <div className="text-red-500 text-xs mt-1">{formik.errors.displayName}</div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Description *</label>
                                <textarea
                                    name="description"
                                    rows="2"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all resize-none`}
                                />
                                {formik.touched.description && formik.errors.description && (
                                    <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Primary Industry *</label>
                                    <select
                                        name="category1"
                                        value={formik.values.category1}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.category1 && formik.errors.category1 ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                                    >
                                        <option value="" className="bg-[#0a0a0a]">Select Industry</option>
                                        {INDUSTRIES.map((ind) => <option key={ind} value={ind} className="bg-[#0a0a0a]">{ind}</option>)}
                                    </select>
                                    {formik.touched.category1 && formik.errors.category1 && (
                                        <div className="text-red-500 text-xs mt-1">{formik.errors.category1}</div>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Secondary Industry *</label>
                                    <select
                                        name="category2"
                                        value={formik.values.category2}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.category2 && formik.errors.category2 ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                                    >
                                        <option value="" className="bg-[#0a0a0a]">Select Industry</option>
                                        {INDUSTRIES.map((ind) => <option key={ind} value={ind} className="bg-[#0a0a0a]">{ind}</option>)}
                                    </select>
                                    {formik.touched.category2 && formik.errors.category2 && (
                                        <div className="text-red-500 text-xs mt-1">{formik.errors.category2}</div>
                                    )}
                                </div>
                            </div>

                            {formik.values.role === "startup" && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Startup Stage *</label>
                                        <select
                                            name="stage"
                                            value={formik.values.stage}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.stage && formik.errors.stage ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                                        >
                                            <option value="" className="bg-[#0a0a0a]">Select Stage</option>
                                            {STAGES.map((s) => <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>)}
                                        </select>
                                        {formik.touched.stage && formik.errors.stage && (
                                            <div className="text-red-500 text-xs mt-1">{formik.errors.stage}</div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Earning Potential *</label>
                                        <input
                                            name="earningPotential"
                                            value={formik.values.earningPotential}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="$1M ARR"
                                            className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.earningPotential && formik.errors.earningPotential ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                                        />
                                        {formik.touched.earningPotential && formik.errors.earningPotential && (
                                            <div className="text-red-500 text-xs mt-1">{formik.errors.earningPotential}</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {formik.values.role === "investor" && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 ml-1 uppercase">Investment Range *</label>
                                    <input
                                        name="tokenValue"
                                        value={formik.values.tokenValue}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        placeholder="$50K - $500K"
                                        className={`w-full px-4 py-3 bg-white/5 border ${formik.touched.tokenValue && formik.errors.tokenValue ? 'border-red-500' : 'border-white/10'} rounded-xl text-white text-sm focus:border-purple-500/50 outline-none transition-all`}
                                    />
                                    {formik.touched.tokenValue && formik.errors.tokenValue && (
                                        <div className="text-red-500 text-xs mt-1">{formik.errors.tokenValue}</div>
                                    )}
                                </div>
                            )}

                            <button type="submit" disabled={loading} className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4 active:scale-[0.98] hover:bg-gray-100 transition-all duration-200 disabled:opacity-50">
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>

                        <p className="text-center mt-8 text-xs text-gray-500">
                            Already have an account? <a href="/login" className="text-white font-bold hover:underline ml-1">Sign in here</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}