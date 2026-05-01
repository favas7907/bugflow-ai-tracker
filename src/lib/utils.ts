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
  'Open': 'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Resolved': 'bg-primary-50 text-primary-700 border-primary-200',
  'Closed': 'bg-slate-100 text-slate-700 border-slate-200',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  'Low': 'bg-slate-50 text-slate-600 border-slate-200',
  'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
  'High': 'bg-orange-50 text-orange-700 border-orange-200',
  'Critical': 'bg-red-50 text-red-700 border-red-200',
};

export const KANBAN_COLUMNS: IssueStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
