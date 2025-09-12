"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AnimatedButton from "@/components/client/AnimatedButton";
import Link from "next/link";
import { FiMail, FiUser, FiLock, FiCheckCircle } from "react-icons/fi";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    // Basic validation
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess("Account created successfully! Please check your email to verify your account before logging in.");
        
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?message=please-verify");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-slide-in-elliptic-top-fwd bg-gray-900 bg-opacity-75 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md mx-auto">
      <h2 className="text-3xl font-bold text-center text-white mb-6">
        Create an Account
      </h2>
      
      {success && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
          <div className="flex items-center text-green-400">
            <FiCheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">Success!</span>
          </div>
          <p className="text-green-300 text-sm mt-1">{success}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            <FiUser className="inline w-4 h-4 mr-2" />
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Enter your full name"
          />
        </div>
        
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Create a strong password"
          />
          <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters long</p>
        </div>
        
        <div>
          <AnimatedButton 
            type="submit" 
            text={isLoading ? "Creating Account..." : "Sign Up"} 
            className="w-full" 
          />
        </div>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-400 mb-4">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">
            Privacy Policy
          </Link>
        </p>
        
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
