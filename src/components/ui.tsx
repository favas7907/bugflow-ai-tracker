import React, { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  animate?: boolean;
  hover?: boolean;
}

export function Card({ children, className, animate = true, hover = false, ...props }: CardProps) {
  return (
    <div 
      className={cn(
        "glass-card rounded-2xl p-5",
        hover && "hover:shadow-glow-cyan transition-all duration-200 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ children, variant = 'primary', size = 'md', className, disabled, ...props }: ButtonProps) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#040812] disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-plasma-500 text-white hover:bg-plasma-400 focus:ring-plasma-500 shadow-glow-cyan",
    secondary: "bg-white/[0.04] text-cyber-50 border border-white/10 hover:bg-white/[0.08] focus:ring-cyber-500",
    danger: "bg-lava-500 text-white hover:bg-lava-400 focus:ring-lava-500",
    ghost: "text-cyber-400 hover:bg-white/[0.04] hover:text-cyber-50"
  };
  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-6 py-3"
  };
  return (
    <button 
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)} 
      {...props}
    >
      {disabled && <Loader2 className="w-4 h-4 animate-spin" />}
      {!disabled && children}
    </button>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={cn(
      "w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-cyber-50 placeholder-cyber-600 focus:border-plasma-500 focus:ring-2 focus:ring-plasma-500/20 focus:outline-none transition-all",
      className
    )} {...props} />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(
      "w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-cyber-50 placeholder-cyber-600 focus:border-plasma-500 focus:ring-2 focus:ring-plasma-500/20 focus:outline-none transition-all",
      className
    )} {...props} />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(
      "w-full rounded-xl border border-white/10 bg-[#040812] px-3 py-2 text-sm text-cyber-50 focus:border-plasma-500 focus:ring-2 focus:ring-plasma-500/20 focus:outline-none appearance-none cursor-pointer",
      className
    )} {...props}>
      {children}
    </select>
  );
}

export function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-xs font-bold text-cyber-400 mb-1.5 tracking-wide", className)} {...props}>{children}</label>;
}

export function Badge({ children, colorClasses, className }: { children: React.ReactNode; colorClasses: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider", colorClasses, className)}>
      {children}
    </span>
  );
}

export function Avatar({ name, size = 'md' }: { name: string, size?: 'sm'|'md'|'lg' }) {
  const initials = name ? name.substring(0, 2).toUpperCase() : '?';
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
  return (
    <div className={cn("rounded-full bg-plasma-500/20 text-plasma-400 flex items-center justify-center font-bold border border-plasma-500/30 shrink-0", sizes[size])}>
      {initials}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-plasma-500" />
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-white/[0.04] text-plasma-400 rounded-2xl flex items-center justify-center mb-4 border border-white/10 shadow-glow-cyan">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-cyber-50">{title}</h3>
      <p className="text-sm text-cyber-400 mt-1 max-w-sm">{description}</p>
    </div>
  );
}
