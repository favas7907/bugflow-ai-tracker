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
        "bg-white border border-surface-200 shadow-sm rounded-2xl p-6",
        hover && "hover:shadow-md transition-all duration-300",
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
  const base = "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-600 shadow-sm",
    secondary: "bg-white text-surface-900 border border-surface-200 hover:bg-surface-50 focus:ring-surface-200 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    ghost: "text-surface-500 hover:bg-surface-100 hover:text-surface-900"
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
      "w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all",
      className
    )} {...props} />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(
      "w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-900 placeholder-surface-400 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all",
      className
    )} {...props} />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(
      "w-full rounded-xl border border-surface-200 bg-white px-4 py-2.5 text-sm text-surface-900 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none appearance-none cursor-pointer",
      className
    )} {...props}>
      {children}
    </select>
  );
}

export function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-[13px] font-medium text-surface-900 mb-1.5", className)} {...props}>{children}</label>;
}

export function Badge({ children, colorClasses, className }: { children: React.ReactNode; colorClasses: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", colorClasses, className)}>
      {children}
    </span>
  );
}

export function Avatar({ name, size = 'md' }: { name: string, size?: 'sm'|'md'|'lg' }) {
  const initials = name ? name.substring(0, 2).toUpperCase() : '?';
  const sizes = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };
  return (
    <div className={cn("rounded-full bg-primary-50 text-primary-600 flex items-center justify-center font-bold border border-primary-100 shrink-0", sizes[size])}>
      {initials}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-surface-400" />
    </div>
  );
}

export function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-surface-50 text-surface-400 rounded-2xl flex items-center justify-center mb-4 border border-surface-200 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-surface-900">{title}</h3>
      <p className="text-sm text-surface-500 mt-1 max-w-sm">{description}</p>
    </div>
  );
}
