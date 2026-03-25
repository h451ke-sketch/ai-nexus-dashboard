'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  LogOut, 
  Settings, 
  User, 
  Bot, 
  Sparkles,
  Loader2,
  Edit3,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Session = {
  id: string;
  title: string;
  type: 'text' | 'image';
  created_at: string;
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatMode, setChatMode] = useState<'text' | 'image'>('text');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        setCurrentSessionId(data[0].id);
      }
    }
  }, [currentSessionId]);

  const fetchMessages = React.useCallback(async (sid: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('role, content')
      .eq('session_id', sid)
      .order('created_at', { ascending: true });
    
    if (!error && data) {
      setMessages(data as Message[]);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  useEffect(() => {
    if (currentSessionId) {
      const currentSession = sessions.find((s: Session) => s.id === currentSessionId);
      if (currentSession) {
        setChatMode(currentSession.type);
      }
      fetchMessages(currentSessionId);
    }
  }, [currentSessionId, fetchMessages, sessions]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startNewSession = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, title: 'New Conversation', type: chatMode })
      .select()
      .single();
    
    if (!error && data) {
      setSessions([data, ...sessions]);
      setCurrentSessionId(data.id);
      setMessages([]);
    }
  };

  const deleteSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    const { error } = await supabase.from('sessions').delete().eq('id', sid);
    if (!error) {
      setSessions((prev: Session[]) => prev.filter((s: Session) => s.id !== sid));
      if (currentSessionId === sid) {
        setMessages([]);
        setCurrentSessionId(null);
      }
    }
  };

  const renameSession = async (sid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTitle = prompt('Enter new title:');
    if (!newTitle) return;

    const { error } = await supabase
      .from('sessions')
      .update({ title: newTitle })
      .eq('id', sid);
    
    if (!error) {
      setSessions((prev: Session[]) => prev.map((s: Session) => s.id === sid ? { ...s, title: newTitle } : s));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !currentSessionId) return;

    const userMessage: Message = { role: 'user', content: input };
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const content = input;
    setInput('');
    setSending(true);

    // Save user message to database
    await supabase.from('messages').insert({
      session_id: currentSessionId,
      role: 'user',
      content: content,
    });

    // Generate title if it's the first message
    const firstMessage = messages.length === 0;
    if (firstMessage) {
      const generatedTitle = content.length > 20 ? content.substring(0, 20) + "..." : content;
      await supabase
        .from('sessions')
        .update({ title: generatedTitle })
        .eq('id', currentSessionId);
      
      setSessions((prev: Session[]) => prev.map((s: Session) => s.id === currentSessionId ? { ...s, title: generatedTitle } : s));
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: currentMessages.map(m => ({ role: m.role, content: m.content })),
          type: chatMode
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch AI response');

      const data = await response.json();
      const assistantMessage: Message = { role: 'assistant', content: data.message };
      
      setMessages((prev: Message[]) => [...prev, assistantMessage]);
      // Save assistant message to database
      await supabase.from('messages').insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: data.message,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (authLoading || !user) {
    return (
      <div className="loading-screen">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <aside className={`sidebar glass ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
           <button className="btn-primary" style={{ width: '100%' }} onClick={startNewSession}>
             <Plus size={18} /> New Chat
           </button>
        </div>
        <div className="sidebar-content">
          {sessions.map((s: Session) => (
            <div 
              key={s.id} 
              className={`session-item ${currentSessionId === s.id ? 'active' : ''}`}
              onClick={() => setCurrentSessionId(s.id)}
            >
              <MessageSquare size={16} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {s.title}
              </span>
              <div className="session-actions">
                 <button onClick={(e: React.MouseEvent) => renameSession(s.id, e)} title="Rename">
                   <Edit3 size={14} />
                 </button>
                 <button onClick={(e: React.MouseEvent) => deleteSession(s.id, e)} title="Delete">
                   <Trash2 size={14} />
                 </button>
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="avatar">{user.email?.charAt(0).toUpperCase()}</div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Free Plan</p>
            </div>
          </div>
          <button 
            onClick={handleSignOut}
            className="session-item" 
            style={{ width: '100%', border: 'none', background: 'transparent' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <button onClick={() => setSidebarOpen(!sidebarOpen)}>
               {sidebarOpen ? <Settings size={20} /> : <MessageSquare size={20} />}
             </button>
             <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>AI Nexus</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <Sparkles size={18} className="text-primary" />
             <div className="glass" style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem' }}>{chatMode === 'text' ? 'GLM-4' : 'CogView-3'}</div>
          </div>
        </header>

        <div className="messages-container">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="welcome-screen"
              >
                <div className="logo-large">AI Nexus</div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>How can I help you today?</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '500px' }}>
                  {chatMode === 'text' 
                    ? "Ask me anything from writing code to brainstorming ideas for your next big project."
                    : "Describe the image you want me to generate. Be specific for better results!"}
                </p>
              </motion.div>
            ) : (
              messages.map((m: Message, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`message-bubble ${m.role}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', opacity: 0.6, fontSize: '0.75rem' }}>
                    {m.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                    {m.role === 'assistant' ? 'AI Assistant' : 'You'}
                  </div>
                  {m.content.startsWith('http') ? (
                    <img src={m.content} alt="AI Generated" className="msg-image" />
                  ) : (
                    m.content
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-container">
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${chatMode === 'text' ? 'active' : ''}`}
              onClick={() => setChatMode('text')}
            >
              Text Mode
            </button>
            <button 
              className={`mode-btn ${chatMode === 'image' ? 'active' : ''}`}
              onClick={() => setChatMode('image')}
            >
              Image Mode
            </button>
          </div>
          <form onSubmit={handleSend} className="chat-input-wrapper">
             <input 
               type="text" 
               className="chat-input" 
               placeholder="Message AI Nexus..."
               value={input}
               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
               disabled={sending}
             />
             <button type="submit" className="send-button" disabled={sending || !input.trim()}>
               {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
             </button>
          </form>
          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.75rem' }}>
            AI Nexus can make mistakes. Consider checking important information.
          </p>
        </div>
      </main>
    </div>
  );
}
