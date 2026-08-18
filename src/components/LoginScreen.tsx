import React, { useState } from "react";
import { UserProfile } from "../types";
import { useAuth } from "../context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config";
import { formatAuthError } from "../firebase/auth";

interface LoginScreenProps {
  onLoginSuccess?: (user: UserProfile) => void;
  onGoToRegister?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
}) => {
  const { signIn, signUp, signInGoogle, error: authError, clearError } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const errorMessage = localError || authError;

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setLocalError("Please enter your email address.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError("Please enter a valid email address (e.g. name@example.com).");
      return false;
    }
    if (!password) {
      setLocalError("Please enter your password.");
      return false;
    }
    if (isRegisterMode && password.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return false;
    }
    if (isRegisterMode && !fullName.trim()) {
      setLocalError("Please enter your full name.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setInfoMessage(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const userProfile = await signUp(email.trim(), password, fullName.trim());
        if (onLoginSuccess) onLoginSuccess(userProfile);
      } else {
        const userProfile = await signIn(email.trim(), password);
        if (onLoginSuccess) onLoginSuccess(userProfile);
      }
    } catch (err: any) {
      console.error("Authentication error:", err);
      const friendlyMsg = err.message || formatAuthError(err);
      setLocalError(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLocalError(null);
    clearError();
    setInfoMessage(null);
    setIsLoading(true);

    try {
      const userProfile = await signInGoogle();
      if (onLoginSuccess) onLoginSuccess(userProfile);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        const friendlyMsg = err.message || formatAuthError(err);
        setLocalError(friendlyMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setLocalError("Please enter your email address in the field above to reset your password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfoMessage(`Password reset link sent to ${email.trim()}. Please check your inbox.`);
      setLocalError(null);
    } catch (err: any) {
      setLocalError(formatAuthError(err));
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col md:flex-row items-center justify-center p-4 md:p-8">
      {/* Desktop Showcase Banner */}
      <div className="hidden lg:flex lg:w-1/2 h-[640px] max-w-[540px] items-center justify-center p-8 relative rounded-3xl overflow-hidden shadow-2xl mr-8 bg-gradient-to-tr from-indigo-950 via-indigo-900 to-purple-950 border border-indigo-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent opacity-90" />
        <div className="relative z-10 text-white max-w-sm">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20 shadow-inner">
            <span className="material-symbols-outlined text-[32px] text-amber-300">
              auto_awesome
            </span>
          </div>
          <h2 className="text-[36px] font-extrabold leading-tight mb-4 tracking-tight">
            Elevate Your Career Trajectory
          </h2>
          <p className="text-indigo-200 text-base leading-relaxed opacity-90">
            Real-time Cloud Firestore synchronization and ATS optimization for your engineering & product leadership narrative.
          </p>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-200/80 flex flex-col justify-center">
        {/* Mobile Header / Logo */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <span
              className="material-symbols-outlined text-[24px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              description
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-slate-900">AI Resume Studio</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-[26px] font-bold text-slate-900 tracking-tight mb-1">
            {isRegisterMode ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-[14px] text-slate-500">
            {isRegisterMode
              ? "Sign up to persist and analyze your resumes in Firestore."
              : "Sign in to continue building your professional profile."}
          </p>
        </div>

        {/* Error and Info Banners */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-[13px] text-red-700">
            <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0 mt-0.5">
              error
            </span>
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-[13px] text-emerald-700">
            <span className="material-symbols-outlined text-[18px] text-emerald-600 shrink-0 mt-0.5">
              check_circle
            </span>
            <span className="leading-snug">{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col">
          {/* Full Name for Registration */}
          {isRegisterMode && (
            <div className="relative group bg-slate-50 rounded-t-xl border-b-2 border-slate-300 focus-within:border-indigo-600 transition-colors">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <input
                id="register-fullname"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (localError) setLocalError(null);
                }}
                placeholder=" "
                required={isRegisterMode}
                className="block w-full pl-12 pr-4 pt-6 pb-2 bg-transparent border-none text-slate-900 text-base focus:ring-0 outline-hidden font-medium"
              />
              <label
                htmlFor="register-fullname"
                className="absolute left-12 top-2 text-[12px] font-bold text-slate-500 pointer-events-none transition-all duration-200"
              >
                Full Name
              </label>
            </div>
          )}

          {/* Email Input */}
          <div className="relative group bg-slate-50 rounded-t-xl border-b-2 border-slate-300 focus-within:border-indigo-600 transition-colors">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </div>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder=" "
              required
              className="block w-full pl-12 pr-4 pt-6 pb-2 bg-transparent border-none text-slate-900 text-base focus:ring-0 outline-hidden font-medium"
            />
            <label
              htmlFor="login-email"
              className="absolute left-12 top-2 text-[12px] font-bold text-slate-500 pointer-events-none transition-all duration-200"
            >
              Email Address
            </label>
          </div>

          {/* Password Input */}
          <div className="relative group bg-slate-50 rounded-t-xl border-b-2 border-slate-300 focus-within:border-indigo-600 transition-colors">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600">
              <span className="material-symbols-outlined text-[20px]">lock</span>
            </div>
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (localError) setLocalError(null);
              }}
              placeholder=" "
              required
              className="block w-full pl-12 pr-12 pt-6 pb-2 bg-transparent border-none text-slate-900 text-base focus:ring-0 outline-hidden font-medium"
            />
            <label
              htmlFor="login-password"
              className="absolute left-12 top-2 text-[12px] font-bold text-slate-500 pointer-events-none transition-all duration-200"
            >
              Password
            </label>
            <button
              type="button"
              id="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Toggle password visibility"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>

          {/* Forgot Password */}
          {!isRegisterMode && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                id="forgot-password-btn"
                onClick={handleForgotPassword}
                className="text-[13px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            id="login-submit-btn"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-6 rounded-full text-[14px] font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-98 transition-all disabled:opacity-70 mt-2 cursor-pointer"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isRegisterMode ? "Creating Account..." : "Signing in..."}
              </span>
            ) : (
              <>
                <span>{isRegisterMode ? "CREATE ACCOUNT" : "SIGN IN"}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200" />
          <span className="mx-4 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">
            Or continue with
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Google Sign-In */}
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            id="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="flex items-center justify-center py-2.5 px-4 border border-slate-200 rounded-full text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-colors active:scale-95 gap-2 cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-indigo-600">
              apps
            </span>
            Continue with Google
          </button>
        </div>

        {/* Toggle Account Mode Link */}
        <div className="text-center pt-6">
          <p className="text-[13px] text-slate-500">
            {isRegisterMode ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              id="create-account-link"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setLocalError(null);
                clearError();
                setInfoMessage(null);
              }}
              className="text-indigo-600 font-bold hover:underline ml-1 cursor-pointer"
            >
              {isRegisterMode ? "Sign In" : "Create Account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
