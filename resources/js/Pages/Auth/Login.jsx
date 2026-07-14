import React, { useState } from "react";
import InputError from "@/Components/InputError";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Coffee, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login({ status, canResetPassword }) {
    const { settings } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen w-full bg-[#fbf8f5] select-none">
            <Head title="Welcome Back - Log in" />

            {/* Left Side: Brand Panel */}
            <div className="w-full md:w-1/2 bg-gradient-to-br from-[#4e2d27] to-[#2f1915] p-8 md:p-16 lg:p-24 flex flex-col justify-between relative overflow-hidden">
                {/* Background ambient lighting/circle */}
                <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#5a3630]/20 blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#5a3630]/10 blur-3xl" />

                {/* Top: Logo & Title */}
                <div className="flex items-center gap-4 relative z-10">
                    <div className="flex items-center justify-center bg-card p-3 rounded-xl text-[#3c221e] text-2xl font-extrabold shadow-md">
                        <img className="w-20" src={settings?.logo_url || "/images/logo.svg"} alt="Logo" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-5xl font-black text-white tracking-wide leading-tight">
                            <span className="text-secondary-dark">{settings?.store_name || "TOS"}</span>
                        </span>
                        <span className="text-base font-bold tracking-widest text-[#d8af91]">
                            COFFEE POS
                        </span>
                    </div>
                </div>

                {/* Middle: Feature Info */}
                <div className="space-y-6 max-w-md my-auto py-16 relative z-10">
                    <div className="text-[#d8af91] animate-pulse">
                        <Coffee size={48} className="stroke-[1.5]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                        Brewed for <br />
                        busy mornings.
                    </h1>
                    <p className="text-sm md:text-base text-[#e5d4cb] font-medium leading-relaxed">
                        A modern point-of-sale built for cafés — orders, kitchen and invoices in one warm dashboard.
                    </p>
                </div>

                {/* Bottom: Copyright Footer */}
                <div className="text-xs text-[#ae958b] font-medium relative z-10">
                    &copy; 2026 {settings?.store_name || "TOS SAK"}
                </div>
            </div>

            {/* Right Side: Form Panel */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-16 lg:p-24 bg-[#fcf9f7]">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#eadfda] p-8 space-y-6 transform transition duration-300 hover:scale-[1.01]">
                    {/* Header */}
                    <div className="space-y-1.5">
                        <h2 className="text-3xl font-extrabold text-primary-text tracking-tight">
                            Welcome back
                        </h2>
                        <p className="text-xs font-bold text-secondary-dark uppercase tracking-wider">
                            Sign in to manage your shop
                        </p>
                    </div>

                    {status && (
                        <div className="bg-success-bg border border-success/20 text-success text-xs font-semibold rounded-xl p-3 text-center">
                            {status}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={submit} className="space-y-5">
                        {/* Email Address */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="email"
                                className="block text-[10px] font-black text-[#5a3630] uppercase tracking-wider"
                            >
                                Email
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <Mail size={18} className="stroke-[2]" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full rounded-2xl border-0 bg-[#fbf8f6] py-3.5 pl-12 pr-4 text-sm font-semibold text-[#2f1a16] placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-[#5a3630] transition shadow-inner"
                                    placeholder="user@gmail.com"
                                    autoComplete="username"
                                    required
                                    onChange={(e) => setData("email", e.target.value)}
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1" />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label
                                htmlFor="password"
                                className="block text-[10px] font-black text-[#5a3630] uppercase tracking-wider"
                            >
                                Password
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <Lock size={18} className="stroke-[2]" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="block w-full rounded-2xl border-0 bg-[#fbf8f6] py-3.5 pl-12 pr-12 text-sm font-semibold text-[#2f1a16] placeholder:text-gray-300 focus:bg-white focus:ring-2 focus:ring-[#5a3630] transition shadow-inner"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    onChange={(e) => setData("password", e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5a3630] transition focus:outline-none cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1" />
                        </div>

                        {/* Remember Me and Forgot Password */}
                        <div className="flex items-center justify-between text-xs font-bold pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none group">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData("remember", e.target.checked)}
                                    className="rounded border-[#eadfda] text-[#5a3630] focus:ring-[#5a3630] cursor-pointer"
                                />
                                <span className="text-gray-400 group-hover:text-secondary-dark transition">
                                    Remember me
                                </span>
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={route("password.request")}
                                    className="text-[#5a3630] hover:text-[#4a2b25] transition"
                                >
                                    Forgot your password?
                                </Link>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full h-12 bg-[#4a2b25] hover:bg-[#3c221e] disabled:bg-[#f4ece9] disabled:text-gray-400 text-white rounded-2xl font-bold shadow-md transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center cursor-pointer text-sm"
                            >
                                {processing ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
