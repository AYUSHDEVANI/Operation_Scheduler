import { useState } from 'react';
import API from '../services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCcw, Search, User, Shield, Stethoscope, Users as UsersIcon, Edit2, X, Check, Trash2 } from 'lucide-react';
import moment from 'moment';
import toast from 'react-hot-toast';

const EditUserModal = ({ user, onClose, onUpdate }) => {
    const [role, setRole] = useState(user.role);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(user._id, role);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Edit User Role</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">User Name</label>
                        <input 
                            type="text" 
                            value={user.name} 
                            disabled 
                            className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="USER">User (Staff)</option>
                            <option value="DOCTOR">Doctor</option>
                            <option value="ADMIN">Admin</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                         <p className="text-xs text-gray-500 mt-2">
                            <strong>Note:</strong> Promoting to Doctor might require creating a Doctor Profile separately.
                        </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
                        >
                            {loading ? 'Updating...' : <><Check size={16} /> Update Role</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Users = () => {
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const limit = 10;
  const queryClient = useQueryClient();

  const fetchUsers = async ({ queryKey }) => {
    const [_key, page, role, search] = queryKey;
    const params = { page, limit };
    if (role !== 'all') params.role = role;
    if (search) params.search = search;

    const { data } = await API.get(`/users`, { params });
    return data;
  };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['users', page, role, search],
    queryFn: fetchUsers,
    keepPreviousData: true
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, newRole }) => {
        return await API.put(`/users/${id}/role`, { role: newRole });
    },
    onSuccess: () => {
        toast.success('User role updated successfully');
        queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update role');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
        return await API.delete(`/users/${id}`);
    },
    onSuccess: () => {
        toast.success('User deleted successfully');
        queryClient.invalidateQueries(['users']);
    },
    onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  });

  const handleUpdateRole = async (id, newRole) => {
      await updateRoleMutation.mutateAsync({ id, newRole });
  };

  const handleDeleteUser = async (id) => {
      await deleteUserMutation.mutateAsync(id);
  };

  const tabs = [
    { id: 'all', label: 'All Users', icon: UsersIcon },
    { id: 'admin', label: 'Admins', icon: Shield },
    { id: 'doctor', label: 'Doctors', icon: Stethoscope },
    { id: 'user', label: 'Staff/Users', icon: User },
  ];

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Users...</div>;
  if (isError) return <div className="p-8 text-center text-red-500">Failed to load users.</div>;

  const users = data?.users || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {editingUser && (
          <EditUserModal 
            user={editingUser} 
            onClose={() => setEditingUser(null)} 
            onUpdate={handleUpdateRole} 
          />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
           <p className="text-sm text-gray-500">Manage all registered system users</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-primary outline-none"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
             </div>
            <button 
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition"
            >
                <RefreshCcw size={18} /> Refresh
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b border-gray-200">
        {tabs.map(tab => {
            const Icon = tab.icon;
            return (
                <button
                    key={tab.id}
                    onClick={() => { setRole(tab.id); setPage(1); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap
                        ${role === tab.id 
                            ? 'bg-primary text-white shadow-sm' 
                            : 'bg-transparent text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Icon size={16} />
                    {tab.label}
                </button>
            )
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined At</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                            {user.name?.charAt(0) || 'U'}
                        </div>
                        <span className="font-medium text-gray-800">{user.name}</span>
                     </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold 
                        ${user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700' : 
                          user.role === 'DOCTOR' ? 'bg-blue-100 text-blue-700' : 
                          'bg-green-100 text-green-700'}`}>
                        {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {moment(user.createdAt).format('MMM D, YYYY')}
                  </td>
                  <td className="p-4">
                     <div className="flex items-center justify-center gap-2">
                         <button 
                            onClick={() => setEditingUser(user)}
                            className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                            title="Edit Role"
                         >
                            <Edit2 size={14} /> Edit
                         </button>
                         <button 
                            onClick={() => {
                                if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
                                    handleDeleteUser(user._id);
                                }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                            title="Delete User"
                         >
                            <Trash2 size={14} /> Delete
                         </button>
                     </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                  <tr>
                      <td colSpan="5" className="p-8 text-center text-gray-400">No users found.</td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */ }
        <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <button 
                disabled={page === 1}
                onClick={() => setPage(old => Math.max(old - 1, 1))}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
                Previous
            </button>
            <span className="text-sm text-gray-600">Page {data?.currentPage} of {data?.totalPages}</span>
            <button 
                disabled={page >= data?.totalPages}
                onClick={() => setPage(old => old + 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
                Next
            </button>
        </div>
      </div>
    </div>
  );
};

export default Users;
