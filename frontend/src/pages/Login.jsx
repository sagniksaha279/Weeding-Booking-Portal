import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from '@tanstack/react-router';
import { login } from '../utils/api';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const bubbles = useMemo(() => {
    return [...Array(6)].map(() => ({
      width: Math.random() * 300 + 100,
      height: Math.random() * 300 + 100,
      left: Math.random() * 100,
      top: Math.random() * 100,
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
      duration: 8 + Math.random() * 4,
      opacity: 0.03 + Math.random() * 0.04
    }));
  }, []);

  const onSubmit = async (data) => {
    try {
      setServerError('');
      const response = await login(data);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate({ to: '/dashboard' });
    } catch (error) {
      setServerError(error.response?.data?.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FDF8F3 0%, #F5EFE8 50%, #FDF8F3 100%)' }}>

      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {bubbles.map((bubble, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: bubble.width,
              height: bubble.height,
              background: `radial-gradient(circle, rgba(201,169,110,${bubble.opacity}) 0%, transparent 70%)`,
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
            }}
            animate={{
              x: [0, bubble.x],
              y: [0, bubble.y],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: bubble.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-xl border shadow-xl p-8">

          <h2 className="text-2xl mb-4 text-center">Login</h2>

          <AnimatePresence>
            {serverError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-red-500 mb-4 text-center"
              >
                {serverError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <input
              type="email"
              placeholder="Email"
              className="w-full border p-3"
              {...register('email', { required: 'Email required' })}
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full border p-3"
                {...register('password', { required: 'Password required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-red-500">{errors.password.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white py-3"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>

          </form>

          <p className="text-center mt-4">
            Don't have an account? <Link to="/signup">Signup</Link>
          </p>

        </div>
      </motion.div>
    </div>
  );
}