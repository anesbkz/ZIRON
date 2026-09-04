import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserProfile } from '@/types/models';
import { AppRole } from '@/types/rbac';
import { listAllUsers, adminUpdateUserRoles } from '@/services/userService';
import { Users, Shield, KeyRound, Loader2, Check } from 'lucide-react';

const AVAILABLE_ROLES: AppRole[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'CONTENT_MANAGER',
  'COMMUNITY_MANAGER',
  'SCHOOL_MANAGER',
  'PRODUCT_MANAGER',
  'ORDER_MANAGER',
  'SUPPORT',
  'ANALYST',
  'CUSTOMER',
];

export const AdminUsersPage: React.FC = () => {
  const { profile, isSuperAdmin, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<AppRole[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await listAllUsers(50);
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEditRoles = (u: UserProfile) => {
    setEditingUser(u);
    setSelectedRoles([...u.roles]);
    setErrorMessage(null);
  };

  const toggleRole = (role: AppRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSaveRoles = async () => {
    if (!profile || !editingUser) return;
    setSaving(true);
    setErrorMessage(null);
    try {
      await adminUpdateUserRoles(editingUser.uid, selectedRoles, profile);
      setEditingUser(null);
      await loadUsers();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setErrorMessage(error.message || 'Failed to update user roles.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E2E8F0] p-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-blue-50 text-[#0B2346] font-mono text-[10px] uppercase font-bold tracking-wider mb-2">
            <Users className="w-3.5 h-3.5" />
            SUBJECT & STAFF REGISTRY
          </div>
          <h1 className="text-xl font-black text-[#0B2346]">User & Role Directory</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Inspect verified subjects, review role assignments, and govern operational privileges.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="px-3 py-1.5 bg-[#F5F7FA] border border-[#E2E8F0] text-xs font-mono font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
        >
          Refresh Directory
        </button>
      </div>

      <div className="bg-white border border-[#E2E8F0] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-500 font-mono">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0B2346]" />
            FETCHING USER PROFILES FROM FIRESTORE...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center bg-[#F5F7FA]">
            <p className="text-xs font-bold text-gray-700">No user accounts found in Firestore</p>
            <p className="text-xs text-gray-500 mt-1">
              Registered subjects and staff profiles will appear here as accounts authenticate.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-[#F5F7FA] border-b border-[#E2E8F0] text-gray-600 font-mono text-[11px]">
                  <th className="py-3 px-4 text-start font-bold">NAME / IDENTIFIER</th>
                  <th className="py-3 px-4 text-start font-bold">ROLES</th>
                  <th className="py-3 px-4 text-start font-bold">ENTITLEMENTS</th>
                  <th className="py-3 px-4 text-start font-bold">STATUS</th>
                  <th className="py-3 px-4 text-end font-bold">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#0B2346]">{u.displayName || 'Subject'}</div>
                      <div className="text-gray-500 text-[11px] font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r) => (
                          <span
                            key={r}
                            className={`px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                              r === 'SUPER_ADMIN'
                                ? 'bg-red-100 text-red-800'
                                : r === 'ADMIN'
                                ? 'bg-blue-100 text-[#0B2346]'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={u.communityAccess ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                          COMMUNITY: {u.communityAccess ? 'YES' : 'NO'}
                        </span>
                        <span>•</span>
                        <span className={u.schoolAccess ? 'text-emerald-600 font-bold' : 'text-gray-400'}>
                          SCHOOL: {u.schoolAccess ? 'YES' : 'NO'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold uppercase">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-end">
                      {(isSuperAdmin || isAdmin) && (
                        <button
                          onClick={() => openEditRoles(u)}
                          className="px-2.5 py-1 text-[11px] font-semibold border border-[#E2E8F0] hover:bg-gray-100 text-[#0B2346] cursor-pointer"
                        >
                          Modify Roles
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Modification Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] max-w-md w-full p-6 shadow-xl relative">
            <h2 className="text-base font-bold text-[#0B2346] mb-1">
              Govern Roles for {editingUser.displayName || editingUser.email}
            </h2>
            <p className="text-xs text-gray-600 mb-4 font-mono">
              UID: {editingUser.uid}
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2 mb-6">
              {AVAILABLE_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role);
                const isSuperAdminOption = role === 'SUPER_ADMIN';
                if (isSuperAdminOption && !isSuperAdmin) return null;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`w-full flex items-center justify-between p-2.5 border text-xs font-mono font-semibold cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#0B2346] text-white border-[#0B2346]'
                        : 'bg-white text-gray-700 border-[#E2E8F0] hover:bg-gray-50'
                    }`}
                  >
                    <span>{role}</span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-3 py-1.5 border border-[#E2E8F0] text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoles}
                disabled={saving}
                className="px-4 py-1.5 bg-[#0B2346] text-white text-xs font-semibold hover:bg-[#07162c] cursor-pointer"
              >
                {saving ? 'Saving...' : 'Apply Roles'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
