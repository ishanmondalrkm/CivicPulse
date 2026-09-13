import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Landmark, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [searchParams] = useSearchParams();

  const initialMode =
    searchParams.get("mode") === "register"
      ? "register"
      : "login";

  const [mode, setMode] = useState(initialMode);

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  // IMPORTANT:
  // This now accepts either mobile number OR email.
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // --------------------------------------------------
  // FORGOT PASSWORD
  // --------------------------------------------------

  const [forgotStep, setForgotStep] = useState("email");

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // --------------------------------------------------
  // REGISTER
  // --------------------------------------------------

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerOtp, setRegisterOtp] = useState("");
  const [registerOtpSent, setRegisterOtpSent] = useState(false);

  // --------------------------------------------------

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    login,
    sendForgotPasswordOTP,
    verifyForgotPasswordOTP,
    register,
    verifyRegistrationOTP,
  } = useAuth();

  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^\d{10}$/;
  const pinRegex = /^\d{6}$/;

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  // --------------------------------------------------
  // SWITCH MODE
  // --------------------------------------------------

  const switchMode = (newMode) => {
    setMode(newMode);
    clearMessages();

    setForgotStep("email");
    setForgotEmail("");
    setForgotOtp("");
    setNewPassword("");
    setConfirmPassword("");

    setRegisterOtpSent(false);
    setRegisterOtp("");
  };

  // ==================================================
  // NORMAL LOGIN
  // ==================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    clearMessages();

    const identifier = loginIdentifier.trim();

    if (!identifier) {
      setError(
        "Please enter your mobile number or email address."
      );
      return;
    }

    // If the identifier contains @, treat it as email.
    if (identifier.includes("@")) {
      if (!emailRegex.test(identifier)) {
        setError("Please enter a valid email address.");
        return;
      }
    } else {
      // Otherwise treat it as mobile number.
      if (!mobileRegex.test(identifier)) {
        setError(
          "Please enter a valid 10-digit mobile number or email address."
        );
        return;
      }
    }

    if (!loginPassword.trim()) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    const res = await login(
      identifier,
      loginPassword
    );

    setIsSubmitting(false);

    if (res.success) {
      if (
        res.user?.role === "admin" ||
        res.user?.role === "developer"
      ) {
        navigate("/admin");
      } else {
        navigate("/citizen");
      }
    } else {
      setError(res.error);
    }
  };

  // ==================================================
  // FORGOT PASSWORD - SEND OTP
  // ==================================================

  const handleSendForgotOTP = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!forgotEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!emailRegex.test(forgotEmail.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    const res = await sendForgotPasswordOTP(
      forgotEmail.trim().toLowerCase()
    );

    setIsSubmitting(false);

    if (res.success) {
      setForgotStep("otp");

      setSuccessMessage(
        "A 6-digit verification code has been sent to your email."
      );
    } else {
      setError(res.error);
    }
  };

  // ==================================================
  // FORGOT PASSWORD - RESET
  // ==================================================

  const handleResetPassword = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!/^\d{6}$/.test(forgotOtp.trim())) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (!newPassword.trim()) {
      setError("Please enter a new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const res = await verifyForgotPasswordOTP(
      forgotEmail.trim().toLowerCase(),
      forgotOtp.trim(),
      newPassword
    );

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(
        "Password changed successfully. You can now sign in using your mobile number or email address and new password."
      );

      setForgotStep("email");
      setForgotEmail("");
      setForgotOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(res.error);
    }
  };

  // ==================================================
  // REGISTER
  // ==================================================

  const handleRegister = async (e) => {
    e.preventDefault();

    clearMessages();

    if (
      !name.trim() ||
      !mobile.trim() ||
      !email.trim() ||
      !city.trim() ||
      !pin.trim() ||
      !registerPassword.trim()
    ) {
      setError(
        "Please provide Name, Mobile Number, Email, City, PIN Code, and Password."
      );
      return;
    }

    if (!mobileRegex.test(mobile.trim())) {
      setError(
        "Mobile number must contain exactly 10 digits."
      );
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!pinRegex.test(pin.trim())) {
      setError("PIN code must contain exactly 6 digits.");
      return;
    }

    if (registerPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    const res = await register({
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      city: city.trim(),
      pin: pin.trim(),
      password: registerPassword,
    });

    setIsSubmitting(false);

    if (res.success) {
      setRegisterOtpSent(true);

      setSuccessMessage(
        `A 6-digit verification code has been sent to ${email.trim()}.`
      );
    } else {
      setError(res.error);
    }
  };

  // ==================================================
  // VERIFY REGISTRATION
  // ==================================================

  const handleVerifyRegistrationOTP = async (e) => {
    e.preventDefault();

    clearMessages();

    if (!/^\d{6}$/.test(registerOtp.trim())) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    setIsSubmitting(true);

    const res = await verifyRegistrationOTP(
      email.trim().toLowerCase(),
      registerOtp.trim()
    );

    setIsSubmitting(false);

    if (res.success) {
      if (
        res.user?.role === "admin" ||
        res.user?.role === "developer"
      ) {
        navigate("/admin");
      } else {
        navigate("/citizen");
      }
    } else {
      setError(res.error);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">

      {/* HEADER */}

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">

        <Link
          to="/"
          className="inline-flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Landmark className="h-5 w-5" />
          </div>

          <span className="text-2xl font-extrabold text-slate-900 font-outfit">
            Civic<span className="text-blue-600">Pulse</span>
          </span>
        </Link>

        <h2 className="mt-4 text-xl font-bold text-slate-800 font-outfit">
          {mode === "login"
            ? "Sign In to Portal"
            : "Register New Citizen Account"}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Secure Role-Based Access for Citizens and Municipal Administrators
        </p>

      </div>

      {/* CARD */}

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">

        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-slate-200/80 space-y-6">

          {/* TABS */}

          <div className="flex bg-slate-100 p-1 rounded-xl">

            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === "register"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              New Citizen Register
            </button>

          </div>

          {/* MESSAGES */}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-medium">
              {successMessage}
            </div>
          )}

          {/* ==================================================
              LOGIN
          ================================================== */}

          {mode === "login" && forgotStep === "email" && (
            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number or Email
                </label>

                <input
                  type="text"
                  value={loginIdentifier}
                  onChange={(e) =>
                    setLoginIdentifier(e.target.value)
                  }
                  placeholder="Mobile number or email address"
                  autoComplete="username"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div>

                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>

                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) =>
                    setLoginPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>

              <div className="text-right">

                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setForgotEmail("");
                    setForgotOtp("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setForgotStep("forgot-email");
                  }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Forgot Password?
                </button>

              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-60"
              >
                {isSubmitting
                  ? "Signing In..."
                  : "Sign In"}
              </button>

            </form>
          )}

          {/* ==================================================
              FORGOT PASSWORD - EMAIL
          ================================================== */}

          {mode === "login" &&
            forgotStep === "forgot-email" && (
              <form
                onSubmit={handleSendForgotOTP}
                className="space-y-5"
              >

                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setForgotStep("email");
                  }}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Sign In
                </button>

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Forgot Password?
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Enter the email address linked to your CivicPulse account.
                  </p>
                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) =>
                      setForgotEmail(e.target.value)
                    }
                    placeholder="e.g. citizen@example.com"
                    autoComplete="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Sending Code..."
                    : "Send OTP"}
                </button>

              </form>
            )}

          {/* ==================================================
              FORGOT PASSWORD - OTP
          ================================================== */}

          {mode === "login" &&
            forgotStep === "otp" && (
              <form
                onSubmit={handleResetPassword}
                className="space-y-5"
              >

                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Reset Password
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    Enter the OTP sent to your email and create a new password.
                  </p>
                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Verification Code
                  </label>

                  <input
                    type="text"
                    value={forgotOtp}
                    onChange={(e) =>
                      setForgotOtp(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    placeholder="6-digit OTP"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-center tracking-[0.35em] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) =>
                      setNewPassword(e.target.value)
                    }
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-60"
                >
                  {isSubmitting
                    ? "Resetting Password..."
                    : "Reset Password"}
                </button>

              </form>
            )}

          {/* ==================================================
              REGISTER
          ================================================== */}

          {mode === "register" && (
            <form
              onSubmit={
                registerOtpSent
                  ? handleVerifyRegistrationOTP
                  : handleRegister
              }
              className="space-y-4"
            >

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={registerOtpSent}
                  placeholder="e.g. Ramesh Sharma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number
                </label>

                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) =>
                    setMobile(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  disabled={registerOtpSent}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={registerOtpSent}
                  placeholder="e.g. citizen@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City
                </label>

                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={registerOtpSent}
                  placeholder="e.g. Asansol"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  PIN Code
                </label>

                <input
                  type="text"
                  value={pin}
                  onChange={(e) =>
                    setPin(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  disabled={registerOtpSent}
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  inputMode="numeric"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
                />
              </div>

              {!registerOtpSent && (
                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Create Password
                  </label>

                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) =>
                      setRegisterPassword(e.target.value)
                    }
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs"
                  />

                </div>
              )}

              {registerOtpSent && (
                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Verification Code
                  </label>

                  <input
                    type="text"
                    value={registerOtp}
                    onChange={(e) =>
                      setRegisterOtp(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-center tracking-[0.35em] text-sm font-bold"
                  />

                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-60"
              >
                {isSubmitting
                  ? registerOtpSent
                    ? "Verifying..."
                    : "Sending Code..."
                  : registerOtpSent
                  ? "Verify Email & Create Account"
                  : "Send Verification Code"}
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
}



