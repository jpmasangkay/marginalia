import { useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Star, StickyNote, Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth-context";
import type { AxiosError } from "axios";

interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
}

export function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isSignup) {
        await register(name.trim(), email, password);
        toast.success("Account created! Welcome to Marginalia 🎉");
      } else {
        await login(email, password);
        toast.success("Welcome back! ✨");
      }
      navigate("/dashboard");
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const serverMsg = axiosErr.response?.data?.message;
      // Show first field-level error if available, else the generic message
      const fieldErrors = axiosErr.response?.data?.errors;
      const displayMsg =
        fieldErrors && fieldErrors.length > 0
          ? fieldErrors[0].message
          : serverMsg ?? (isSignup ? "Could not create account. Please try again." : "Invalid email or password.");
      toast.error(displayMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-[#faf8fc] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating doodles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-12 left-16 text-[#e9d5ff] transform -rotate-12">
          <Star className="w-7 h-7 opacity-40" />
        </div>
        <div className="absolute top-24 right-24 text-[#fecdd3] transform rotate-12">
          <Heart className="w-5 h-5 opacity-40" />
        </div>
        <div className="absolute bottom-24 left-32 text-[#c4b5fd] transform rotate-45">
          <Sparkles className="w-6 h-6 opacity-30" />
        </div>
        <div className="absolute bottom-16 right-16 text-[#fed7aa] transform -rotate-6">
          <StickyNote className="w-8 h-8 opacity-25" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col gap-4">
        {/* Main form sticky note */}
        <div
          className="rounded-3xl shadow-xl px-7 py-6 transform rotate-1 border-b-4"
          style={{
            backgroundColor: isSignup ? '#ddd6fe' : '#fecdd3',
            borderBottomColor: isSignup ? 'rgba(167, 139, 250, 0.3)' : 'rgba(251, 113, 133, 0.3)',
            boxShadow: isSignup
              ? '0 20px 25px -5px rgba(167, 139, 250, 0.2), 0 8px 10px -6px rgba(167, 139, 250, 0.2)'
              : '0 20px 25px -5px rgba(251, 113, 133, 0.2), 0 8px 10px -6px rgba(251, 113, 133, 0.2)'
          }}
        >
          {/* Tabs */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setIsSignup(false)}
              className={`flex-1 py-2.5 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                !isSignup
                  ? "bg-white/90 text-[#4a4458] shadow-md scale-105 -rotate-1"
                  : "bg-white/40 text-[#6b5578] hover:bg-white/60"
              }`}
              style={{ fontWeight: 600 }}
            >
              Log In
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`flex-1 py-2.5 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                isSignup
                  ? "bg-white/90 text-[#4a4458] shadow-md scale-105 rotate-1"
                  : "bg-white/40 text-[#6b5578] hover:bg-white/60"
              }`}
              style={{ fontWeight: 600 }}
            >
              Sign Up
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-xl text-[#4a4458] mb-0.5 transform -rotate-1" style={{ fontWeight: 700 }}>
              {isSignup ? "hey there!" : "welcome back!"}
            </h2>
            <p className="text-[#6b5578] text-sm">
              {isSignup ? "let's get you started~" : "ready to organize?"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignup && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a78bfa]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="your name"
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full pl-11 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/90 transition-all duration-200 text-[#4a4458] placeholder:text-[#9b8fad] text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a78bfa]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email address"
                required
                className="w-full pl-11 pr-4 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/90 transition-all duration-200 text-[#4a4458] placeholder:text-[#9b8fad] text-sm"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#a78bfa]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? "password (min 8 chars + 1 number)" : "password"}
                required
                minLength={8}
                className="w-full pl-11 pr-11 py-3 bg-white/70 backdrop-blur-sm border-2 border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white focus:bg-white/90 transition-all duration-200 text-[#4a4458] placeholder:text-[#9b8fad] text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#a78bfa] hover:text-[#8b5cf6] transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              style={{ fontWeight: 600 }}
            >
              {isSubmitting
                ? (isSignup ? "creating account..." : "logging in...")
                : (isSignup ? "let's go!" : "log me in!")}
            </button>
          </form>

          <div className="mt-4 text-center text-[#6b5578] text-sm">
            {isSignup ? "already have an account? " : "new here? "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-[#8b5cf6] hover:underline transform inline-block hover:scale-110 transition-transform"
              style={{ fontWeight: 600 }}
            >
              {isSignup ? "log in!" : "sign up!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}