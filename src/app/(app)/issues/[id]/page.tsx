'use client';

import { useEffect, useState, use, useRef } from 'react';
import { getIssue, updateIssue, getComments, addComment, getUserProfile, getAttachments, addAttachmentRecord } from '@/lib/firestore';
import { uploadFile } from '@/lib/storage';
import { Card, Button, Badge, LoadingScreen, Avatar, Textarea, Select } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';
import { STATUS_COLORS, PRIORITY_COLORS, type Issue, type Comment, type IssueStatus, type Attachment } from '@/lib/utils';
import { ArrowLeft, MessageSquare, Send, Paperclip, FileText, Download, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { profile } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [assigneeName, setAssigneeName] = useState('Unassigned');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      const data = await getIssue(resolvedParams.id);
      if (data) {
        setIssue(data);
        if (data.assigneeId) {
          const user = await getUserProfile(data.assigneeId);
          setAssigneeName(user?.displayName || 'Unknown');
        }
        const [c, a] = await Promise.all([
          getComments(resolvedParams.id),
          getAttachments(resolvedParams.id)
        ]);
        setComments(c);
        setAttachments(a);
      }
      setLoading(false);
    }
    load();
  }, [resolvedParams.id]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!issue) return;
    const newStatus = e.target.value as IssueStatus;
    const oldStatus = issue.status;
    
    setIssue({ ...issue, status: newStatus });
    await updateIssue(issue.id, { status: newStatus });

    await fetch('/api/send-email', {
      method: 'POST',
      body: JSON.stringify({ bugTitle: issue.title, oldStatus, newStatus, assigneeName })
    });
  };

  const submitComment = async () => {
    if (!newComment.trim() || !profile || !issue) return;
    const id = await addComment({
      issueId: issue.id,
      userId: profile.uid,
      userName: profile.displayName,
      text: newComment
    });
    setComments([...comments, { id, issueId: issue.id, userId: profile.uid, userName: profile.displayName, text: newComment, createdAt: new Date().toISOString() }]);
    setNewComment('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !issue) return;
    
    setUploading(true);
    try {
      const { url, fileName, contentType } = await uploadFile(issue.id, file);
      const id = await addAttachmentRecord({ issueId: issue.id, fileName, url, contentType });
      
      setAttachments([{ id, issueId: issue.id, fileName, url, contentType, createdAt: new Date().toISOString() }, ...attachments]);
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <LoadingScreen />;
  if (!issue) return <div className="text-center py-20 text-slate-500">Issue not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/issues" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-2">
        <ArrowLeft size={16} className="mr-1" /> Back to Issues
      </Link>
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-heading mb-3">{issue.title}</h1>
          <div className="flex gap-2 items-center flex-wrap">
            <Badge colorClasses={STATUS_COLORS[issue.status]}>{issue.status}</Badge>
            <Badge colorClasses={PRIORITY_COLORS[issue.priority]}>{issue.priority} Priority</Badge>
            <span className="text-sm text-slate-500 ml-2">Assignee: <strong className="text-slate-700">{assigneeName}</strong></span>
          </div>
        </div>
        <Select value={issue.status} onChange={handleStatusChange} className="w-full sm:w-40 font-medium">
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </Select>
      </div>

      <Card className="bg-slate-50/50 border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Description</h3>
        <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">{issue.description}</p>
      </Card>

      {/* Attachments Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 font-heading">
            <Paperclip size={20} className="text-primary-500" /> Attachments
          </h3>
          <div>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              <Paperclip size={16} /> {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>
        </div>
        
        {attachments.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {attachments.map(a => {
              const isImage = a.contentType.startsWith('image/');
              return (
                <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="group block">
                  <Card hover className="p-3 h-full flex flex-col justify-between items-center text-center gap-2 border-slate-200 hover:border-primary-300">
                    <div className="w-full aspect-square bg-slate-50 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 relative">
                      {isImage ? (
                        <img src={a.url} alt={a.fileName} className="object-cover w-full h-full" />
                      ) : (
                        <FileText size={32} className="text-slate-400" />
                      )}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Download className="text-white" size={24} />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-600 truncate w-full" title={a.fileName}>
                      {a.fileName}
                    </span>
                  </Card>
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">No files attached yet.</p>
        )}
      </div>

      {/* Discussion Section */}
      <div className="mt-8 border-t border-slate-200 pt-8">
        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 mb-6 font-heading">
          <MessageSquare size={20} className="text-primary-500" /> Discussion
        </h3>
        
        <div className="space-y-5 mb-6">
          {comments.map(c => (
            <div key={c.id} className="flex gap-4">
              <Avatar name={c.userName} />
              <div className="flex-1 bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-slate-900">{c.userName}</span>
                  <span className="text-xs font-medium text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-slate-400 text-sm italic">No comments yet.</p>}
        </div>

        <div className="flex gap-3 items-end bg-white p-2 border border-slate-200 rounded-2xl shadow-sm focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400 transition-all">
          <Textarea 
            placeholder="Add a comment..." 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            rows={2} 
            className="border-none focus:ring-0 shadow-none bg-transparent resize-none py-3"
          />
          <Button onClick={submitComment} variant="primary" size="md" className="shrink-0 mb-1 mr-1" disabled={!newComment.trim()}>
            <Send size={16} /> Send
          </Button>
        </div>
      </div>
    </div>
  );
}
