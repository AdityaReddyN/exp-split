import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Users, DollarSign, Copy, Check, LogOut, LogIn, UserPlus } from 'lucide-react';
import apiClient from '../utils/api';
import authUtils from '../utils/auth';
import toast from '../utils/toast';
import CreateGroupModal from '../components/CreateGroupModal';
import JoinGroupModal from '../components/JoinGroupModal';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(authUtils.isAuthenticated());

  useEffect(() => {
    setIsAuthenticated(authUtils.isAuthenticated());
    if (authUtils.isAuthenticated()) {
      fetchGroups();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchGroups = async () => {
    if (!authUtils.isAuthenticated()) {
      setLoading(false);
      return;
    }
    try {
      const response = await apiClient.get('/groups/my-groups');
      setGroups(response.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        authUtils.logout();
      } else {
        toast.error('Failed to load groups');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData) => {
    if (!authUtils.isAuthenticated()) {
      toast.error('Please login to create a group');
      navigate('/login');
      return;
    }
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
    if (!authUtils.isAuthenticated()) {
      toast.error('Please login to join a group');
      navigate('/login');
      return;
    }
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

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to create a group');
      navigate('/login');
      return;
    }
    setShowCreateModal(true);
  };

  const handleJoinClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to join a group');
      navigate('/login');
      return;
    }
    setShowJoinModal(true);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-left">
            <h1 className="dashboard-title">XPenseFlow</h1>
            <p className="dashboard-subtitle">Manage and budget group expenses with friends</p>
          </div>
          <div className="dashboard-actions">
            {isAuthenticated ? (
              <>
                <button
                  onClick={handleCreateClick}
                  className="dashboard-button dashboard-button--create"
                >
                  <Plus size={20} /> Create
                </button>
                <button
                  onClick={handleJoinClick}
                  className="dashboard-button dashboard-button--join"
                >
                  <Users size={20} /> Join
                </button>
                <button
                  onClick={() => {
                    authUtils.logout();
                    setIsAuthenticated(false);
                    setGroups([]);
                    toast.success('Logged out successfully');
                  }}
                  className="dashboard-button dashboard-button--logout"
                >
                  <LogOut size={20} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="dashboard-button">
                  <LogIn size={20} /> Login
                </Link>
                <Link to="/register" className="dashboard-button">
                  <UserPlus size={20} /> Register
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Empty State - Only show when no groups or not authenticated */}
        {(!isAuthenticated || (!loading && groups.length === 0)) && (
          <div className="dashboard-empty">
            <div className="dashboard-empty-icon-wrapper">
              <Users size={40} />
            </div>
            <h2 className="dashboard-empty-title">
              {isAuthenticated ? 'Start Your First Group' : 'Welcome to XPenseFlow'}
            </h2>
            <p className="dashboard-empty-text">
              {isAuthenticated
                ? 'Create a new group or join an existing one to start splitting expenses with friends'
                : 'Login or register to start managing your expense groups and track shared costs effortlessly'}
            </p>
            <div className="dashboard-empty-actions">
              <button
                onClick={handleCreateClick}
                className="dashboard-empty-button"
              >
                <Plus size={20} /> Create Group
              </button>
              <button
                onClick={handleJoinClick}
                className="dashboard-empty-button dashboard-empty-button--secondary"
              >
                <Users size={20} /> Join Group
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        {isAuthenticated && !loading && groups.length > 0 && (
          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-info">
                  <p className="dashboard-stat-label">Total Groups</p>
                  <p className="dashboard-stat-value">{groups.length}</p>
                </div>
                <div className="dashboard-stat-icon-wrapper dashboard-stat-icon-wrapper--blue">
                  <Users size={32} />
                </div>
              </div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-info">
                  <p className="dashboard-stat-label">Total Members</p>
                  <p className="dashboard-stat-value">
                    {groups.reduce((sum, g) => sum + g.member_count, 0)}
                  </p>
                </div>
                <div className="dashboard-stat-icon-wrapper dashboard-stat-icon-wrapper--green">
                  <Users size={32} />
                </div>
              </div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-content">
                <div className="dashboard-stat-info">
                  <p className="dashboard-stat-label">Total Expenses</p>
                  <p className="dashboard-stat-value">₹{groups.reduce((sum, g) => sum + g.total_expenses, 0).toFixed(2)}</p>
                </div>
                <div className="dashboard-stat-icon-wrapper dashboard-stat-icon-wrapper--orange">
                  <DollarSign size={32} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Groups Grid */}
        {isAuthenticated && loading ? (
          <div className="dashboard-loading">
            <div className="dashboard-spinner"></div>
            <p className="dashboard-loading-text">Loading your groups...</p>
          </div>
        ) : isAuthenticated && groups.length > 0 ? (
          <div className="dashboard-groups">
            {groups.map((group, index) => (
              <div
                key={group.id}
                onClick={() => navigate(`/groups/${group.id}`)}
                className="dashboard-group-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="dashboard-group-header">
                  <div className="dashboard-group-info">
                    <h3 className="dashboard-group-name">{group.name}</h3>
                    <p className="dashboard-group-category">{group.category}</p>
                  </div>
                  <div className={`dashboard-group-badge ${group.type === 'public' ? 'dashboard-group-badge--public' : 'dashboard-group-badge--private'
                    }`}>
                    {group.type}
                  </div>
                </div>

                {group.description && (
                  <p className="dashboard-group-description">{group.description}</p>
                )}

                <div className="dashboard-group-stats">
                  <div className="dashboard-group-stat">
                    <p className="dashboard-group-stat-label">Members</p>
                    <p className="dashboard-group-stat-value">{group.member_count}</p>
                  </div>
                  <div className="dashboard-group-stat" style={{ textAlign: 'right' }}>
                    <p className="dashboard-group-stat-label">Total Spent</p>
                    <p className="dashboard-group-stat-value dashboard-group-stat-value--amount">₹{group.total_expenses.toFixed(2)}</p>
                  </div>
                </div>

                <div className="dashboard-group-code-wrapper">
                  <code className="dashboard-group-code">{group.code}</code>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(group.code);
                    }}
                    className="dashboard-group-copy-button"
                  >
                    {copiedCode === group.code ? (
                      <Check size={18} style={{ color: '#16a34a' }} />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
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