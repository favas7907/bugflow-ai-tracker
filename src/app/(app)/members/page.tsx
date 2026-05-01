'use client';

import { useEffect, useState } from 'react';
import { getAllUsers, updateUserRole } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import { Card, LoadingScreen, Avatar, Select, Badge } from '@/components/ui';
import type { AppUser, Role } from '@/lib/utils';
import { Users } from 'lucide-react';

export default function MembersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllUsers().then(setUsers).finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (uid: string, newRole: Role) => {
    if (profile?.role !== 'Admin') return alert('Only admins can change roles.');
    await updateUserRole(uid, newRole);
    setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-heading flex items-center gap-3">
          <Users className="text-primary-500" /> Team Members
        </h1>
        <p className="text-slate-500 mt-1">Manage users and roles (Admins only).</p>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <Avatar name={u.displayName} />
                  <span className="font-semibold text-slate-900">{u.displayName}</span>
                </td>
                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                <td className="px-6 py-4">
                  {profile?.role === 'Admin' && profile.uid !== u.uid ? (
                    <Select value={u.role} onChange={(e: any) => handleRoleChange(u.uid, e.target.value as Role)} className="w-32 py-1 h-8 text-xs">
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </Select>
                  ) : (
                    <Badge colorClasses={u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}>
                      {u.role}
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
