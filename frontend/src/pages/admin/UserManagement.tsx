import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Edit, 
  Trash2, 
  X, 
  AlertCircle,
  UserCheck,
  UserX,
  Shield,
  Check,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { adminGetUsers, adminUpdateUserStatus, adminUpdateUserRole, adminUpdateUser, adminDeleteUser } from '../../services/adminApi';
import { User } from '../../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Edit details form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminGetUsers();
      setUsers(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: User) => {
    if (!user.id) return;
    const newStatus = !user.enabled;
    try {
      await adminUpdateUserStatus(user.id, newStatus);
      setUsers(users.map(u => u.id === user.id ? { ...u, enabled: newStatus } : u));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error changing user status');
    }
  };

  const handleChangeRole = async (user: User, newRole: string) => {
    if (!user.id) return;
    try {
      await adminUpdateUserRole(user.id, newRole);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error assigning user role');
    }
  };

  const handleOpenEdit = (user: User) => {
    setCurrentUser(user);
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
    setFormErrors({});
    setIsEditOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Valid email is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currentUser || !currentUser.id) return;

    try {
      const updated = await adminUpdateUser(currentUser.id, {
        firstName,
        lastName,
        email
      });
      setUsers(users.map(u => u.id === currentUser.id ? { ...u, ...updated } : u));
      setIsEditOpen(false);
      setCurrentUser(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error updating user profile');
    }
  };

  const handleDeleteClick = (user: User) => {
    setCurrentUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      await adminDeleteUser(currentUser.id);
      setUsers(users.filter(u => u.id !== currentUser.id));
      setIsDeleteOpen(false);
      setCurrentUser(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error deleting user');
    }
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    
    const matchesStatus = 
      statusFilter === 'active' ? user.enabled === true :
      statusFilter === 'blocked' ? user.enabled === false : true;

    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
        <p className="text-slate-500 text-sm mt-0.5">Control registered accounts, toggle authorization levels, enable/disable profiles</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-700 text-sm font-semibold p-4 rounded-xl flex items-center space-x-2 border border-rose-100">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs flex flex-wrap gap-4 items-center">
        <div className="relative flex-grow max-w-md">
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
          <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl py-2 px-3 focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="ROLE_USER">User</option>
            <option value="ROLE_ADMIN">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 rounded-xl py-2 px-3 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role Configuration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
                const isUserAdmin = user.role === 'ROLE_ADMIN';
                return (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 font-black text-xs flex items-center justify-center shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-bold text-slate-800 leading-tight">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="block text-xs text-slate-400 font-semibold truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${
                          isUserAdmin ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}>
                          {isUserAdmin ? 'Admin' : 'User'}
                        </span>
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user, e.target.value)}
                          className="bg-transparent border border-slate-200 text-xs font-semibold text-slate-500 rounded-lg py-1 px-2 focus:outline-none"
                        >
                          <option value="ROLE_USER">Make User</option>
                          <option value="ROLE_ADMIN">Make Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        className="flex items-center space-x-2 text-xs font-bold cursor-pointer"
                      >
                        {user.enabled !== false ? (
                          <>
                            <ToggleRight className="w-8 h-8 text-indigo-600 shrink-0" />
                            <span className="text-indigo-600">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-8 h-8 text-slate-355 shrink-0" />
                            <span className="text-slate-400">Blocked</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(user)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400 font-semibold text-xs">
                    No users matching search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsEditOpen(false)} />
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full z-10">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Edit User Profile</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.firstName ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {formErrors.firstName && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.lastName ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {formErrors.lastName && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.lastName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl text-sm ${formErrors.email ? 'border-rose-300' : 'border-slate-200'}`}
                />
                {formErrors.email && <p className="text-rose-500 text-xs mt-1 font-semibold">{formErrors.email}</p>}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsDeleteOpen(false)} />
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-sm w-full z-10 p-6 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800">Delete User Account</h3>
              <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                Are you sure you want to delete <strong className="text-slate-800">"{currentUser?.firstName} {currentUser?.lastName}"</strong>? This will permanently erase their login credentials and order association records.
              </p>
            </div>
            <div className="pt-2 flex justify-center space-x-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
