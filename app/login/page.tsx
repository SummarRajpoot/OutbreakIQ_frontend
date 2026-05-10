'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isSignUp && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Save to localStorage as requested
        localStorage.setItem('outbreakiq_user', JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: 'Health Administrator',
          joinDate: new Date().toISOString()
        }));

        await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          isSignUp: 'true',
          callbackUrl: '/dashboard'
        });
      } else {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
          callbackUrl: '/dashboard'
        });

        if (result?.error) {
          setError("Invalid email or password");
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = (provider: string) => {
    setLoading(true);
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Logo Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-10"
      >
        <div className="w-16 h-16 bg-[#0d9488] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#0d9488]/20 mb-4">
          <Settings className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-black text-[#1a2e2b] tracking-tighter flex items-center gap-2">
          OUTBREAK<span className="text-[#0d9488]">IQ</span>
        </h1>
        <p className="text-[0.6rem] font-black text-[#0d9488] tracking-[0.4em] uppercase mt-1 opacity-80">
          Surveillance
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[450px]"
      >
        <Card className="bg-white rounded-[1.5rem] border-[#0d9488]/10 shadow-[0_20px_50px_rgba(13,148,136,0.1)] overflow-hidden">
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-5 text-sm font-bold transition-all ${!isSignUp ? 'text-[#0d9488] bg-slate-50/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-5 text-sm font-bold transition-all ${isSignUp ? 'text-[#0d9488] bg-slate-50/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Sign Up
            </button>
          </div>

          <CardHeader className="pt-8 px-8">
            <CardTitle className="text-2xl font-bold text-[#1a2e2b]">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="font-medium">
              {isSignUp ? 'Join the surveillance intelligence platform.' : 'Access your administrative dashboard.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {isSignUp && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input 
                        name="name"
                        placeholder="Rana Summar" 
                        required={isSignUp}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-100 focus:ring-[#0d9488]/20 transition-all font-medium"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="email"
                    name="email"
                    placeholder="name@outbreakiq.com" 
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-100 focus:ring-[#0d9488]/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    type="password"
                    name="password"
                    placeholder="••••••••" 
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-100 focus:ring-[#0d9488]/20 transition-all font-medium"
                  />
                </div>
              </div>

              {isSignUp && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <Label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest px-1">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••" 
                      required={isSignUp}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="h-12 pl-11 rounded-xl bg-slate-50 border-slate-100 focus:ring-[#0d9488]/20 transition-all font-medium"
                    />
                  </div>
                </motion.div>
              )}

              {!isSignUp && (
                <div className="flex items-center justify-between px-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-slate-200 text-[#0d9488] focus:ring-[#0d9488]" 
                    />
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700">Remember me</span>
                  </label>
                  <button type="button" className="text-xs font-bold text-[#0d9488] hover:underline">Forgot Password?</button>
                </div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-bold text-red-500 px-1"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-[#0d9488] hover:bg-[#0b7a70] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#0d9488]/20 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <span className="flex items-center gap-2">
                    {isSignUp ? 'Create Administrative Account' : 'Sign In to Dashboard'}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[0.6rem] font-black uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-400">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn('google')}
                  className="h-14 rounded-2xl border-slate-100 hover:bg-red-50 hover:border-red-100 group transition-all"
                >
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-red-500 fill-current" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn('github')}
                  className="h-14 rounded-2xl border-slate-100 hover:bg-slate-50 hover:border-slate-300 group transition-all"
                >
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuthSignIn('linkedin')}
                  className="h-14 rounded-2xl border-slate-100 hover:bg-blue-50 hover:border-blue-100 group transition-all"
                >
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs font-medium text-slate-400 mt-8">
          By continuing, you agree to OutbreakIQ's <br />
          <span className="text-[#0d9488] font-bold cursor-pointer hover:underline">Terms of Service</span> and <span className="text-[#0d9488] font-bold cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
}
