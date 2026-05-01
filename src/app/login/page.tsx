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
    <div className="stitch-gradient min-h-screen flex flex-col items-center justify-center px-4">
      <div className="cyber-particles" />
      <motion.div
        className="w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-plasma-500 to-stitch-500 text-cyber-950 mb-5 shadow-glow-cyan"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Bug size={30} />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-cyber-50 tracking-tight font-heading">Welcome back</h1>
          <p className="text-cyber-400 text-sm mt-2 flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-plasma-500" />
            Sign in to your BugFlow workspace
          </p>
        </motion.div>

        {/* Firebase setup warning */}
        {authError && (
          <motion.div
            className="mb-6 p-4 rounded-2xl bg-lava-500/10 border border-lava-500/20 text-lava-300 text-sm backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-start gap-2">
              <Info size={18} className="shrink-0 mt-0.5 text-lava-400" />
              <div>
                <p className="font-bold mb-1 text-lava-300">Firebase Setup Required</p>
                <p className="text-lava-400/80 text-xs leading-relaxed">
                  {authError}. Copy <code className="bg-lava-500/10 px-1.5 py-0.5 rounded-lg text-lava-300">
                  .env.local.example</code> to <code className="bg-lava-500/10 px-1.5 py-0.5 rounded-lg text-lava-300">
                  .env.local</code> and fill in your Firebase credentials.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Card */}
        <motion.div
          className="glass-card rounded-3xl p-8 shadow-glass-lg bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08]"
          variants={itemVariants}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {formError && (
              <motion.div
                className="flex items-center gap-2 p-3.5 rounded-2xl bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20"
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
                <Mail size={16} className="absolute left-4 top-3.5 text-cyber-500" />
                <Input
                  id="login-email"
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
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-cyber-500" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pl-11"
                />
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? 'Signing in…' : 'Sign In'}
              </Button>
            </motion.div>
          </form>
        </motion.div>

        <motion.p className="text-center text-sm text-cyber-500 mt-6" variants={itemVariants}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-plasma-400 font-bold hover:text-plasma-300 transition-colors">
            Create one
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
