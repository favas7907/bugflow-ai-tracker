'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '@/components/ui';
import {
  Bug,
  LayoutDashboard,
  ListTodo,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Issues', path: '/issues', icon: ListTodo },
  { name: 'Members', path: '/members', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, logOut } = useAuth();
  const [open, setOpen] = useState(false);

  const navContent = (
    <>
      <div className="h-[72px] flex items-center px-5 border-b border-slate-200 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center mr-3 border border-primary-200">
          <Bug size={20} />
        </div>
        <div>
          <span className="text-slate-900 font-extrabold text-lg tracking-tight font-heading">Bug Tracker</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname === item.path || (item.path === '/issues' && pathname.startsWith('/issues'));
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setOpen(false)}
              className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-500 rounded-r-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <Icon
                size={18}
                className={active ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-3 px-2 mb-3">
          <Avatar name={profile?.displayName || 'U'} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="text-sm text-slate-900 font-bold truncate">{profile?.displayName}</div>
            <div className="text-xs text-slate-500 truncate">{profile?.role}</div>
          </div>
        </div>
        <button
          onClick={logOut}
          className="flex items-center gap-2 text-sm text-slate-600 font-medium w-full px-3 py-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-all duration-200"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-white text-slate-900 shadow-md border border-slate-200"
        aria-label="Toggle menu"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-[260px] bg-white text-slate-600 flex flex-col h-screen shrink-0 transition-transform duration-300 ease-out border-r border-slate-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
