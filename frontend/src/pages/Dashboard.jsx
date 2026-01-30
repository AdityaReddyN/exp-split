import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, DollarSign, Copy, Check, LogOut } from 'lucide-react';
import apiClient from '../utils/api';
import authUtils from '../utils/auth';
import toast from '../utils/toast';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get('/groups/my-groups');
      setGroups(response.data.data);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const response = await apiClient.post('/groups', groupData);
      toast.success('Group created successfully!');
      setShowCreateModal(false);
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (code) => {
    try {
      await apiClient.post('/groups/join', { code });
      toast.success('Joined group successfully!');
      setShowJoinModal(false);
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to join group');
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="animate-slide-in-left">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Your Groups</h1>
            <p className="text-white/90 text-lg">Manage and split expenses with friends</p>
          </div>
          <div className="flex gap-3 animate-slide-in-right">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/30"
            >
              <Plus size={20} /> Create Group
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/30"
            >
              <Users size={20} /> Join Group
            </button>
            <button
              onClick={() => {
                authUtils.logout();
                toast.success('Logged out successfully');
              }}
              className="bg-white/20 backdrop-blur-md hover:bg-red-500/30 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/30"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && groups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Groups</p>
                  <p className="text-3xl font-bold text-gray-900">{groups.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl">
                  <Users className="text-blue-600" size={32} />
                </div>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {groups.reduce((sum, g) => sum + g.member_count, 0)}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <Users className="text-green-600" size={32} />
                </div>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">Total Expenses</p>
                  <p className="text-3xl font-bold text-gray-900">₹{groups.reduce((sum, g) => sum + g.total_expenses, 0).toFixed(2)}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-xl">
                  <DollarSign className="text-orange-600" size={32} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Groups Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent"></div>
            <p className="text-white/80 mt-4">Loading your groups...</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-12 text-center border border-white/20 animate-fade-in">
            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={40} className="text-indigo-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">No groups yet</h2>
            <p className="text-gray-600 mb-8 text-lg">Create a new group or join an existing one to get started</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create Group
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Join Group
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <div
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-white/20 transform hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{group.name}</h3>
                    <p className="text-gray-600 text-sm capitalize">{group.category}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    group.type === 'public' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {group.type}
                  </div>
                </div>

                {group.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{group.description}</p>
                )}

                <div className="flex justify-between mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  <div>
                    <p className="text-gray-600 text-xs font-medium mb-1">Members</p>
                    <p className="text-2xl font-bold text-gray-900">{group.member_count}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-xs font-medium mb-1">Total Spent</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₹{group.total_expenses.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <code className="text-sm font-mono text-gray-800 font-semibold">{group.code}</code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(group.code);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 transition-colors p-1 hover:bg-indigo-50 rounded-lg"
                  >
                    {copiedCode === group.code ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateGroup}
        />
      )}

      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onJoin={handleJoinGroup}
        />
      )}
    </div>
  );
}