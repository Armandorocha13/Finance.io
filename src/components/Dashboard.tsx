/**
 * Dashboard.tsx
 * 
 * Componente principal do dashboard da aplicação Vaidoso FC
 * 
 * Funcionalidades:
 * - Exibe resumo financeiro (Entradas, Saídas, Liquido)
 * - Gráficos de Entradas vs Saídas
 * - Gráfico de distribuição de gastos por categoria
 * - Lista de artilharia (Top 5 jogadores)
 * - Navegação entre abas (Dashboard, Transações, Categorias, Artilharia, Relatório IA)
 * 
 * @author Vaidoso FC
 * @version 1.0.0
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, Plus, Tag, Wifi, WifiOff, Loader2, Brain } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import CategoryManager from './CategoryManager';
import ArtilhariaManager from './ArtilhariaManager';
import AIReport from './AIReport';
import { Header } from '@/components/ui/header-2';
import { useArtilharia } from '@/hooks/useArtilharia';
import { Trophy } from 'lucide-react';
import DateFilter, { FilterType } from './DateFilter';
import { filterTransactionsByDate, getFilterDescription } from '@/utils/dateFilter';

/**
 * Componente Dashboard
 * 
 * Gerencia o estado da aba ativa e exibe diferentes conteúdos
 * baseado na seleção do usuário no header.
 * 
 * @returns {JSX.Element} Dashboard completo com todas as funcionalidades
 */
const Dashboard = () => {
  // Hooks para dados
  const { user } = useAuth();
  const { transactions, isLoading, addTransaction, deleteTransaction, isDeletingTransaction } = useTransactions();
  const { jogadores } = useArtilharia();

  // Estados locais
  const [showForm, setShowForm] = useState(false); // Controla exibição do formulário de transação
  const [activeTab, setActiveTab] = useState('dashboard'); // Aba ativa no momento

  // Estados do filtro de data
  const currentDate = new Date();
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

  // Usa diretamente o campo amount da tabela transactions (já é number)
  // Garante que valores inválidos sejam tratados como 0
  const getAmount = (amount: number): number => {
    return typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  };

  // Remove duplicatas de forma mais robusta usando Map
  // Remove por ID primeiro, depois por combinação de campos (descrição + valor + data)
  const removeDuplicates = (transactions: Transaction[]): Transaction[] => {
    // Primeiro remove por ID
    const seenById = new Map<string, Transaction>();
    for (const transaction of transactions) {
      if (!seenById.has(transaction.id)) {
        seenById.set(transaction.id, transaction);
      }
    }

    // Depois remove por combinação de campos (mesma descrição, valor e data)
    const seenByKey = new Map<string, Transaction>();
    const uniqueTransactions: Transaction[] = [];

    for (const transaction of Array.from(seenById.values())) {
      // Cria uma chave única baseada em descrição, valor e data
      const key = `${transaction.description.trim().toLowerCase()}-${transaction.amount}-${transaction.date}`;
      if (!seenByKey.has(key)) {
        seenByKey.set(key, transaction);
        uniqueTransactions.push(transaction);
      } else {
        // Se já existe, mantém o que tem o ID mais recente (assumindo que IDs mais novos são maiores)
        const existing = seenByKey.get(key)!;
        if (transaction.id > existing.id) {
          const index = uniqueTransactions.findIndex(t => t.id === existing.id);
          if (index !== -1) {
            uniqueTransactions[index] = transaction;
            seenByKey.set(key, transaction);
          }
        }
      }
    }

    return uniqueTransactions;
  };

  // Filtra transações baseado no filtro selecionado
  // Remove duplicatas baseado no ID antes de filtrar
  const filteredTransactions = useMemo(() => {
    // Remove transações duplicadas (mesmo ID) usando Map para garantir unicidade
    const uniqueTransactions = removeDuplicates(transactions);

    const filtered = filterTransactionsByDate(
      uniqueTransactions,
      filterType,
      (filterType === 'month' || filterType === 'year') ? selectedYear : undefined,
      filterType === 'month' ? selectedMonth : undefined
    );

    // Debug: Log detalhado para verificar transações de entrada
    // Usa diretamente o campo amount da coluna transactions.amount
    const incomeTransactions = filtered.filter(t => t.type === 'income');
    const expenseTransactions = filtered.filter(t => t.type === 'expense');

    // Soma diretamente os valores da coluna amount (já são números)
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);

    // Verificação detalhada de duplicatas
    const incomeIds = incomeTransactions.map(t => t.id);
    const duplicateIds = incomeIds.filter((id, index) => incomeIds.indexOf(id) !== index);
    const uniqueIncomeIds = new Set(incomeIds);

    // Verificação de duplicatas por combinação de campos (mesma descrição, valor e data)
    const incomeByKey = new Map<string, typeof incomeTransactions[0]>();
    const duplicateKeys: string[] = [];
    incomeTransactions.forEach(t => {
      const key = `${t.description}-${t.amount}-${t.date}`;
      if (incomeByKey.has(key)) {
        duplicateKeys.push(key);
      } else {
        incomeByKey.set(key, t);
      }
    });

    // Soma manual para verificação
    let manualSum = 0;
    incomeTransactions.forEach(t => {
      manualSum += t.amount || 0;
    });

    // Alerta se houver duplicatas
    if (duplicateIds.length > 0 || duplicateKeys.length > 0) {
      console.warn('⚠️ ATENÇÃO: Duplicatas detectadas!', {
        idsDuplicados: duplicateIds,
        chavesDuplicadas: duplicateKeys
      });
    }

    // Verificação do filtro de data e análise detalhada
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Agrupa transações por mês/ano para análise
    const transactionsByMonth = incomeTransactions.reduce((acc, t) => {
      const [year, month] = t.date.split('-').map(Number);
      const key = `${year}-${String(month).padStart(2, '0')}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(t);
      return acc;
    }, {} as Record<string, typeof incomeTransactions>);

    const totalsByMonth = Object.entries(transactionsByMonth).map(([monthKey, trans]) => ({
      mes: monthKey,
      quantidade: trans.length,
      total: trans.reduce((sum, t) => sum + (t.amount || 0), 0),
      transacoes: trans.map(t => ({
        id: t.id,
        descricao: t.description,
        valor: t.amount,
        data: t.date
      }))
    }));

    console.log('📊 ANÁLISE POR MÊS:', {
      filtroAtivo: filterType,
      anoSelecionado: selectedYear,
      mesSelecionado: selectedMonth,
      totalGeral: totalIncome,
      esperado: 15045,
      diferenca: totalIncome - 15045,
      distribuicaoPorMes: totalsByMonth,
      mesAtual: `${currentYear}-${String(currentMonth).padStart(2, '0')}`,
      totalMesAtual: totalsByMonth.find(m => m.mes === `${currentYear}-${String(currentMonth).padStart(2, '0')}`)?.total || 0
    });

    if (filterType === 'all') {
      console.log('📅 Filtro: TODAS as transações (sem filtro de data)');
    } else if (filterType === 'year') {
      const transactionsOutsideYear = incomeTransactions.filter(t => {
        const [year] = t.date.split('-').map(Number);
        return year !== selectedYear;
      });
      if (transactionsOutsideYear.length > 0) {
        console.warn('⚠️ Transações fora do ano selecionado detectadas:', transactionsOutsideYear);
      }
    } else if (filterType === 'month') {
      const transactionsOutsidePeriod = incomeTransactions.filter(t => {
        const [year, month] = t.date.split('-').map(Number);
        return year !== selectedYear || month !== selectedMonth;
      });
      if (transactionsOutsidePeriod.length > 0) {
        console.warn('⚠️ Transações fora do período selecionado detectadas:', transactionsOutsidePeriod);
      }
    }

    return filtered;
  }, [transactions, filterType, selectedYear, selectedMonth]);

  // Calcula totais usando diretamente o campo amount da coluna transactions.amount
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [filteredTransactions]);

  const netBalance = useMemo(() => {
    return totalIncome - totalExpenses;
  }, [totalIncome, totalExpenses]);

  // Calcula o acumulado total de toda a história (ignora o filtro de data)
  const accumulatedBalance = useMemo(() => {
    const unique = removeDuplicates(transactions);
    const inc = unique.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0);
    const exp = unique.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0);
    return inc - exp;
  }, [transactions]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
            {/* Filtro de Data - Apenas para Dashboard */}
            <DateFilter
              filterType={filterType}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onFilterChange={setFilterType}
              onYearChange={setSelectedYear}
              onMonthChange={setSelectedMonth}
            />

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground/80">
                    Entradas
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getFilterDescription(filterType, selectedYear, selectedMonth)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground/80">
                    Saídas
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">
                    R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getFilterDescription(filterType, selectedYear, selectedMonth)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground/80">
                    Liquido
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getFilterDescription(filterType, selectedYear, selectedMonth)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground/80">
                    Acumulado em caixa
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">
                    R$ {accumulatedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Saldo histórico (Todos os anos)
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-card-foreground">
                    Entradas vs Saídas
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[350px] sm:h-[450px] p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={(() => {
                          // Calcula totais usando diretamente o campo amount da coluna transactions.amount
                          const totals = filteredTransactions.reduce((acc, transaction) => {
                            const amount = transaction.amount || 0; // Valor direto da coluna amount
                            if (transaction.type === 'income') {
                              acc.entradas += amount;
                            } else {
                              acc.saidas += amount;
                            }
                            return acc;
                          }, { entradas: 0, saidas: 0 });

                          // Retorna dados formatados para o gráfico de pizza
                          return [
                            {
                              name: 'Entradas',
                              value: totals.entradas,
                              color: '#10B981',
                              fill: '#10B981',
                            },
                            {
                              name: 'Saídas',
                              value: totals.saidas,
                              color: '#EF4444',
                              fill: '#EF4444',
                            },
                          ].filter(item => item.value > 0); // Remove itens com valor zero
                        })()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent, value }) => {
                          if (percent < 0.05) return ''; // Não mostra label se for muito pequeno
                          return `${name}: ${(percent * 100).toFixed(1)}%`;
                        }}
                        outerRadius={window.innerWidth < 640 ? 80 : 120}
                        innerRadius={window.innerWidth < 640 ? 40 : 60}
                        paddingAngle={5}
                        dataKey="value"
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {(() => {
                          // Usa diretamente o campo amount da coluna transactions.amount
                          const data = filteredTransactions.reduce((acc, transaction) => {
                            const amount = transaction.amount || 0; // Valor direto da coluna amount
                            if (transaction.type === 'income') {
                              acc.entradas += amount;
                            } else {
                              acc.saidas += amount;
                            }
                            return acc;
                          }, { entradas: 0, saidas: 0 });

                          const pieData = [
                            { name: 'Entradas', value: data.entradas, color: '#10B981' },
                            { name: 'Saídas', value: data.saidas, color: '#EF4444' },
                          ].filter(item => item.value > 0);

                          return pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ));
                        })()}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const total = (data.payload as any).value;
                            const percent = ((data.payload as any).percent * 100).toFixed(1);

                            return (
                              <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: data.color }}
                                  />
                                  <span className="text-sm font-semibold text-foreground">
                                    {data.name}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-muted-foreground">Valor:</span>
                                    <span className="text-sm font-semibold text-foreground">
                                      {new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL',
                                      }).format(total)}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-sm text-muted-foreground">Percentual:</span>
                                    <span className="text-sm font-semibold text-foreground">
                                      {percent}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={48}
                        iconType="circle"
                        wrapperStyle={{
                          paddingTop: '20px'
                        }}
                        formatter={(value) => {
                          if (value === 'Entradas') return <span className="text-sm">Entradas</span>;
                          if (value === 'Saídas') return <span className="text-sm">Saídas</span>;
                          return value;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Artilharia no Dashboard */}
            <Card className="bg-card/10 backdrop-blur-lg border-border">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-card-foreground flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Artilharia - Top 5
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jogadores.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {jogadores.slice(0, 5).map((jogador, index) => (
                        <div
                          key={jogador.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 font-bold">
                              {index === 0 && jogador.gols > 0 ? (
                                <Trophy className="w-5 h-5" />
                              ) : (
                                index + 1
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{jogador.nome}</p>
                              {jogador.posicao && (
                                <p className="text-sm text-muted-foreground">{jogador.posicao}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-green-500">{jogador.gols}</span>
                            <span className="text-sm text-muted-foreground">gols</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {jogadores.length > 5 && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="ghost"
                          onClick={() => setActiveTab('artilharia')}
                          className="text-sm"
                        >
                          Ver todos os jogadores ({jogadores.length})
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum jogador cadastrado ainda.</p>
                    <p className="text-sm mt-2">Adicione jogadores na aba Artilharia para começar!</p>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('artilharia')}
                      className="mt-4"
                    >
                      Ir para Artilharia
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4 sm:space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <TransactionList
                transactions={transactions || []}
                onDelete={deleteTransaction}
                isDeleting={isDeletingTransaction}
              />
            )}
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          <TabsContent value="artilharia">
            <ArtilhariaManager />
          </TabsContent>

          <TabsContent value="ai-report">
            <AIReport timeframe="month" />
          </TabsContent>
        </Tabs>

        {showForm && (
          <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card/10 backdrop-blur-lg border border-border rounded-2xl p-6 w-full max-w-md">
              <TransactionForm
                onSubmit={async (data) => {
                  try {
                    await addTransaction(data);
                    setShowForm(false);
                  } catch (error) {
                    console.error('Erro ao salvar transação:', error);
                    // O toast de erro já é exibido pelo hook
                  }
                }}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
