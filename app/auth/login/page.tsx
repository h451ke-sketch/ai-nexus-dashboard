'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <style jsx>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
        }
        .auth-card {
           width: 100%;
           max-width: 400px;
           padding: 2.5rem;
           border-radius: 1.5rem;
        }
        .title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          text-align: center;
          background: linear-gradient(to right, #6366f1, #f43f5e);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          margin-bottom: 2rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .input-wrapper {
          position: relative;
        }
        .icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
        }
        .input-glass {
          padding-left: 3rem !important;
        }
        .error-message {
          color: #f43f5e;
          background: rgba(244, 63, 94, 0.1);
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          border: 1px solid rgba(244, 63, 94, 0.2);
        }
        .footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }
        .link {
          color: #6366f1;
          font-weight: 600;
        }
      `}</style>

      <div className="auth-card glass">
        <h1 className="title">Welcome Back</h1>
        <p className="subtitle">Sign in to your AI Nexus account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="icon" size={18} />
              <input
                type="email"
                className="input-glass"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Password</label>
            <div className="input-wrapper">
              <Lock className="icon" size={18} />
              <input
                type="password"
                className="input-glass"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="footer">
          Don&apos;t have an account? <Link href="/auth/signup" className="link">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
