import React, { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { syncLocalCartToBackend } from "../api/retailerApis";
import { Loader2 } from "./Loader";

interface LoginModalProps {
    open: boolean;
    onClose: () => void;
    onNext: (email: string) => void;
    initialEmail?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
    open,
    onClose,
    onNext,
    initialEmail = "",
}) => {
    const [email, setEmail] = useState(initialEmail);
    const [password, setPassword] = useState("");
    const [pin, setPin] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [step, setStep] = useState<"email" | "password" | "pin" | "forgot_password">("email");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (open) {
            setEmail(initialEmail);
            setStep("email");
            setError("");
            setPassword("");
            setPin("");
            setNewPassword("");
        }
    }, [open, initialEmail]);

    if (!open) return null;

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await authService.checkEmailExists(email);
            if (response && response.data && response.data.is_registered) {
                setStep("password");
            } else {
                // Not registered -> Go to Sign Up
                onNext(email);
            }
        } catch (err) {
            console.error("Error checking email:", err);
            // If error (e.g. network), we could assume sign up or show error.
            // For safety, let's assume sign up if we can't verify, or show error.
            // onNext(email);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError("Please enter your password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await authService.login(email, password);
            // login handles storage, event dispatch, AND cart merge

            if (response.success || response.token || response.status) {
                // Cart merge already happened in authService.login()
                onClose();
                // Dispatch event to refresh cart
                window.dispatchEvent(new Event('cart-updated'));
            } else {
                setError(response.message || "Invalid credentials");
            }
        } catch (err: any) {
            console.error("Login error:", err);
            setError(
                err?.response?.data?.detail?.msg ||
                err?.response?.data?.message ||
                "Login failed. Please check your password."
            );
        } finally {
            setLoading(false);
        }
    };

    // Consistent styling with SignInModal/SignUpModal
    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-start p-0 sm:p-8 font-sans">
            {/* Background Image - Specs */}
            <div className="absolute inset-0 bg-[url('/login-bg.png')] bg-cover bg-center bg-no-repeat">
                <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]"></div>
            </div>

            {/* Close Button - Top Right */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white hover:text-gray-200 transition-colors z-20 bg-black/20 hover:bg-black/40 p-2 rounded-full backdrop-blur-md border border-white/20"
            >
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>

            {/* Content Card */}
            <div className="relative z-10 w-full sm:max-w-[420px] bg-white sm:rounded-[20px] rounded-t-[24px] shadow-2xl p-8 md:p-10 animate-in slide-in-from-bottom-10 duration-300 sm:ml-12 sm:mb-12 border border-gray-100">
                {loading ? (
                    <div className="py-12">
                        <Loader2 />
                    </div>
                ) : (
                    <>
                        {/* Only show title for email step */}
                        {step === "email" && (
                            <div className="mb-8">
                                <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-3 font-sans leading-tight tracking-tight">
                                    Welcome to Multifolks
                                </h2>
                                <p className="text-[#757575] text-[15px] leading-relaxed font-medium">
                                    Enter your email to get started
                                </p>
                            </div>
                        )}

                        {step === "email" ? (
                            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                                <div className="flex flex-col gap-2 relative">
                                    <label htmlFor="email-input" className="sr-only">Email</label>
                                    <input
                                        id="email-input"
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-4 text-[#1F1F1F] font-medium placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all shadow-sm text-base"
                                        required
                                        autoFocus
                                    />
                                </div>
                                {error && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg">
                                        {error}
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    className="w-full bg-[#232320] text-white py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mt-2"
                                >
                                    Continue
                                </button>
                            </form>
                        ) : step === "password" ? (
                            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                                {/* Title and Subtitle */}
                                <div className="mb-2">
                                    <h2 className="text-[28px] font-bold text-[#1F1F1F] mb-1 font-sans leading-tight tracking-tight">
                                        Login to Multifolks
                                    </h2>
                                    <p className="text-[#757575] text-[15px] leading-relaxed font-medium">
                                        Welcome Back
                                    </p>
                                </div>

                                {/* Email Display with Change Button */}
                                <div className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-3.5 flex justify-between items-center">
                                    <span className="text-[#1F1F1F] font-medium text-sm truncate mr-2 break-all">
                                        {email}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="text-[#1F1F1F] font-bold text-sm underline hover:opacity-80 whitespace-nowrap"
                                    >
                                        Change?
                                    </button>
                                </div>

                                {/* Password Input */}
                                <div className="flex flex-col gap-2 relative">
                                    <label htmlFor="password-input" className="sr-only">Password</label>
                                    <div className="relative">
                                        <input
                                            id="password-input"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white border border-[#E5E5E5] rounded-xl px-4 py-4 text-[#1F1F1F] font-medium placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all shadow-sm text-base pr-10"
                                            required
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {/* Proceed Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-[#232320] text-white py-4 rounded-full font-bold text-[15px] hover:bg-black transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                >
                                    Proceed
                                </button>

                                {/* Request PIN and Forgot Password Links */}
                                <div className="flex justify-between items-center -mt-2">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                setLoading(true);
                                                setError("");
                                                await authService.requestPin(email);
                                                setStep("pin");
                                            } catch (err: any) {
                                                console.error("Failed to send PIN:", err);
                                                setError("Failed to send PIN. Please try again.");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="text-sm text-[#1F1F1F] hover:opacity-80 underline font-bold"
                                    >
                                        Request PIN?
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                setLoading(true);
                                                setError("");
                                                await authService.requestPin(email);
                                                setStep("forgot_password");
                                            } catch (err: any) {
                                                console.error("Failed to send PIN:", err);
                                                setError("Failed to send PIN. Please try again.");
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        className="text-sm text-[#1F1F1F] hover:opacity-80 underline font-bold"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            </form>
                        ) : step === "pin" ? (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!pin || pin.length !== 6) {
                                    setError("Please enter a valid 6-digit PIN");
                                    return;
                                }

                                setLoading(true);
                                setError("");

                                try {
                                    const response = await authService.loginWithPin(email, pin);
                                    if (response.success || response.token || response.status) {
                                        await syncLocalCartToBackend();
                                        onClose();
                                        window.dispatchEvent(new Event('cart-updated'));
                                    } else {
                                        setError(response.message || "Invalid PIN");
                                    }
                                } catch (err: any) {
                                    console.error("PIN verification error:", err);
                                    setError(
                                        err?.response?.data?.detail?.msg ||
                                        err?.response?.data?.message ||
                                        "Invalid PIN. Please try again."
                                    );
                                } finally {
                                    setLoading(false);
                                }
                            }} className="flex flex-col gap-5">
                                {/* Title */}
                                <div className="text-center mb-1">
                                    <h2 className="text-[28.8px] font-bold text-[#1F1F1F] mb-1 font-sans">
                                        PIN Sent
                                    </h2>
                                    <p className="text-[16px] text-[#6C757D]">
                                        PIN sent to
                                    </p>
                                    <p className="text-[16px] text-[#6C757D]">
                                        {email}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setStep("email")}
                                        className="text-[16px] text-[#6C757D] underline hover:opacity-80 block mx-auto"
                                    >
                                        Change?
                                    </button>
                                </div>

                                {/* PIN Input */}
                                <div className="mb-4">
                                    <label htmlFor="pin-input" className="sr-only">PIN</label>
                                    <input
                                        id="pin-input"
                                        type="text"
                                        placeholder=""
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        className="w-full h-[48px] bg-white border border-[#CED4DA] rounded px-4 py-2 text-[16px] text-[#1F1F1F] font-medium placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all"
                                        required
                                        autoFocus
                                        maxLength={6}
                                    />
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg mb-4">
                                        {error}
                                    </div>
                                )}

                                {/* Verify Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-[#343A40] text-white px-4 py-3 rounded text-[16px] font-normal hover:bg-black transition-all mb-3"
                                >
                                    Verify
                                </button>

                                {/* Resend Code Link */}
                                <div className="text-center mb-2">
                                    <p className="text-[14px] text-[#212529]">
                                        Not received your code?{" "}
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                try {
                                                    setLoading(true);
                                                    await authService.requestPin(email);
                                                    setError("");
                                                } catch (err) {
                                                    setError("Failed to resend code");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                            className="font-bold underline hover:opacity-80"
                                        >
                                            Resend Code
                                        </button>
                                    </p>
                                </div>

                                {/* Use Password Link */}
                                <div className="text-center mb-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep("password")}
                                        className="text-[14px] text-[#212529] underline hover:opacity-80 block mx-auto"
                                    >
                                        Use Password?
                                    </button>
                                </div>

                                {/* Terms */}
                                <p className="text-[12.8px] text-center text-[#212529] leading-relaxed">
                                    By continuing, you agree to Multifolks's{" "}
                                    <a href="/terms" className="underline hover:text-black">Terms of Use</a>
                                    {" "}and{" "}
                                    <a href="/privacy" className="underline hover:text-black">Privacy Policy</a>.
                                </p>
                            </form>
                        ) : step === "forgot_password" ? (
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                if (!pin || pin.length !== 6) {
                                    setError("Please enter a valid 6-digit PIN");
                                    return;
                                }
                                if (!newPassword || newPassword.length < 6) {
                                    setError("Password must be at least 6 characters");
                                    return;
                                }

                                setLoading(true);
                                setError("");

                                try {
                                    const response = await authService.resetPassword(email, pin, newPassword);
                                    if (response.success || response.status) {
                                        await syncLocalCartToBackend();
                                        onClose();
                                        window.dispatchEvent(new Event('cart-updated'));
                                    } else {
                                        setError(response.message || "Failed to reset password");
                                    }
                                } catch (err: any) {
                                    console.error("Password reset error:", err);
                                    setError(
                                        err?.response?.data?.detail?.msg ||
                                        err?.response?.data?.message ||
                                        "Failed to reset password. Please try again."
                                    );
                                } finally {
                                    setLoading(false);
                                }
                            }} className="flex flex-col gap-4">
                                {/* Title */}
                                <div>
                                    <h2 className="text-[28.8px] font-bold text-[#1F1F1F] mb-3 font-sans">
                                        Forgot Password
                                    </h2>
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                                        <p className="text-[14px] text-[#6C757D]">
                                            {email}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setStep("email")}
                                            className="text-[14px] text-[#1F1F1F] underline hover:opacity-80 font-medium"
                                        >
                                            Change?
                                        </button>
                                    </div>
                                </div>

                                {/* Enter PIN */}
                                <div>
                                    <label htmlFor="reset-pin-input" className="text-[14px] text-[#1F1F1F] mb-2 block">
                                        Enter PIN
                                    </label>
                                    <input
                                        id="reset-pin-input"
                                        type="text"
                                        placeholder="0:28"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        className="w-full h-[48px] bg-white border border-[#CED4DA] rounded px-4 py-2 text-[16px] text-[#1F1F1F] font-medium placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all"
                                        required
                                        autoFocus
                                        maxLength={6}
                                    />
                                </div>

                                {/* Set Password */}
                                <div>
                                    <label htmlFor="new-password-input" className="text-[14px] text-[#1F1F1F] mb-2 block">
                                        Set Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="new-password-input"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full h-[48px] bg-white border border-[#CED4DA] rounded px-4 py-2 text-[16px] text-[#1F1F1F] font-medium placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#1F1F1F] focus:ring-0 transition-all pr-12"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {/* Update Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-[#343A40] text-white px-4 py-3 rounded text-[16px] font-normal hover:bg-black transition-all"
                                >
                                    Update
                                </button>
                            </form>
                        ) : null}
                    </>
                )}
            </div>
        </div>
    );
};
