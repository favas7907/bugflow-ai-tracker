'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, X } from 'lucide-react';
import { getAllIssues } from '@/lib/firestore';
import type { Issue, IssueStatus, Priority } from '@/lib/utils';
import { STATUS_COLORS, PRIORITY_COLORS, STATUS_ICONS } from '@/lib/utils';
import { Badge } from '@/components/ui';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Load issues when palette opens
  useEffect(() => {
    if (open && !loaded) {
      getAllIssues()
        .then(setIssues)
        .catch(() => {})
        .finally(() => setLoaded(true));
    }
  }, [open, loaded]);

  // Global keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Fuzzy search
  const filtered = issues.filter((issue) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      issue.title.toLowerCase().includes(q) ||
      issue.description.toLowerCase().includes(q) ||
      issue.status.toLowerCase().includes(q) ||
      issue.priority.toLowerCase().includes(q)
    );
  });

  // Reset selected index when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = useCallback(
    (issue: Issue) => {
      setOpen(false);
      router.push(`/issues/${issue.id}`);
    },
    [router]
  );

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
          onClick={() => setOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-xl bg-cyber-900/95 backdrop-blur-2xl border border-white/[0.1] rounded-3xl shadow-glass-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
              <Search size={20} className="text-plasma-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search bugs by title, status, priority..."
                className="flex-1 bg-transparent text-cyber-100 text-sm placeholder:text-cyber-500 focus:outline-none"
              />
              <div className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 text-[10px] font-bold bg-white/[0.06] text-cyber-400 rounded-lg border border-white/10">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto scrollbar-thin">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <Search size={32} className="mx-auto mb-3 text-cyber-600" />
                  <p className="text-cyber-500 text-sm font-medium">
                    {query ? 'No bugs found matching your search' : 'No bugs tracked yet'}
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {filtered.slice(0, 20).map((issue, idx) => (
                    <button
                      key={issue.id}
                      onClick={() => handleSelect(issue)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-all duration-100 group ${
                        idx === selectedIndex
                          ? 'bg-plasma-500/10 border-l-2 border-plasma-500'
                          : 'border-l-2 border-transparent hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-cyber-100 truncate">
                            {issue.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge colorClasses={STATUS_COLORS[issue.status]}>
                            {STATUS_ICONS[issue.status]} {issue.status}
                          </Badge>
                          <Badge colorClasses={PRIORITY_COLORS[issue.priority]}>
                            {issue.priority}
                          </Badge>
                        </div>
                      </div>
                      <ArrowRight
                        size={14}
                        className={`shrink-0 transition-all ${
                          idx === selectedIndex
                            ? 'text-plasma-400 translate-x-0 opacity-100'
                            : 'text-cyber-600 -translate-x-1 opacity-0'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-cyber-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded text-cyber-400 border border-white/10">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/[0.06] rounded text-cyber-400 border border-white/10">↵</kbd>
                  Open
                </span>
              </div>
              <span>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
