import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function MaintenancePage() {
    const navigate = useNavigate();

    // Poll server every 5 seconds to check if maintenance is over
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch("http://localhost:5000/api/maintenance-status", {
                    credentials: "include",
                });
                const data = await res.json();
                if (!data.maintenanceMode) {
                    clearInterval(interval);
                    navigate("/home");
                }
            } catch (err) {
                console.log("Still checking...");
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [navigate]);

    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center font-sans text-white bg-black">

            {/* Background Video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-50"
            >
                <source src="/assets/Smooth_Floating_Space_Movement_Video.mp4" type="video/mp4" />
            </video>

            {/* Dark Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />

            {/* Main Content - Glass Card Design */}
            <div className="relative z-20 w-full max-w-lg p-8 mx-4">

                {/* Glass Container */}
                <div className="bg-[#121212]/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden relative group">

                    {/* Subtle Glow Effect on Hover */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Status Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                            <span className="text-xs font-medium tracking-wide text-white/80 uppercase">System Maintenance</span>
                        </div>
                        <span className="text-xs font-mono text-white/40">v2.4.0</span>
                    </div>

                    {/* Main Typography */}
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">
                        We are upgrading the platform.
                    </h1>

                    <p className="text-lg text-white/60 font-light leading-relaxed mb-8">
                        To ensure the best experience, we are performing scheduled updates. We will be back online shortly.
                    </p>

                    {/* Technical Details / Progress */}
                    <div className="space-y-4">
                        <div className="flex justify-between text-xs font-mono text-white/50 uppercase tracking-widest">
                            <span>Migration Progress</span>
                            <span>78%</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-[78%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        </div>

                        <div className="pt-6 flex gap-4 text-xs text-white/40 font-mono">
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>ETA: 15 Mins</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                                <span>Ref: #UP-2024</span>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

            {/* Minimal Footer */}
            <div className="absolute bottom-8 z-20 flex gap-6 text-xs font-medium tracking-widest text-white/30 uppercase">
                <span>Status Page</span>
                <span>Support</span>
                <span>Twitter</span>
            </div>

        </div>
    );
}