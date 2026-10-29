import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Shield, Radio, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { CDMSLogo } from '../components/TeamLogos';
import { api } from '../lib/api';
import batsmanStadiumImg from '../assets/images/batsman-stadium.jpg';
import api from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [role, setRole] = useState('user'); // 'user' | 'scorer' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // For registration
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Switch role and update demo defaults (only for login)
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
    // Don't auto-fill credentials during registration
    if (!isLogin) {
      return;
    }
    if (newRole === 'admin') {
      setEmail('admin@cdms.com');
      setPassword('admin123');
    } else if (newRole === 'scorer') {
      setEmail('scorer@cdms.com');
      setPassword('scorer123');
    } else {
      setEmail('');
      setPassword('');
    }
  };

  // Form submission with validation and role-based redirect
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation stubs
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!isLogin && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);

    try {
<<<<<<< HEAD
      const authRes = await api.auth.login(email, password);
      setIsLoading(false);

      const userData = {
        email: authRes.user.email,
        role: authRes.user.role,
        name: authRes.user.name,
        token: authRes.access_token,
      };
      localStorage.setItem('cdms_auth_user', JSON.stringify(userData));

      if (authRes.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        try {
          const allMatches = await api.matches.getAll();
          if (allMatches && allMatches.length > 0) {
            navigate(`/scorer/console/${allMatches[0].match_id}`);
            return;
          }
        } catch (_) {}
=======
      let response;
      
      if (isLogin) {
        // Call backend API for login
        response = await api.login(email, password);
      } else {
        // Call backend API for registration
        response = await api.register(name, email, password, role);
      }
      
      setIsLoading(false);

      // Get user role from response
      const userRole = response.user.role;
      
      // Role-based redirect logic
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'scorer') {
>>>>>>> myBranch
        navigate('/scorer/console/1');
      } else {
        // Regular user - redirect to home
        navigate('/');
      }
<<<<<<< HEAD
    } catch (apiErr) {
      // If server error or invalid credentials, try demo fallback if it matches demo credentials
      if (email.includes('admin') || role === 'admin') {
        setIsLoading(false);
        const userData = {
          email,
          role: 'admin',
          name: 'Administrator',
          token: 'cdms_bearer_token_' + Date.now(),
        };
        localStorage.setItem('cdms_auth_user', JSON.stringify(userData));
        navigate('/admin/dashboard');
      } else {
        setIsLoading(false);
        setError(apiErr.message || 'Invalid email or password');
      }
=======
    } catch (err) {
      setIsLoading(false);
      setError(err.message || isLogin ? 'Invalid email or password' : 'Registration failed');
>>>>>>> myBranch
    }
  };


  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4 lg:p-8"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(8, 15, 38, 0.90) 0%, rgba(10, 25, 47, 0.85) 50%, rgba(5, 10, 25, 0.95) 100%), url(${batsmanStadiumImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background ambient decorative glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 relative z-10">
        {/* Header branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <CDMSLogo className="w-14 h-14 ring-4 ring-emerald-500/20" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isLogin ? 'Sign In to CDMS' : 'Create Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cricket Data Management System Portal
          </p>
        </div>

        {/* Login/Register Toggle */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              isLogin
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              !isLogin
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Role Selector Tabs - Only show for registration */}
        {!isLogin && (
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 mb-6 border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleChange('user')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'user'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className={`w-3.5 h-3.5 ${role === 'user' ? 'text-emerald-600' : 'text-slate-400'}`} />
              User
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('scorer')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'scorer'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${role === 'scorer' ? 'text-emerald-600' : 'text-slate-400'}`} />
              Scorer
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                role === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${role === 'admin' ? 'text-emerald-600' : 'text-slate-400'}`} />
              Admin
            </button>
          </div>
        )}

        {/* Quick Credentials Info Box - Only show for login */}
        {isLogin && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start justify-between text-xs">
            <div>
              <span className="font-semibold text-emerald-800">
                Demo Credentials:
              </span>
              <p className="text-emerald-700 text-[11px] mt-0.5 font-mono">
                admin@cdms.com / admin123
              </p>
              <p className="text-emerald-700 text-[11px] mt-0.5 font-mono">
                scorer@cdms.com / scorer123
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@cdms.com');
                setPassword('admin123');
                setRole('admin');
              }}
              className="text-[11px] font-bold text-emerald-700 underline hover:text-emerald-900"
            >
              Auto-fill Admin
            </button>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field - Only show for registration */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required={!isLogin}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@cdms.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setForgotModalOpen(true)}
              className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#00c261] hover:bg-[#00ad56] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                {isLogin ? 'Authenticating...' : 'Creating Account...'}
              </span>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Back link */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            ← Back to Public League Portal
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal Stub */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Password</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter your registered email address to receive password reset instructions.
            </p>
            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Password reset link has been dispatched to {email}!</span>
              </div>
            ) : (
              <input
                type="email"
                defaultValue={email}
                placeholder="Enter email address"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(false);
                  setResetSuccess(false);
                }}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              {!resetSuccess && (
                <button
                  type="button"
                  onClick={() => setResetSuccess(true)}
                  className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                >
                  Send Link
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
