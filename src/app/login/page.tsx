"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user, loginWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleEmailSignIn = async () => {
    if (!email || !password) return setError("Please fill all fields.");
    setIsLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message?.includes("invalid") ? "Invalid email or password." : "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) return setError("Please fill all fields.");
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setIsLoading(true);
    setError("");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message?.includes("already") ? "This email is already registered." : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Column — Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 z-10" />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80')" }}
        />
        <div className="relative z-20 flex flex-col justify-end p-16 text-white">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full w-fit mb-6">
            Fathom Elite
          </span>
          <h2 className="text-4xl md:text-5xl font-poppins font-bold leading-tight mb-4">
            &ldquo;Silence is the<br/>ultimate luxury.&rdquo;
          </h2>
          <p className="text-gray-300 text-sm font-inter max-w-md leading-relaxed">
            Join the inner circle of culinary excellence. Experience the future of kitchen architecture.
          </p>
        </div>
      </div>

      {/* Right Column — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-poppins font-bold text-primary italic mb-2">Welcome Back</h1>
            <p className="text-gray-500 text-sm font-inter">Please enter your details to access your account.</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-10">
            <button 
              onClick={() => { setActiveTab("signin"); setError(""); }}
              className={`flex-1 pb-4 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${activeTab === "signin" ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
            >
              Sign In
              {activeTab === "signin" && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
            </button>
            <button 
              onClick={() => { setActiveTab("register"); setError(""); }}
              className={`flex-1 pb-4 text-xs font-bold tracking-[0.2em] uppercase transition-colors relative ${activeTab === "register" ? "text-primary" : "text-gray-400 hover:text-gray-600"}`}
            >
              Register
              {activeTab === "register" && <motion.div layoutId="auth-tab" className="absolute bottom-0 left-0 w-full h-[2px] bg-primary" />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 text-sm font-medium px-4 py-3 rounded-lg mb-6 border border-red-100">
              {error}
            </motion.div>
          )}

          {/* Sign In Form */}
          {activeTab === "signin" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full border-b border-gray-200 py-3 text-base font-inter text-primary placeholder:text-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent" />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Password</label>
                  <button className="text-[10px] font-bold tracking-wider uppercase text-accent hover:text-primary transition-colors">Forgot?</button>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full border-b border-gray-200 py-3 text-base font-inter text-primary placeholder:text-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent" />
              </div>

              <button 
                onClick={handleEmailSignIn}
                disabled={isLoading}
                className="w-full bg-primary text-white py-5 flex items-center justify-between px-8 hover:bg-black transition-colors mt-4 group disabled:opacity-50"
              >
                <span className="text-xs font-bold tracking-[0.2em] uppercase">{isLoading ? "Signing in..." : "Enter the Circle"}</span>
                {!isLoading && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transform group-hover:translate-x-1 transition-transform"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
            </motion.div>
          )}

          {/* Register Form */}
          {activeTab === "register" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="w-full border-b border-gray-200 py-3 text-base font-inter text-primary placeholder:text-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" className="w-full border-b border-gray-200 py-3 text-base font-inter text-primary placeholder:text-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" className="w-full border-b border-gray-200 py-3 text-base font-inter text-primary placeholder:text-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" className="w-full border-b border-gray-200 py-3 text-base font-inter text-primary placeholder:text-gray-300 focus:outline-none focus:border-primary transition-colors bg-transparent" />
              </div>

              <button 
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full bg-primary text-white py-5 flex items-center justify-between px-8 hover:bg-black transition-colors mt-2 group disabled:opacity-50"
              >
                <span className="text-xs font-bold tracking-[0.2em] uppercase">{isLoading ? "Creating Account..." : "Create Account"}</span>
                {!isLoading && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="transform group-hover:translate-x-1 transition-transform"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                )}
              </button>
            </motion.div>
          )}

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Or Continue With</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Social Login */}
          <button 
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-4 px-6 hover:border-gray-400 hover:shadow-md transition-all duration-300 group"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="font-bold text-xs text-primary tracking-[0.15em] uppercase group-hover:text-accent transition-colors">Google</span>
          </button>

          <p className="text-center text-xs text-gray-400 mt-10">
            Protected by FATHOM SecureGuard™.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
