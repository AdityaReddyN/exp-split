import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, TrendingDown, Users, History, ArrowLeft, BarChart3, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import apiClient from '../utils/api';
import toast from '../utils/toast';
import AddExpenseModal from '../components/AddExpenseModal';
import PaymentModal from '../components/PaymentModal';
import './GroupDetail.css';

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

  const generateReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header - Use sage green tones
    doc.setFontSize(22);
    doc.setTextColor(80, 92, 69); // sage-darkest
    doc.text(`Expense Report: ${group.name}`, 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 28);
    doc.text(`Group Code: ${group.code} | Category: ${group.category}`, 20, 33);

    // Divider
    doc.setDrawColor(147, 168, 126); // sage-medium
    doc.setLineWidth(0.5);
    doc.line(20, 38, pageWidth - 20, 38);

    // Summary Section
    doc.setFontSize(16);
    doc.setTextColor(50);
    doc.text('Summary', 20, 50);

    doc.setFontSize(12);
    doc.text(`Total Group Expenses: INR ${balances?.totalSpent.toFixed(2)}`, 20, 60);
    doc.text(`Total Members: ${group.members.length}`, 20, 67);

    // Balances Section
    doc.setFontSize(14);
    doc.setTextColor(80, 92, 69);
    doc.text('Current Balances', 20, 80);

    doc.setFontSize(11);
    doc.setTextColor(0);
    let yPos = 88;
    balances?.balances.forEach((b) => {
      const status = b.balance > 0 ? 'Receives' : b.balance < 0 ? 'Owes' : 'Settled';
      doc.text(`${b.name}:`, 25, yPos);
      doc.setTextColor(b.balance > 0 ? 34 : b.balance < 0 ? 153 : 100); // green for positive, red for negative
      doc.text(`${status} INR ${Math.abs(b.balance).toFixed(2)}`, 70, yPos);
      doc.setTextColor(0);
      yPos += 7;
    });

    // Detailed Expenses Section
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(80, 92, 69);
    doc.text('Full Expense List', 20, 20);

    doc.setDrawColor(212, 243, 183);
    doc.line(20, 25, pageWidth - 20, 25);

    yPos = 35;
    expenses.forEach((e, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(40);
      doc.text(`${index + 1}. ${e.description}`, 20, yPos);

      doc.setFontSize(10);
      doc.setTextColor(100);
      const expenseDate = new Date(e.date).toLocaleDateString();
      doc.text(`Paid by ${e.paid_by_name} on ${expenseDate}`, 25, yPos + 6);

      doc.setFontSize(12);
      doc.setTextColor(80, 92, 69);
      doc.text(`INR ${e.amount.toFixed(2)}`, pageWidth - 55, yPos + 3);

      doc.setDrawColor(245);
      doc.line(20, yPos + 10, pageWidth - 20, yPos + 10);
      yPos += 18;
    });

    doc.save(`${group.name}_Expense_Report.pdf`);
    toast.success('PDF Report downloaded!');
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
      <div className="group-detail-loading">
        <div className="text-center">
          <div className="group-detail-loading-spinner"></div>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginTop: '1rem' }}>Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-detail-not-found">
        <div className="group-detail-not-found-card">
          <h1 className="group-detail-not-found-title">Group not found</h1>
          <p className="group-detail-not-found-text">The group you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group-detail-container">
      <div className="group-detail-content">
        {/* Header */}
        <div className="group-detail-header">
          <div style={{ flex: 1 }}>
            <button
              onClick={() => navigate('/dashboard')}
              className="group-detail-back-button"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="group-detail-title">{group.name}</h1>
            {group.description && (
              <p className="group-detail-description">{group.description}</p>
            )}
            <div className="group-detail-badges">
              <span className="group-detail-badge">
                {group.member_count || group.members.length} members
              </span>
              <span className="group-detail-badge" style={{ textTransform: 'capitalize' }}>
                {group.category}
              </span>
            </div>
          </div>
          <div className="group-detail-header-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={generateReport}
              className="group-detail-add-button"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <FileDown size={20} /> Report
            </button>
            <button
              onClick={() => navigate(`/groups/${id}/analytics`)}
              className="group-detail-add-button"
              style={{ background: 'rgba(255, 255, 255, 0.1)' }}
            >
              <BarChart3 size={20} /> Analytics
            </button>
            <button
              onClick={() => setShowAddExpense(true)}
              className="group-detail-add-button"
            >
              <Plus size={20} /> Add Expense
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="group-detail-tabs">
          {[
            { key: 'expenses', label: 'Expenses', icon: Plus },
            { key: 'balances', label: 'Balances', icon: Users },
            { key: 'settlements', label: 'Settle Up', icon: TrendingDown },
            { key: 'members', label: 'Members', icon: Users }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`group-detail-tab ${activeTab === tab.key ? 'group-detail-tab--active' : ''}`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="group-detail-content-card">
          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <div>
              <h2 className="group-detail-section-title">Recent Expenses</h2>
              {expenses.length === 0 ? (
                <div className="group-detail-empty">
                  <div className="group-detail-empty-icon">
                    <Plus size={32} />
                  </div>
                  <p className="group-detail-empty-text">No expenses yet</p>
                  <p className="group-detail-empty-subtext">Add your first expense to get started</p>
                </div>
              ) : (
                <div className="group-detail-expenses-list">
                  {expenses.map(expense => (
                    <div key={expense.id} className="group-detail-expense-card">
                      <div className="group-detail-expense-header">
                        <div className="group-detail-expense-info">
                          <p className="group-detail-expense-description">{expense.description}</p>
                          <p className="group-detail-expense-payer">
                            Paid by <span className="group-detail-expense-payer-name">{expense.paid_by_name}</span>
                          </p>
                          <p className="group-detail-expense-date">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                        <div className="group-detail-expense-amount">
                          <p className="group-detail-expense-amount-value">₹{expense.amount.toFixed(2)}</p>
                          <p className="group-detail-expense-splits">{expense.splits.length} {expense.splits.length === 1 ? 'person' : 'people'}</p>
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
              <h2 className="group-detail-section-title">Individual Balances</h2>
              <div className="group-detail-balances-grid">
                {balances.balances.map(balance => (
                  <div key={balance.userId} className="group-detail-balance-card">
                    <div className="group-detail-balance-header">
                      <span className="group-detail-balance-name">{balance.name}</span>
                      <span className={`group-detail-balance-amount ${balance.balance > 0 ? 'group-detail-balance-amount--positive' :
                        balance.balance < 0 ? 'group-detail-balance-amount--negative' :
                          'group-detail-balance-amount--zero'
                        }`}>
                        {balance.balance > 0 ? '+' : ''}₹{balance.balance.toFixed(2)}
                      </span>
                    </div>
                    <div className="group-detail-balance-details">
                      <div className="group-detail-balance-detail">
                        <span className="group-detail-balance-detail-label">Paid:</span> ₹{balance.totalPaid.toFixed(2)}
                      </div>
                      <div className="group-detail-balance-detail">
                        <span className="group-detail-balance-detail-label">Owes:</span> ₹{balance.totalOwed.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="group-detail-total-spent">
                <p className="group-detail-total-spent-text">Total Spent: <span className="group-detail-total-spent-amount">₹{balances.totalSpent.toFixed(2)}</span></p>
              </div>
            </div>
          )}

          {/* Settlements Tab */}
          {activeTab === 'settlements' && (
            <div>
              <div className="group-detail-settlements-header">
                <h2 className="group-detail-section-title" style={{ marginBottom: 0 }}>Optimal Settlements</h2>
                <p className="group-detail-settlements-count">
                  {settlements.length} {settlements.length === 1 ? 'transaction' : 'transactions'} ({settlements.length > 0 ? 'optimized' : 'none needed'})
                </p>
              </div>
              {settlements.length === 0 ? (
                <div className="group-detail-settled-message">
                  <div className="group-detail-settled-emoji">🎉</div>
                  <p className="group-detail-settled-text">Everyone is settled up!</p>
                  <p className="group-detail-settled-subtext">No payments needed</p>
                </div>
              ) : (
                <div className="group-detail-settlements-list">
                  {settlements.map((settlement, idx) => (
                    <div key={idx} className="group-detail-settlement-card">
                      <div className="group-detail-settlement-header">
                        <div className="group-detail-settlement-flow">
                          <span className="group-detail-settlement-from">{settlement.fromName}</span>
                          <span className="group-detail-settlement-arrow">→</span>
                          <span className="group-detail-settlement-to">{settlement.toName}</span>
                        </div>
                        <div className="group-detail-settlement-amount">₹{settlement.amount.toFixed(2)}</div>
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
                        className="group-detail-settlement-button"
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
              <h2 className="group-detail-section-title">Group Members</h2>
              <div className="group-detail-members-grid">
                {group.members.map(member => (
                  <div key={member.id} className="group-detail-member-card">
                    <div className="group-detail-member-info">
                      <div className="group-detail-member-avatar">
                        {member.avatar || member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="group-detail-member-details">
                        <p className="group-detail-member-name">{member.name}</p>
                        <p className="group-detail-member-email">{member.email}</p>
                        <span className="group-detail-member-role">{member.role}</span>
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