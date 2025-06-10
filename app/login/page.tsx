// app/login/page.tsx
'use client';

import { useState, FormEvent, useEffect } from 'react'; // Added useEffect
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase'; // Adjust path if your client is elsewhere
import { FaEnvelope, FaLock, FaSignInAlt, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Link from 'next/link'; // Import Link

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // To show loading while checking
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkUserSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        router.replace('/dashboard'); // User is logged in, redirect to dashboard
      } else {
        setIsCheckingAuth(false); // No active session, show login page
      }
    };

    checkUserSession();
  }, [router]); // router is a dependency

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      // On successful login, Supabase client handles session.
      // Redirect to the dashboard using push so it's in history for this action.
      router.push('/dashboard');
    }
    setIsLoading(false);
  };

  // Show a loading indicator while checking authentication status
  if (isCheckingAuth) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-primary-background'>
        <FaSpinner className='animate-spin text-accent text-4xl' />
      </div>
    );
  }

  // If not checking auth (meaning no user session was found initially), render the login form
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-primary-background p-4'>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md'
      >
        <div className='bg-secondary-background shadow-2xl rounded-xl p-8 sm:p-10'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-accent font-serif'>
              Dashboard Login
            </h1>
            <p className='text-primary-text/70 mt-2'>
              Access your content management panel.
            </p>
          </div>

          <form onSubmit={handleLogin} className='space-y-6'>
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-primary-text/80 mb-1.5'
              >
                Email address
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaEnvelope className='text-gray-400 h-4 w-4' />
                </div>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='w-full pl-10 p-3 rounded-lg bg-[var(--color-input-background,theme(colors.gray.800))] border border-[var(--color-input-border,theme(colors.gray.700))] focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 text-primary-text placeholder-gray-500 shadow-sm'
                  placeholder='you@example.com'
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-primary-text/80 mb-1.5'
              >
                Password
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <FaLock className='text-gray-400 h-4 w-4' />
                </div>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='w-full pl-10 p-3 rounded-lg bg-[var(--color-input-background,theme(colors.gray.800))] border border-[var(--color-input-border,theme(colors.gray.700))] focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 text-primary-text placeholder-gray-500 shadow-sm'
                  placeholder='••••••••'
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <p className='text-sm text-red-400 bg-red-500/10 p-3 rounded-md text-center'>
                {error}
              </p>
            )}

            <div>
              <button
                type='submit'
                disabled={isLoading}
                className='w-full flex items-center justify-center gap-2.5 py-3 px-6 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-accent hover:bg-opacity-85 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent focus:ring-offset-secondary-background disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out'
              >
                {isLoading ? (
                  <FaSpinner className='animate-spin h-5 w-5' />
                ) : (
                  <FaSignInAlt className='h-5 w-5' />
                )}
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
        <p className='mt-8 text-center text-sm text-primary-text/60'>
          This is a restricted area. Public site:{' '}
          <Link
            href='https://www.joana-agostinho.com'
            className='font-medium text-accent hover:underline'
          >
            Go to Portfolio
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
