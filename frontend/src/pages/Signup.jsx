import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from '@tanstack/react-router';
import { register as registerApi } from '../utils/api';

export default function Signup() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const password = watch('password', '');

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const levels = [
      { label: 'Weak', color: '#ef4444', width: '20%' },
      { label: 'Fair', color: '#f59e0b', width: '40%' },
      { label: 'Good', color: '#eab308', width: '60%' },
      { label: 'Strong', color: '#22c55e', width: '80%' },
      { label: 'Very Strong', color: '#10b981', width: '100%' },
    ];
    return levels[Math.min(score, 4)];
  };

  const strength = getPasswordStrength(password);

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const response = await registerApi({ name: data.name, email: data.email, password: data.password });
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate({ to: '/dashboard' });
    } catch (error) {
      setServerError(error.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FDF8F3 0%, #F5EFE8 50%, #FDF8F3 100%)' }}>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div key={i}
            className="absolute"
            style={{
              width: Math.random() * 250 + 80,
              height: Math.random() * 250 + 80,
              background: `radial-gradient(circle, rgba(201,169,110,${0.02 + Math.random() * 0.04}) 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              borderRadius: '50%',
            }}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 - 25],
              scale: [1, 1.15, 1],
            }}
            transition={{ duration: 7 + Math.random() * 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl border border-[rgba(139,111,71,0.12)] shadow-[0_24px_80px_rgba(74,55,40,0.12)]"
          style={{ padding: 'clamp(28px, 5vw, 48px)' }}>
          
          {/* Header */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <motion.div className="w-2 h-2 bg-[#C9A96E]" style={{ transform: 'rotate(45deg)' }}
                animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity }} />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#8B6F47' }}>
                The Weddings Chapter
              </span>
              <motion.div className="w-2 h-2 bg-[#C9A96E]" style={{ transform: 'rotate(45deg)' }}
                animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} />
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 300, color: '#4A3728', marginBottom: '8px' }}>
              Create Account
            </h2>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: '0.88rem', color: '#7A6555', fontWeight: 300 }}>
              Join our premium wedding planning community
            </p>
          </motion.div>

          {/* Progress bar */}
          <motion.div className="mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="flex gap-2">
              <div className="flex-1 h-1 rounded-full overflow-hidden bg-gray-100">
                <motion.div className="h-full bg-[#C9A96E]" initial={{ width: '100%' }} />
              </div>
              <div className="flex-1 h-1 rounded-full overflow-hidden bg-gray-100">
                <motion.div className="h-full bg-[#C9A96E]" animate={{ width: step >= 2 ? '100%' : '0%' }} transition={{ duration: 0.5 }} />
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.2em', color: '#8B6F47', textTransform: 'uppercase' }}>
                Your Info
              </span>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.2em', color: step >= 2 ? '#8B6F47' : '#bbb', textTransform: 'uppercase' }}>
                Security
              </span>
            </div>
          </motion.div>

          <AnimatePresence>
            {serverError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 p-3 text-sm text-center mb-6 overflow-hidden">
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                  <div>
                    <label style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.36em', textTransform: 'uppercase', color: '#4A3728', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      Full Name
                    </label>
                    <input type="text"
                      className="w-full border border-gray-200 p-3.5 text-sm focus:outline-none focus:border-[#C9A96E] transition-colors bg-white/50"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      placeholder="Enter your full name"
                      {...register('name', { required: 'Name is required' })} />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.36em', textTransform: 'uppercase', color: '#4A3728', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      Email Address
                    </label>
                    <input type="email"
                      className="w-full border border-gray-200 p-3.5 text-sm focus:outline-none focus:border-[#C9A96E] transition-colors bg-white/50"
                      style={{ fontFamily: "'Jost', sans-serif" }}
                      placeholder="your@email.com"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                      })} />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <button type="button" onClick={() => setStep(2)}
                    className="w-full py-4 uppercase text-sm relative overflow-hidden group"
                    style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.3em', fontSize: '10px', fontWeight: 700, background: '#4A3728', color: '#FDF8F3' }}>
                    <span className="relative z-10">Continue</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C9A96E] to-[#8B6F47] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <label style={{ fontFamily: "'Cinzel', serif", fontSize: '8px', letterSpacing: '0.36em', textTransform: 'uppercase', color: '#4A3728', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                      Create Password
                    </label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'}
                        className="w-full border border-gray-200 p-3.5 text-sm focus:outline-none focus:border-[#C9A96E] transition-colors bg-white/50 pr-12"
                        style={{ fontFamily: "'Jost', sans-serif" }}
                        placeholder="Min 6 characters"
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Min 6 characters' }
                        })} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8B6F47] transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </div>
                    {password && (
                      <div className="mt-2">
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div className="h-full rounded-full" style={{ background: strength.color }}
                            animate={{ width: strength.width }} transition={{ duration: 0.3 }} />
                        </div>
                        <span className="text-xs mt-1 block" style={{ color: strength.color }}>{strength.label}</span>
                      </div>
                    )}
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(1)}
                      className="flex-1 py-4 uppercase text-sm border border-gray-200 hover:border-[#C9A96E] transition-colors"
                      style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.2em', fontSize: '9px', fontWeight: 600, color: '#7A6555' }}>
                      Back
                    </button>
                    <button type="submit" disabled={isSubmitting}
                      className="flex-[2] py-4 uppercase text-sm relative overflow-hidden group disabled:opacity-50"
                      style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.3em', fontSize: '10px', fontWeight: 700, background: '#4A3728', color: '#FDF8F3' }}>
                      <span className="relative z-10">{isSubmitting ? 'Creating...' : 'Create Account'}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-[#C9A96E] to-[#8B6F47] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-[rgba(139,111,71,0.15)]" />
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.3em', color: '#7A6555', textTransform: 'uppercase' }}>Or</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-[rgba(139,111,71,0.15)]" />
            </div>
            <p className="text-center text-sm" style={{ fontFamily: "'Jost', sans-serif", color: '#7A6555' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline" style={{ color: '#8B6F47' }}>Sign In</Link>
            </p>
          </motion.div>
        </div>

        <motion.div className="flex items-center justify-center gap-3 mt-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
          <div className="h-px w-8" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.3))' }} />
          <div className="w-1.5 h-1.5 bg-[rgba(201,169,110,0.4)]" style={{ transform: 'rotate(45deg)' }} />
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: '7px', letterSpacing: '0.3em', color: 'rgba(122,101,85,0.5)', textTransform: 'uppercase' }}>
            Premium Wedding Planning
          </span>
          <div className="w-1.5 h-1.5 bg-[rgba(201,169,110,0.4)]" style={{ transform: 'rotate(45deg)' }} />
          <div className="h-px w-8" style={{ background: 'linear-gradient(270deg, transparent, rgba(201,169,110,0.3))' }} />
        </motion.div>
      </motion.div>
    </div>
  );
}
