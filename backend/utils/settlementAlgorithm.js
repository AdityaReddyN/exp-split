/**
 * Calculates optimal settlement transactions using greedy algorithm
 * Minimizes the number of transactions needed to settle all debts
 * 
 * @param {Object} balances - { userId: netBalance } where positive = owed to them, negative = they owe
 * @returns {Array} - Array of settlement transactions [{from, to, amount}]
 */
export function calculateOptimalSettlements(balances) {

  const nonZeroBalances = Object.entries(balances)
    .filter(([, balance]) => Math.abs(balance) > 0.01)
    .reduce((acc, [userId, balance]) => {
      acc[userId] = balance;
      return acc;
    }, {});

  const creditors = [];
  const debtors = [];

  for (const [userId, balance] of Object.entries(nonZeroBalances)) {
    if (balance > 0.01) {
      creditors.push({ userId: parseInt(userId), amount: balance });
    } else if (balance < -0.01) {
      debtors.push({ userId: parseInt(userId), amount: Math.abs(balance) });
    }
  }
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const settlements = [];
  let creditorIdx = 0;
  let debtorIdx = 0;

  while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
    const creditor = creditors[creditorIdx];
    const debtor = debtors[debtorIdx];
    const settleAmount = Math.min(creditor.amount, debtor.amount);

    settlements.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: parseFloat(settleAmount.toFixed(2))
    });

    creditor.amount = parseFloat((creditor.amount - settleAmount).toFixed(2));
    debtor.amount = parseFloat((debtor.amount - settleAmount).toFixed(2));
    if (creditor.amount < 0.01) creditorIdx++;
    if (debtor.amount < 0.01) debtorIdx++;
  }

  return settlements;
}

/**
 * Calculates net balance for each user in a group
 * @param {Object} expenses - Array of expense objects with splits
 * @returns {Object} - { userId: netBalance }
 */
export function calculateBalances(expenses) {
  const balances = {};

  for (const expense of expenses) {
 
    if (!balances[expense.paid_by]) balances[expense.paid_by] = 0;
    balances[expense.paid_by] += parseFloat(expense.amount);

    for (const split of expense.splits) {
      if (!balances[split.user_id]) balances[split.user_id] = 0;
      balances[split.user_id] -= parseFloat(split.amount);
    }
  }

 
  for (const userId in balances) {
    balances[userId] = parseFloat(balances[userId].toFixed(2));
  }

  return balances;
}