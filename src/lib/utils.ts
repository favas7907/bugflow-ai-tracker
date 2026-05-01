import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Role = 'Admin' | 'Member';
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: Priority;
  reporterId: string;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  issueId: string;
  fileName: string;
  url: string;
  contentType: string;
  createdAt: string;
}

export const STATUS_COLORS: Record<IssueStatus, string> = {
  'Open': 'bg-stitch-500/10 text-stitch-400 border-stitch-500/20',
  'In Progress': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Resolved': 'bg-plasma-500/10 text-plasma-400 border-plasma-500/20',
  'Closed': 'bg-cyber-500/10 text-cyber-400 border-cyber-500/20',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  'Low': 'bg-cyber-500/10 text-cyber-400 border-cyber-500/20',
  'Medium': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'High': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Critical': 'bg-lava-500/10 text-lava-400 border-lava-500/20',
};

export const KANBAN_COLUMNS: IssueStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
