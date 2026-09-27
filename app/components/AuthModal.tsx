'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, Loader2, X } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabaseBrowser } from '@/lib/supabase-browser';

type AuthModalProps = { open: boolean; onClose: () => void; onAuthenticated: (user: User, message: string) => void };

export default function AuthModal({ open, onClose, onAuthenticated }: AuthModalProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    const result = mode === 'sign-in'
      ? await supabaseBrowser.auth.signInWithPassword({ email, password })
      : await supabaseBrowser.auth.signUp({ email, password });
    if (result.error) {
      setMessage(result.error.message);
    } else if (result.data.user) {
      onAuthenticated(result.data.user, mode === 'sign-up' && !result.data.session ? 'Check your email to confirm your account.' : 'Authentication successful.');
      if (result.data.session) onClose();
    }
    setIsSubmitting(false);
  };

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="auth-title">
    <div className="w-full max-w-md border border-zinc-700 bg-zinc-950 p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">Private workspace</p><h2 id="auth-title" className="mt-2 text-xl font-semibold text-white">{mode === 'sign-in' ? 'Welcome back' : 'Create your account'}</h2><p className="mt-2 text-xs leading-5 text-zinc-500">Keep experiment memory tied to your team identity.</p></div><button type="button" onClick={onClose} aria-label="Close authentication dialog" className="rounded-md p-2 text-zinc-500 hover:bg-zinc-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"><X className="h-5 w-5" /></button></div>
      <form onSubmit={submit} className="mt-7 space-y-4"><div><label htmlFor="auth-email" className="mb-2 block text-xs font-medium text-zinc-300">Email</label><input id="auth-email" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="h-11 w-full border border-zinc-800 bg-black px-3 text-sm text-white outline-none focus:ring-2 focus:ring-zinc-400" /></div><div><label htmlFor="auth-password" className="mb-2 block text-xs font-medium text-zinc-300">Password</label><input id="auth-password" type="password" required minLength={6} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={event => setPassword(event.target.value)} className="h-11 w-full border border-zinc-800 bg-black px-3 text-sm text-white outline-none focus:ring-2 focus:ring-zinc-400" /></div>{message && <p className="border border-zinc-700 bg-zinc-900 px-3 py-3 text-xs leading-5 text-zinc-200" role="alert">{message}</p>}<button type="submit" disabled={isSubmitting} className="flex h-11 w-full items-center justify-center gap-2 bg-white text-sm font-semibold text-black hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-60">{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{mode === 'sign-in' ? 'Sign in' : 'Create account'}</button></form>
      <button type="button" onClick={() => { setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); setMessage(''); }} className="mt-5 w-full text-center text-xs text-zinc-400 underline-offset-4 hover:text-white hover:underline focus:outline-none focus:ring-2 focus:ring-zinc-400">{mode === 'sign-in' ? 'Need an account? Register' : 'Already registered? Sign in'}</button>
    </div>
  </div>;
}
