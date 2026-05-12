"use client";

import { useState } from "react";
import Link from "next/link";
import { createUserWithVerification, requestEmailVerification, verifyEmailWithCode } from "@/modules/auth/authClient";
import { Header } from "@/components/Header";

export default function CreateUserPage() {
  const [step, setStep] = useState<'email' | 'verify' | 'details'>('email');
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("staff");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const showMessage = (msg: string, type: "success" | "error" = "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await requestEmailVerification(email);
      if (result.success) {
        setStep('verify');
        showMessage(result.message, 'success');
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage("Failed to send verification email", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await verifyEmailWithCode(email, verificationCode);
      if (result.success) {
        setStep('details');
        showMessage(result.message, 'success');
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage("Verification failed", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate passwords match
    if (password !== confirmPassword) {
      showMessage("Passwords do not match", 'error');
      setLoading(false);
      return;
    }

    try {
      const result = await createUserWithVerification(email, password, role, name, verificationCode);
      if (result.success) {
        showMessage(result.message, 'success');
        // Reset form
        setEmail("");
        setVerificationCode("");
        setPassword("");
        setConfirmPassword("");
        setName("");
        setRole("staff");
        setStep('email');
      } else {
        showMessage(result.message, 'error');
      }
    } catch (error) {
      showMessage("Failed to create user", 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header showBackButton={true} />
      <div className="px-6 py-12">
        <div className="max-w-md mx-auto">
          <div className="rounded-3xl border border-slate-200 bg-white/95 px-8 py-10 shadow-xl">
            <h1 className="text-2xl font-semibold text-slate-900">Create New User</h1>
            <p className="mt-2 text-sm text-slate-600">
              Create a new user with email verification
            </p>

            {message && (
              <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                messageType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Step 1: Email Input */}
            {step === 'email' && (
              <form onSubmit={handleSendVerification} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              </form>
            )}

            {/* Step 2: Verification Code */}
            {step === 'verify' && (
              <form onSubmit={handleVerifyCode} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Check your console for the verification code (development mode)
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || verificationCode.length !== 6}
                    className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Back
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: User Details */}
            {step === 'details' && (
              <form onSubmit={handleCreateUser} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    placeholder="Confirm password"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || !name || !password || password !== confirmPassword}
                    className="flex-1 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Creating..." : "Create User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
