'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      const token = data.session?.access_token;
      if (token) {
        const fifteenDaysInSeconds = 15 * 24 * 60 * 60;
        const isProduction = process.env.NODE_ENV === 'production';
        const secureFlag = isProduction ? '; Secure' : '';

        document.cookie = `auth_token=${token}; path=/; max-age=${fifteenDaysInSeconds}; SameSite=Lax${secureFlag}`;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-black text-white font-sans">
      <div className="hidden lg:flex w-1/2 items-center justify-center border-r border-zinc-800">
        <h1 className="font-serif text-5xl font-bold tracking-widest text-white">
          ABI&amp;Co.
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-[#ECECEC] text-black">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl">
          <h2 className="font-serif text-3xl font-bold tracking-wider mb-1">
            SIGN IN
          </h2>
          <p className="text-xs text-gray-500 mb-8 tracking-wide">
            System Login
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-xs rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-xs font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="System's Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-xs font-sans text-black focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-full text-xs font-bold tracking-wider hover:bg-zinc-800 transition shadow-md mt-4 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}