import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { AppUser, Issue, Comment, Attachment, IssueStatus, Priority, Role } from './utils';

// ─── Users ───────────────────────────────────────────────

export async function createUserProfile(uid: string, email: string, displayName: string): Promise<void> {
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    displayName,
    role: 'Member' as Role,
    createdAt: new Date().toISOString(),
  });
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function getAllUsers(): Promise<AppUser[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => d.data() as AppUser);
}

export async function updateUserRole(uid: string, role: Role): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { role });
}

export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}

// ─── Issues ──────────────────────────────────────────────

export async function createIssue(data: {
  title: string;
  description: string;
  priority: Priority;
  assigneeId: string | null;
  reporterId: string;
}): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, 'issues'), {
    ...data,
    status: 'Open' as IssueStatus,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function getIssue(id: string): Promise<Issue | null> {
  const snap = await getDoc(doc(db, 'issues', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Issue;
}

export async function getAllIssues(): Promise<Issue[]> {
  const snap = await getDocs(query(collection(db, 'issues'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Issue));
}

export async function updateIssue(id: string, updates: Partial<Omit<Issue, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'issues', id), {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteIssue(id: string): Promise<void> {
  await deleteDoc(doc(db, 'issues', id));
  // Also delete related comments and attachments
  const commentsSnap = await getDocs(query(collection(db, 'comments'), where('issueId', '==', id)));
  for (const d of commentsSnap.docs) {
    await deleteDoc(d.ref);
  }
  const attachSnap = await getDocs(query(collection(db, 'attachments'), where('issueId', '==', id)));
  for (const d of attachSnap.docs) {
    await deleteDoc(d.ref);
  }
}

// ─── Comments ────────────────────────────────────────────

export async function addComment(data: {
  issueId: string;
  userId: string;
  userName: string;
  text: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'comments'), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getComments(issueId: string): Promise<Comment[]> {
  const snap = await getDocs(
    query(collection(db, 'comments'), where('issueId', '==', issueId), orderBy('createdAt', 'asc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Comment));
}

// ─── Attachments ─────────────────────────────────────────

export async function addAttachmentRecord(data: {
  issueId: string;
  fileName: string;
  url: string;
  contentType: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'attachments'), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
}

export async function getAttachments(issueId: string): Promise<Attachment[]> {
  const snap = await getDocs(
    query(collection(db, 'attachments'), where('issueId', '==', issueId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Attachment));
}
