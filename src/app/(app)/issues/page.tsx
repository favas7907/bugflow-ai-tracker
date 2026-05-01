'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getAllIssues, getAllUsers, createIssue, updateIssue } from '@/lib/firestore';
import { Card, Input, Select, Button, Badge, Textarea, Label, LoadingScreen, EmptyState, Avatar } from '@/components/ui';
import { Search, Plus, X, ListTodo, Bug, GripVertical } from 'lucide-react';
import type { Issue, AppUser, Priority, IssueStatus } from '@/lib/utils';
import { STATUS_COLORS, PRIORITY_COLORS, KANBAN_COLUMNS } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';

export default function IssuesPage() {
  const { profile } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('Medium');
  const [newAssignee, setNewAssignee] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([getAllIssues(), getAllUsers()])
      .then(([i, u]) => { setIssues(i); setUsers(u); })
      .finally(() => setLoading(false));
  }, []);

  const userMap = useMemo(() => {
    const m: Record<string, string> = {};
    users.forEach((u) => (m[u.uid] = u.displayName));
    return m;
  }, [users]);

  const filtered = useMemo(() => {
    return issues.filter((i) => {
      const q = search.toLowerCase();
      const matchSearch = !search || i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q);
      const matchPriority = !priorityFilter || i.priority === priorityFilter;
      const matchAssignee = !assigneeFilter || i.assigneeId === assigneeFilter;
      return matchSearch && matchPriority && matchAssignee;
    });
  }, [issues, search, priorityFilter, assigneeFilter]);

  const columns = useMemo(() => {
    const map: Record<IssueStatus, Issue[]> = { 'Open': [], 'In Progress': [], 'Resolved': [], 'Closed': [] };
    filtered.forEach((i) => { if (map[i.status]) map[i.status].push(i); });
    return map;
  }, [filtered]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as IssueStatus;
    const issueId = draggableId;

    setIssues((prev) => prev.map((issue) => issue.id === issueId ? { ...issue, status: newStatus, updatedAt: new Date().toISOString() } : issue));

    try {
      await updateIssue(issueId, { status: newStatus });
      // Call the email API via the updateIssue optimistically later.
      const issueRef = issues.find(i => i.id === issueId);
      if(issueRef) {
        await fetch('/api/send-email', {
          method: 'POST',
          body: JSON.stringify({
            bugTitle: issueRef.title,
            oldStatus: issueRef.status,
            newStatus,
            assigneeName: issueRef.assigneeId ? userMap[issueRef.assigneeId] : 'Unassigned'
          })
        });
      }
    } catch (err) {
      console.error('Failed to update issue status:', err);
      const freshIssues = await getAllIssues();
      setIssues(freshIssues);
    }
  }, [issues, userMap]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !profile) return;
    setCreating(true);
    try {
      await createIssue({
        title: newTitle.trim(),
        description: newDesc.trim(),
        priority: newPriority,
        assigneeId: newAssignee || null,
        reporterId: profile.uid,
      });
      const updated = await getAllIssues();
      setIssues(updated);
      setShowCreate(false);
      setNewTitle('');
      setNewDesc('');
      setNewPriority('Medium');
      setNewAssignee('');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3 font-heading">
            <Bug className="text-primary-500" /> Bug Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">{issues.length} total bugs tracked</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} size="md">
          {showCreate ? <X size={16} /> : <Plus size={16} />}
          {showCreate ? 'Cancel' : 'New Bug'}
        </Button>
      </div>

      {showCreate && (
        <Card className="border-primary-100 bg-primary-50">
          <form onSubmit={handleCreate} className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base font-heading">Create Bug Report</h3>
            <div>
              <Label>Title</Label>
              <Input placeholder="Brief summary of the issue" value={newTitle} onChange={(e: any) => setNewTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Steps to reproduce, expected vs actual behavior…" value={newDesc} onChange={(e: any) => setNewDesc(e.target.value)} rows={4} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={newPriority} onChange={(e: any) => setNewPriority(e.target.value as Priority)}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Select>
              </div>
              <div>
                <Label>Assign To</Label>
                <Select value={newAssignee} onChange={(e: any) => setNewAssignee(e.target.value)}>
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u.uid} value={u.uid}>{u.displayName}</option>)}
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="submit" disabled={creating}>{creating ? 'Creating…' : 'Submit Bug'}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="bg-white">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <Input placeholder="Search issues…" value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={priorityFilter} onChange={(e: any) => setPriorityFilter(e.target.value)} className="w-36">
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </Select>
          <Select value={assigneeFilter} onChange={(e: any) => setAssigneeFilter(e.target.value)} className="w-40">
            <option value="">All Assignees</option>
            {users.map((u) => <option key={u.uid} value={u.uid}>{u.displayName}</option>)}
          </Select>
        </div>
      </Card>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {KANBAN_COLUMNS.map((status) => (
            <div key={status} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3 px-1">
                <h3 className="text-sm font-bold text-slate-700 font-heading">{status}</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                  {columns[status].length}
                </span>
              </div>

              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 min-h-[200px] rounded-2xl p-2 transition-all duration-200 ${
                      snapshot.isDraggingOver ? 'bg-primary-50 border-2 border-dashed border-primary-200' : 'bg-slate-50 border-2 border-dashed border-transparent'
                    }`}
                  >
                    {columns[status].length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-24 text-slate-400 text-xs font-medium">Drop bugs here</div>
                    )}
                    {columns[status].map((issue, index) => (
                      <Draggable key={issue.id} draggableId={issue.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`mb-3 group rounded-xl p-4 transition-all duration-200 shadow-sm border ${
                              snapshot.isDragging ? 'bg-white border-primary-300 shadow-float scale-105 rotate-1' : 'bg-white border-slate-200 hover:border-primary-300'
                            }`}
                            style={{ ...provided.draggableProps.style, transform: snapshot.isDragging ? `${provided.draggableProps.style?.transform || ''} rotate(2deg)` : provided.draggableProps.style?.transform }}
                          >
                            <div className="flex items-start gap-2">
                              <div {...provided.dragHandleProps} className="mt-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-grab active:cursor-grabbing">
                                <GripVertical size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link href={`/issues/${issue.id}`} className="text-sm font-bold text-slate-800 hover:text-primary-600 transition-colors line-clamp-2 block">
                                  {issue.title}
                                </Link>
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                  <Badge colorClasses={PRIORITY_COLORS[issue.priority]}>{issue.priority}</Badge>
                                  {issue.assigneeId && (
                                    <Avatar name={userMap[issue.assigneeId] || '?'} size="sm" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {issues.length === 0 && (
        <Card>
          <EmptyState icon={<ListTodo size={40} />} title="No bugs yet" description="Create your first bug report to start tracking." />
        </Card>
      )}
    </div>
  );
}
