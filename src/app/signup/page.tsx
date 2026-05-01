'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Input, Button, Label } from '@/components/ui';
import { Bug, AlertCircle, Sparkles, Mail, Lock, User } from 'lucide-react';
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

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password) return setError('All fields are required.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setSubmitting(true);
    try {
      await signUp(email, password, name);
      router.push('/dashboard');
    } catch (err: any) {
      setError(
        err.message?.includes('already-in-use')
          ? 'An account with this email already exists.'
          : err.message || 'Signup failed.'
      );
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
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black text-primary-500 mb-5 shadow-sm border border-zinc-200/60"
            whileHover={{ scale: 1.05, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Bug size={28} />
          </motion.div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Create your account</h1>
          <p className="text-zinc-500 text-sm mt-2 flex items-center justify-center gap-1.5">
            Join BugFlow — no role needed at signup
          </p>
        </motion.div>

        <motion.div
          className="glass-card rounded-2xl p-8"
          variants={itemVariants}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}
            <motion.div variants={itemVariants}>
              <Label htmlFor="signup-name">Full Name</Label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                <Input
                  id="signup-name"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  className="pl-10"
                />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                <Input
                  id="signup-email"
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
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="pl-10"
                />
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="pt-2">
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create Account'}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <motion.p className="text-center text-sm text-zinc-500 mt-6" variants={itemVariants}>
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 font-bold hover:text-primary-700 transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
