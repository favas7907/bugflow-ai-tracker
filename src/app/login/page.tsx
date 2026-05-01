'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Input, Button, Label } from '@/components/ui';
import { Bug, AlertCircle, Info, Sparkles, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, error: authError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) return setFormError('All fields are required.');
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err?.code || err?.message || 'Login failed.';
      if (msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        setFormError('Invalid email or password.');
      } else if (msg.includes('invalid-api-key')) {
        setFormError('Firebase is not configured. Add API keys to .env.local');
      } else {
        setFormError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-50 min-h-screen flex flex-col items-center justify-center px-4">
      <motion.div
        className="w-full max-w-[400px] relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-primary-600 mb-5 shadow-sm border border-slate-200/60"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Bug size={28} />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-2 flex items-center justify-center gap-1.5">
            Sign in to your BugFlow workspace
          </p>
        </motion.div>

        {/* Firebase setup warning */}
        {authError && (
          <motion.div
            className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-800 text-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-start gap-2">
              <Info size={18} className="shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-bold mb-1">Firebase Setup Required</p>
                <p className="text-red-700/80 text-xs leading-relaxed">
                  {authError}. Copy <code className="bg-red-100 px-1.5 py-0.5 rounded-md">.env.local.example</code> to <code className="bg-red-100 px-1.5 py-0.5 rounded-md">.env.local</code> and fill in your Firebase credentials.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Card */}
        <motion.div
          className="glass-card rounded-2xl p-8"
          variants={itemVariants}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <motion.div
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle size={16} className="shrink-0" />
                {formError}
              </motion.div>
            )}
            <motion.div variants={itemVariants}>
              <Label htmlFor="login-email">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="pl-10"
                />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pl-10"
                />
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="pt-2">
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <motion.p className="text-center text-sm text-slate-500 mt-6" variants={itemVariants}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            Create one
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
