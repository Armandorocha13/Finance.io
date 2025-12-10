/**
 * reportGenerator.ts
 * 
 * Gerador de relatórios financeiros pré-formatados
 * Preenche um template com os dados das transações
 */

interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: Record<string, number>;
  topExpenses: Array<{
    description: string;
    amount: number;
    category: string;
    date: string;
  }>;
  timeframe: string;
  totalTransactions: number;
  incomeTransactions: number;
  expenseTransactions: number;
}

/**
 * Formata valor monetário
 */
function formatCurrency(value: number): string {
  if (isNaN(value) || !isFinite(value)) return 'R$ 0,00';
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formata data
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

/**
 * Gera relatório financeiro pré-formatado
 */
export function generateFinancialReport(data: FinancialData): string {
  const {
    totalIncome,
    totalExpenses,
    balance,
    expensesByCategory,
    topExpenses,
    timeframe,
    totalTransactions,
    incomeTransactions,
    expenseTransactions
  } = data;

  // Determinar status financeiro
  const statusText = balance >= 0 ? 'Positivo' : 'Negativo';
  const statusEmoji = balance >= 0 ? '🟢' : '🔴';
  
  // Calcular taxa de economia
  const savingsRate = totalIncome > 0 
    ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1)
    : '0.0';
  
  const savingsRateNumber = Number(savingsRate);

  // Ordenar categorias por valor
  const sortedCategories = Object.keys(expensesByCategory).length > 0
    ? Object.entries(expensesByCategory)
        .sort(([, a], [, b]) => b - a)
        .map(([category, amount], index) => {
          const percentage = totalExpenses > 0 
            ? (amount / totalExpenses * 100).toFixed(1)
            : '0.0';
          return {
            rank: index + 1,
            category,
            amount,
            percentage: Number(percentage)
          };
        })
    : [];

  // Formatar maiores gastos
  const formattedTopExpenses = topExpenses.length > 0
    ? topExpenses.map((expense, index) => ({
        rank: index + 1,
        description: expense.description || 'Gasto sem descrição',
        amount: expense.amount,
        category: expense.category || 'Sem categoria',
        date: formatDate(expense.date)
      }))
    : [];

  // Gerar recomendações
  const recommendations = generateRecommendations(data);

  // Gerar metas sugeridas
  const goals = generateGoals(data, savingsRateNumber);

  // Gerar dica do mês
  const tip = generateMonthlyTip(data);

  // Obter nome do mês/período formatado
  const getPeriodName = () => {
    if (timeframe.includes('semanal')) return 'Semanal';
    if (timeframe.includes('mensal')) {
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const now = new Date();
      return monthNames[now.getMonth()];
    }
    if (timeframe.includes('anual')) {
      return new Date().getFullYear().toString();
    }
    return timeframe.charAt(0).toUpperCase() + timeframe.slice(1);
  };

  const periodName = getPeriodName();
  const currentDate = new Date();
  const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  // Acumulado total é o saldo líquido
  const accumulatedTotal = balance;

  // Determinar emoji de status para taxa de economia
  const savingsEmoji = savingsRateNumber >= 50 ? '🌟 Excelente' : 
                       savingsRateNumber >= 30 ? '⭐ Muito Bom' : 
                       savingsRateNumber >= 20 ? '✅ Bom' : 
                       savingsRateNumber >= 10 ? '💡 Regular' : '⚠️ Atenção';

  // Template do relatório no formato markdown
  const report = `# 💰 Relatório Financeiro ${capitalizedMonth}

| Indicador | Valor | Status |
| :--- | :--- | :--- |
| **Total de Entradas** | ${formatCurrency(totalIncome)} | |
| **Total de Saídas** | ${formatCurrency(totalExpenses)} | |
| **Saldo Líquido (${periodName})** | ${formatCurrency(balance)} | **${statusText} ${statusEmoji}** |
| **Acumulado Total (Dados Fornecidos)** | **${formatCurrency(accumulatedTotal)}** | |
| Taxa de Economia | ${savingsRate}% | ${savingsEmoji} |

---

${sortedCategories.length > 0 ? (sortedCategories.length === 1 ? `## 💸 Detalhe da Única Saída

* **Categoria:** ${sortedCategories[0].category}
* **Valor Gasto:** ${formatCurrency(sortedCategories[0].amount)} (Representa 100% das saídas)

` : `## 💸 Detalhe das Saídas

${sortedCategories.map(cat => 
  `* **Categoria:** ${cat.category}\n* **Valor Gasto:** ${formatCurrency(cat.amount)} (Representa ${cat.percentage.toFixed(1)}% das saídas)`
).join('\n\n')}

`) : formattedTopExpenses.length > 0 && totalExpenses > 0 ? `## 💸 Detalhe da Única Saída

* **Categoria:** ${formattedTopExpenses[0].category}
* **Valor Gasto:** ${formatCurrency(formattedTopExpenses[0].amount)} (Representa 100% das saídas)

` : totalExpenses === 0 ? `## 💸 Detalhe das Saídas

Nenhuma saída registrada no período.

` : ''}

${formattedTopExpenses.length > 0 && sortedCategories.length === 0 ? `## 💸 Maiores Gastos

${formattedTopExpenses.map(exp => 
  `* **${exp.description}**\n  * Categoria: ${exp.category}\n  * Valor: ${formatCurrency(exp.amount)}\n  * Data: ${exp.date}`
).join('\n\n')}

` : ''}

## ✅ Status

* **Status Financeiro:** ${statusText} ${statusEmoji}

${recommendations.length > 0 ? `---

${recommendations}

` : ''}

${goals.length > 0 ? `---

${goals}

` : ''}

---

💡 **Dica do Mês:** ${tip}
`;

  return report.trim();
}

/**
 * Gera recomendações baseadas nos dados
 */
function generateRecommendations(data: FinancialData): string {
  const { totalIncome, totalExpenses, balance, expensesByCategory } = data;
  const recommendations: string[] = [];

  if (totalIncome === 0 && totalExpenses === 0) {
    return '';
  }

  if (balance < 0) {
    recommendations.push('⚠️ **ATENÇÃO:** Seu saldo está negativo. Reduza gastos imediatamente.');
    recommendations.push('💳 Evite novas dívidas e priorize o pagamento das existentes');
  }

  if (totalIncome > 0) {
    const totalExpensesPercentage = (totalExpenses / totalIncome * 100);
    
    if (totalExpensesPercentage > 90) {
      recommendations.push('🚨 **CRÍTICO:** Seus gastos representam mais de 90% da sua renda');
    } else if (totalExpensesPercentage > 80) {
      recommendations.push('⚠️ Seus gastos estão muito altos em relação à sua renda (mais de 80%)');
    } else if (totalExpensesPercentage <= 50) {
      recommendations.push('✨ Excelente! Você está mantendo seus gastos sob controle');
    }

    // Analisar categorias específicas
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      const categoryPercentage = (amount / totalIncome * 100);
      
      if (categoryPercentage > 40) {
        recommendations.push(`🔍 **ATENÇÃO:** Gastos com "${category}" representam ${categoryPercentage.toFixed(1)}% da renda`);
      }
    });
  }

  if (recommendations.length === 0) {
    recommendations.push('✨ Continue mantendo o controle dos seus gastos!');
  }

  return recommendations.length > 0 ? `## 📝 Recomendações\n\n${recommendations.map(r => `* ${r}`).join('\n')}` : '';
}

/**
 * Gera metas sugeridas
 */
function generateGoals(data: FinancialData, savingsRate: number): string {
  const { balance, totalExpenses } = data;
  const goals: string[] = [];

  if (balance >= 0) {
    const targetSavingsRate = Math.min(savingsRate + 5, 30);
    goals.push(`📈 Manter o saldo positivo e aumentar a taxa de economia para ${targetSavingsRate}%`);
  } else {
    goals.push('🎯 **Meta Principal:** Alcançar saldo positivo nos próximos meses');
  }

  if (totalExpenses > 0) {
    const emergencyFund = totalExpenses * 3;
    goals.push(`🏦 Criar fundo de emergência equivalente a 3 meses de gastos (${formatCurrency(emergencyFund)})`);
  }

  if (savingsRate < 20) {
    goals.push('💰 Aumentar a taxa de economia para pelo menos 20%');
  } else {
    goals.push('📊 Considere investimentos para seu dinheiro guardado');
  }

  return goals.length > 0 ? `## 🎯 Metas Sugeridas\n\n${goals.map(g => `* ${g}`).join('\n')}` : '';
}

/**
 * Gera dica do mês
 */
function generateMonthlyTip(data: FinancialData): string {
  const tips = [
    'Estabeleça metas financeiras específicas e mensuráveis para manter o foco. Exemplo: "Economizar R$ 500 este mês".',
    'Use a regra 50/30/20: 50% para necessidades, 30% para desejos e 20% para economia e investimentos.',
    'Revise suas assinaturas e serviços recorrentes mensalmente. Cancele o que não usa regularmente.',
    'Pesquise preços e use aplicativos de desconto antes de fazer compras significativas.',
    'Mantenha um registro detalhado de todos os gastos para identificar padrões e oportunidades de economia.',
    'Crie um orçamento mensal e revise-o regularmente. Ajuste conforme necessário.',
    'Separe uma parte da sua renda para emergências ANTES de fazer outros gastos (pagamento automático).',
    'Compare preços em pelo menos 3 lugares diferentes antes de compras acima de R$ 100.',
    'Evite compras por impulso. Espere 24-48 horas antes de comprar itens não essenciais.',
    'Use o sistema de envelope: separe dinheiro físico para categorias específicas de gastos.',
    'Negocie contas e serviços. Muitas vezes você pode conseguir descontos apenas perguntando.',
    'Aproveite programas de cashback e pontos de fidelidade, mas não gaste apenas para ganhar pontos.'
  ];

  // Escolher dica baseada no saldo (determinístico)
  const balance = data.balance || 0;
  const tipIndex = Math.abs(Math.floor(balance)) % tips.length;
  return tips[tipIndex] || tips[0];
}

export type { FinancialData };

