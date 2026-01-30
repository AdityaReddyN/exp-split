import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, TrendingDown, Users, History, ArrowLeft } from 'lucide-react';
import apiClient from '../utils/api';
import toast from '../utils/toast';
import AddExpenseModal from '../components/AddExpenseModal';
import PaymentModal from '../components/PaymentModal';

export default function GroupDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [paymentSettlement, setPaymentSettlement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const [groupRes, expensesRes, balancesRes, settlementsRes] = await Promise.all([
        apiClient.get(`/groups/${id}`),
        apiClient.get(`/expenses/group/${id}`),
        apiClient.get(`/expenses/balances/${id}`),
        apiClient.get(`/settlements/${id}`)
      ]);

      setGroup(groupRes.data.data);
      setExpenses(expensesRes.data.data);
      setBalances(balancesRes.data.data);
      setSettlements(settlementsRes.data.data.settlements);
    } catch (error) {
      toast.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await apiClient.post('/expenses', {
        groupId: id,
        ...expenseData
      });
      toast.success('Expense added!');
      setShowAddExpense(false);
      fetchGroupData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add expense');
    }
  };

  const handlePaymentDone = () => {
    fetchGroupData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
          <p className="text-white/80">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/20">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Group not found</h1>
          <p className="text-gray-600">The group you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 animate-fade-in">
          <div className="flex-1">
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{group.name}</h1>
            {group.description && (
              <p className="text-white/90 text-lg mb-4">{group.description}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-semibold text-sm border border-white/30">
                {group.member_count || group.members.length} members
              </span>
              <span className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full font-semibold text-sm border border-white/30 capitalize">
                {group.category}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowAddExpense(true)}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/30"
          >
            <Plus size={20} /> Add Expense
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white/10 backdrop-blur-md rounded-xl p-2 border border-white/20">
          {[
            { key: 'expenses', label: 'Expenses', icon: Plus },
            { key: 'balances', label: 'Balances', icon: Users },
            { key: 'settlements', label: 'Settle Up', icon: TrendingDown },
            { key: 'members', label: 'Members', icon: Users }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-indigo-600 shadow-lg'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 animate-fade-in">
          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Expenses</h2>
              {expenses.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-600 text-lg">No expenses yet</p>
                  <p className="text-gray-500 text-sm mt-2">Add your first expense to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {expenses.map(expense => (
                    <div key={expense.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg mb-1">{expense.description}</p>
                          <p className="text-sm text-gray-600 mb-2">
                            Paid by <span className="font-semibold text-gray-900">{expense.paid_by_name}</span>
                          </p>
                          <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">₹{expense.amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 mt-1">{expense.splits.length} {expense.splits.length === 1 ? 'person' : 'people'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Balances Tab */}
          {activeTab === 'balances' && balances && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Individual Balances</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {balances.balances.map(balance => (
                  <div key={balance.userId} className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-gray-900 text-lg">{balance.name}</span>
                      <span className={`text-xl font-bold ${
                        balance.balance > 0 ? 'text-green-600' : balance.balance < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {balance.balance > 0 ? '+' : ''}₹{balance.balance.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-600 pt-3 border-t border-gray-200">
                      <span className="flex-1">
                        <span className="font-semibold text-gray-700">Paid:</span> ₹{balance.totalPaid.toFixed(2)}
                      </span>
                      <span className="flex-1">
                        <span className="font-semibold text-gray-700">Owes:</span> ₹{balance.totalOwed.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border-2 border-indigo-200">
                <p className="text-gray-700 font-semibold">Total Spent: <span className="font-bold text-gray-900 text-xl">₹{balances.totalSpent.toFixed(2)}</span></p>
              </div>
            </div>
          )}

          {/* Settlements Tab */}
          {activeTab === 'settlements' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Optimal Settlements</h2>
              <p className="text-sm text-gray-600 mb-6">
                {settlements.length} {settlements.length === 1 ? 'transaction' : 'transactions'} ({settlements.length > 0 ? 'optimized' : 'none needed'})
              </p>
              {settlements.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-gray-700 text-lg font-semibold">Everyone is settled up!</p>
                  <p className="text-gray-500 text-sm mt-2">No payments needed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {settlements.map((settlement, idx) => (
                    <div key={idx} className="border-2 border-orange-200 rounded-xl p-5 bg-gradient-to-r from-orange-50 via-red-50 to-orange-50 hover:shadow-lg transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 text-lg">
                            <span className="text-red-600">{settlement.fromName}</span>
                            <span className="text-gray-400 mx-3">→</span>
                            <span className="text-green-600">{settlement.toName}</span>
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-2xl font-bold text-orange-600">₹{settlement.amount.toFixed(2)}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPaymentSettlement({
                          id: idx,
                          groupId: id,
                          from: settlement.from,
                          to: settlement.to,
                          fromName: settlement.fromName,
                          toName: settlement.toName,
                          amount: settlement.amount
                        })}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Mark Paid
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Group Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.members.map(member => (
                  <div key={member.id} className="border-2 border-gray-200 rounded-xl p-5 flex items-center justify-between hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {member.avatar || member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-600 mt-1">{member.email}</p>
                        <p className="text-xs font-semibold text-indigo-600 mt-2 uppercase bg-indigo-100 px-2 py-1 rounded-full inline-block">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onAdd={handleAddExpense}
          members={group.members}
        />
      )}

      {paymentSettlement && (
        <PaymentModal
          settlement={paymentSettlement}
          onClose={() => setPaymentSettlement(null)}
          onPaid={handlePaymentDone}
        />
      )}
    </div>
  );
}