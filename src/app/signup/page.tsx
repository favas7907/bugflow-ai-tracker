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
    <div className="stitch-gradient min-h-screen flex flex-col items-center justify-center px-4">
      <div className="cyber-particles" />
      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-plasma-500 to-stitch-500 text-cyber-950 mb-5 shadow-glow-cyan"
            whileHover={{ scale: 1.1, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Bug size={30} />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-cyber-50 tracking-tight font-heading">Create your account</h1>
          <p className="text-cyber-400 text-sm mt-2 flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-plasma-500" />
            Join BugFlow — no role needed at signup
          </p>
        </motion.div>

        <motion.div
          className="glass-card rounded-3xl p-8 shadow-glass-lg bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08]"
          variants={itemVariants}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20"
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
                <User size={16} className="absolute left-4 top-3.5 text-cyber-500" />
                <Input
                  id="signup-name"
                  placeholder="Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  className="pl-11"
                />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-cyber-500" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="pl-11"
                />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-cyber-500" />
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="pl-11"
                />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create Account'}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <motion.p className="text-center text-sm text-cyber-500 mt-6" variants={itemVariants}>
          Already have an account?{' '}
          <Link href="/login" className="text-plasma-400 font-bold hover:text-plasma-300 transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
