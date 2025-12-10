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

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Plus, Tag, Wifi, WifiOff, Loader2, Brain } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import CategoryManager from './CategoryManager';
import ArtilhariaManager from './ArtilhariaManager';
import AIReport from './AIReport';
import { Header } from '@/components/ui/header-2';
import { useArtilharia } from '@/hooks/useArtilharia';
import { Trophy } from 'lucide-react';

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
  const { transactions, isLoading, addTransaction } = useTransactions();
  const { jogadores } = useArtilharia();
  
  // Estados locais
  const [showForm, setShowForm] = useState(false); // Controla exibição do formulário de transação
  const [activeTab, setActiveTab] = useState('dashboard'); // Aba ativa no momento

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Olá, {user?.user_metadata?.name || 'Usuário'}
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>

          <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
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
                    R$ {transactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
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
                    R$ {transactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
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
                    R$ {(transactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0) -
                      transactions
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0))
                      .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground/80">
                    Transações
                  </CardTitle>
                  <PieChart className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-500">
                    {transactions.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-card-foreground">
                    Entradas vs Saídas
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={(() => {
                      // Agrupa transações por data e separa entradas e saídas
                      const groupedByDate = transactions.reduce((acc, transaction) => {
                        const date = transaction.date;
                        if (!acc[date]) {
                          acc[date] = { date, entradas: 0, saidas: 0 };
                        }
                        if (transaction.type === 'income') {
                          acc[date].entradas += transaction.amount;
                        } else {
                          acc[date].saidas += transaction.amount;
                        }
                        return acc;
                      }, {} as Record<string, { date: string; entradas: number; saidas: number }>);

                      // Converte para array e ordena por data
                      return Object.values(groupedByDate).sort((a, b) => 
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                      );
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                      <XAxis 
                        dataKey="date" 
                        stroke="currentColor" 
                        fontSize={12} 
                        opacity={0.5}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                        }}
                      />
                      <YAxis stroke="currentColor" fontSize={12} opacity={0.5} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)', 
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--foreground)',
                          fontSize: '12px'
                        }}
                        formatter={(value: number, name: string) => [
                          new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                          }).format(value),
                          name
                        ]}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return date.toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          });
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="entradas" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        name="Entradas"
                        dot={{ fill: '#10B981', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="saidas" 
                        stroke="#EF4444" 
                        strokeWidth={3}
                        name="Saídas"
                        dot={{ fill: '#EF4444', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card/10 backdrop-blur-lg border-border">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl text-card-foreground">
                    Distribuição de Gastos
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={transactions
                          .filter(t => t.type === 'expense')
                          .reduce((acc, t) => {
                            const existing = acc.find(item => item.category === t.category);
                            if (existing) {
                              existing.value += t.amount;
                            } else {
                              acc.push({ 
                                category: t.category, 
                                value: t.amount,
                                formattedValue: new Intl.NumberFormat('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL'
                                }).format(t.amount)
                              });
                            }
                            return acc;
                          }, [] as { category: string; value: number; formattedValue: string }[])}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#10B981"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        animationDuration={1000}
                        animationBegin={0}
                      >
                        {transactions
                          .filter(t => t.type === 'expense')
                          .map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={[
                                '#10B981', // Verde
                                '#3B82F6', // Azul
                                '#F59E0B', // Laranja
                                '#EF4444', // Vermelho
                                '#8B5CF6', // Roxo
                                '#EC4899', // Rosa
                                '#14B8A6', // Turquesa
                                '#F97316', // Laranja escuro
                              ][index % 8]} 
                            />
                          ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(value)}
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          color: 'var(--foreground)',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => (
                          <span className="text-sm text-foreground/80">{value}</span>
                        )}
                      />
                    </RechartsPieChart>
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
              <TransactionList transactions={transactions || []} />
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
