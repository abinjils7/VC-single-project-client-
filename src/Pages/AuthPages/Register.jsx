import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useRegisterMutation } from "../../features/auth/authApiSlice";
import { selectIsAuth } from "../../features/auth/authSlice";

import { toast } from "react-hot-toast";

const ROLES = [
    { label: "Startup", value: "startup" },
    { label: "Funder / Investor", value: "investor" },
];

const INDUSTRIES = [
    "Technology",
    "SaaS",
    "FinTech",
    "HealthTech",
    "EdTech",
    "E-commerce",
    "AI / ML",
    "Web3 / Blockchain",
    "Logistics",
    "Climate / Energy",
    "Media",
    "Entertainment",
];

const STAGES = ["Idea", "Seed", "MVP", "Growth", "Scale"];

export default function Register() {
    const navigate = useNavigate();
    // eslint-disable-next-line no-unused-vars
    const [register, { isLoading: loading }] = useRegisterMutation();
    const isAuth = useSelector(selectIsAuth);

    useEffect(() => {
        if (isAuth) {
            // If auto-login after register, maybe go to home? But existing logic says /login
            navigate("/login");
        }
    }, [isAuth, navigate]);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "",
        displayName: "",
        description: "",
        category1: "",
        category2: "",
        stage: "",
        tokenValue: "", // For investors
        earningPotential: "", // For startups
    });

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = { ...form };

        // Clean up payload based on role
        if (form.role !== "startup") {
            delete payload.stage;
            delete payload.earningPotential;
        }

        if (form.role !== "investor") {
            delete payload.tokenValue;
        }

        console.log("REGISTER PAYLOAD:", payload);
        try {
            const response = await register(payload).unwrap();
            console.log("Registration successful:", response);
            toast.success("Registration successful! Please login.");
            navigate("/login");
        } catch (error) {
            console.error("Register failed", error);
            toast.error(error?.data?.message || "Registration failed. Please try again.");
        }
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden">
            <div className="w-full max-w-5xl h-[90vh] max-h-[800px] bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex h-full">
                    {/* Left side - Brand/Info */}
                    <div className="w-2/5 bg-gradient-to-br from-black to-gray-900 text-white flex flex-col p-8">
                        <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-8">
                                <div className="h-12 w-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                    <span className="text-2xl font-bold">R</span>
                                </div>
                                <h1 className="text-2xl font-bold">Register</h1>
                            </div>

                            <h2 className="text-3xl font-bold mb-6">Join Our Community</h2>
                            <p className="text-gray-300 text-lg mb-8">
                                Connect with{" "}
                                {form.role === "startup" ? "investors" : "startups"} that align
                                with your vision and goals.
                            </p>

                            {/* Dynamic benefits based on role */}
                            <div className="space-y-4 mb-10">
                                <div className="flex items-start">
                                    <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-1 shrink-0">
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-gray-300">
                                        {form.role === "startup"
                                            ? "Access to verified investors"
                                            : "Discover promising startups"}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-1 shrink-0">
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-gray-300">
                                        {form.role === "startup"
                                            ? "Showcase your earning potential to investors"
                                            : "Evaluate token-based investment opportunities"}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-1 shrink-0">
                                        <svg
                                            className="h-3 w-3"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span className="text-gray-300">
                                        Secure and private communication
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial */}
                        <div className="pt-6 border-t border-white/20">
                            <p className="text-gray-300 italic mb-3 text-sm">
                                {form.role === "startup"
                                    ? "Secured $2M funding by clearly showcasing our earning potential to the right investors."
                                    : "Found my perfect investor match within 48 hours of signing up."}
                            </p>
                            <div className="flex items-center">
                                <div className="h-8 w-8 bg-gray-300 rounded-full mr-3"></div>
                                <div>
                                    <p className="font-medium text-sm">
                                        {form.role === "startup" ? "Alex Rivera" : "Sarah Chen"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {form.role === "startup"
                                            ? "CEO, FinFlow Analytics"
                                            : "Founder, TechFlow AI"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Form */}
                    <div className="w-3/5 overflow-y-auto p-8">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">
                                Create Account
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Fill in your details to get started
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Split: Role + Name */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Role */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Role *
                                    </label>
                                    <select
                                        name="role"
                                        value={form.role}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        <option value="">Select Role</option>
                                        {ROLES.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Full Name *
                                    </label>
                                    <input
                                        name="name"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Split: Email + Password */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Email Address *
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Password *
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Display Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">
                                    {form.role === "startup"
                                        ? "Startup Name"
                                        : "Funder / Firm Name"}{" "}
                                    *
                                </label>
                                <input
                                    name="displayName"
                                    placeholder={
                                        form.role === "startup"
                                            ? "Your Startup Name"
                                            : "Your Fund or Company Name"
                                    }
                                    value={form.displayName}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">
                                    {form.role === "startup"
                                        ? "Startup Description"
                                        : "Profile Description"}{" "}
                                    *
                                </label>
                                <textarea
                                    name="description"
                                    placeholder={
                                        form.role === "startup"
                                            ? "Describe your startup, mission, and what makes you unique..."
                                            : "Describe your investment focus, experience, and interests..."
                                    }
                                    rows="2"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                    required
                                />
                            </div>

                            {/* Split: Categories */}
                            <div className="grid grid-cols-2 gap-4">
                                {/* Primary Industry */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Primary Industry *
                                    </label>
                                    <select
                                        name="category1"
                                        value={form.category1}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        <option value="">Select Industry</option>
                                        {INDUSTRIES.map((ind) => (
                                            <option key={ind} value={ind}>
                                                {ind}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Secondary Industry */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Secondary Industry *
                                    </label>
                                    <select
                                        name="category2"
                                        value={form.category2}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                        required
                                    >
                                        <option value="">Select Industry</option>
                                        {INDUSTRIES.map((ind) => (
                                            <option key={ind} value={ind}>
                                                {ind}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Conditional fields based on role */}
                            {form.role === "startup" && (
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Startup Stage */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 block">
                                            Startup Stage *
                                        </label>
                                        <select
                                            name="stage"
                                            value={form.stage}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                            required
                                        >
                                            <option value="">Select Stage</option>
                                            {STAGES.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Earning Potential for Startups */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 block">
                                            Assumed Earning Potential *
                                        </label>
                                        <div className="relative">
                                            <input
                                                name="earningPotential"
                                                type="text"
                                                placeholder="e.g., $1M - $5M ARR in 2 years"
                                                value={form.earningPotential}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <span className="text-gray-500 text-xs">per year</span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Projected annual revenue or growth expectations
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Token Value for Investors */}
                            {form.role === "investor" && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        Token Value / Investment Range *
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="tokenValue"
                                            type="text"
                                            placeholder="e.g., $50K - $500K per project"
                                            value={form.tokenValue}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <span className="text-gray-500 text-xs">USD</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Typical investment amount per startup or token value range
                                    </p>
                                </div>
                            )}

                            {/* Terms checkbox */}
                            <div className="flex items-center pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                                    required
                                />
                                <label htmlFor="terms" className="ml-2 text-xs text-gray-700">
                                    I agree to the{" "}
                                    <a
                                        href="/terms"
                                        className="text-black font-medium hover:underline"
                                    >
                                        Terms of Service
                                    </a>{" "}
                                    and{" "}
                                    <a
                                        href="/privacy"
                                        className="text-black font-medium hover:underline"
                                    >
                                        Privacy Policy
                                    </a>
                                </label>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 mt-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                Create Account
                            </button>
                        </form>

                        {/* Login link */}
                        <p className="text-center text-xs text-gray-500 mt-6 pt-6 border-t border-gray-200">
                            Already have an account?{" "}
                            <a
                                href="/login"
                                className="text-black font-semibold hover:text-gray-800 transition-colors inline-flex items-center"
                            >
                                Sign in here
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
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
