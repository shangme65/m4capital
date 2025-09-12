"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import AnimatedButton from "@/components/client/AnimatedButton";
import Link from "next/link";
import { FiMail, FiLock, FiCheckCircle, FiAlertCircle, FiInfo } from "react-icons/fi";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle URL parameters for messages
    const verified = searchParams.get('verified');
    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');

    if (verified === 'true') {
      setMessage("Email verified successfully! You can now log in.");
    } else if (errorParam === 'invalid-token') {
      setError("Invalid verification token. Please request a new verification email.");
    } else if (errorParam === 'expired-token') {
      setError("Verification token has expired. Please request a new verification email.");
    } else if (errorParam === 'verification-failed') {
      setError("Email verification failed. Please try again.");
    } else if (messageParam === 'please-verify') {
      setMessage("Please check your email and verify your account before logging in.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
    } else {
      router.push("/dashboard");
    }
    setIsLoading(false);
  };

  return (
    <div className="animate-slide-in-elliptic-top-fwd bg-gray-900 bg-opacity-75 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center text-white mb-6">
        Login to m4capital
      </h2>
      
      {/* Success Message */}
      {message && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-center text-green-400">
            <FiCheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Success!</span>
          </div>
          <p className="text-green-300 text-sm mt-1">{message}</p>
        </div>
      )}
      
      {/* Info Message */}
      {searchParams.get('message') === 'please-verify' && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-center text-blue-400">
            <FiInfo className="w-5 h-5 mr-2" />
            <span className="font-medium">Verification Required</span>
          </div>
          <p className="text-blue-300 text-sm mt-1">
            Please check your email and click the verification link before logging in.
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-center text-red-400">
              <FiAlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-300 text-sm mt-1">{error}</p>
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            <FiMail className="inline w-4 h-4 mr-2" />
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Enter your email address"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            <FiLock className="inline w-4 h-4 mr-2" />
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Enter your password"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 bg-gray-800 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-gray-300">
              Remember me
            </label>
          </div>
          
          <Link
            href="/forgot-password"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Forgot password?
          </Link>
        </div>
        
        <div>
          <AnimatedButton 
            type="submit" 
            text={isLoading ? "Signing In..." : "Sign In"} 
            className="w-full" 
          />
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Sign up
          </Link>
        </p>
        
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Secure login protected by industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
}
