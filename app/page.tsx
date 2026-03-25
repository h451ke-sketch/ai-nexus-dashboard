'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Bot, Zap, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="landing-container">
      <style jsx>{`
        .landing-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          text-align: center;
          background: radial-gradient(circle at center, #1e1b4b 0%, #050505 100%);
        }
        .header {
           max-width: 800px;
        }
        .badge {
           display: inline-flex;
           align-items: center;
           gap: 0.5rem;
           padding: 0.5rem 1rem;
           background: rgba(99, 102, 241, 0.1);
           border: 1px solid rgba(99, 102, 241, 0.2);
           border-radius: 2rem;
           color: #6366f1;
           font-size: 0.875rem;
           font-weight: 600;
           margin-bottom: 2rem;
        }
        .title {
          font-size: 4rem;
          font-weight: 900;
          letter-spacing: -0.05em;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(to bottom right, #fff 30%, rgba(255,255,255,0.4));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 3rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          max-width: 1000px;
          margin-top: 6rem;
          width: 100%;
        }
        .feature-card {
           padding: 2rem;
           border-radius: 1.5rem;
           text-align: left;
           transition: transform 0.3s ease;
        }
        .feature-card:hover {
           transform: translateY(-5px);
        }
        .icon-box {
           width: 48px;
           height: 48px;
           border-radius: 12px;
           background: rgba(255, 255, 255, 0.05);
           display: flex;
           align-items: center;
           justify-content: center;
           margin-bottom: 1.5rem;
           color: #6366f1;
        }
        @media (max-width: 640px) {
          .title { font-size: 2.5rem; }
          .actions { flex-direction: column; width: 100%; }
        }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="header"
      >
        <div className="badge">
          <Sparkles size={14} />
          <span>New: AI Nexus v1.0</span>
        </div>
        <h1 className="title">
          Elevate your productivity <br /> with AI Nexus.
        </h1>
        <p className="subtitle">
          The ultimate AI assistant portal. Seamless authentication, beautiful design, and powerful intelligence at your fingertips.
        </p>

        <div className="actions">
          <Link href="/auth/signup" className="btn-primary">
            Get Started <ArrowRight size={18} />
          </Link>
          <Link href="/auth/login" className="glass" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.75rem', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="features"
      >
        <div className="feature-card glass">
           <div className="icon-box"><Bot size={24} /></div>
           <h3 style={{ marginBottom: '1rem' }}>Smart Intelligence</h3>
           <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
             Powered by OpenAI&apos;s latest models for accurate and insightful responses.
           </p>
        </div>
        <div className="feature-card glass">
           <div className="icon-box"><Shield size={24} /></div>
           <h3 style={{ marginBottom: '1rem' }}>Secure Auth</h3>
           <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
             Built-in Supabase authentication for robust security and user management.
           </p>
        </div>
        <div className="feature-card glass">
           <div className="icon-box"><Zap size={24} /></div>
           <h3 style={{ marginBottom: '1rem' }}>Ultra Fast</h3>
           <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>
             Optimized for speed with Next.js App Router and real-time integration.
           </p>
        </div>
      </motion.div>
    </div>
  );
}
