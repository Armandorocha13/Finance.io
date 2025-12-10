import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import { generateFinancialReport, type FinancialData } from '@/services/reportGenerator';

interface AIReportProps {
  timeframe?: 'week' | 'month' | 'year';
}

const AIReport: React.FC<AIReportProps> = ({ timeframe = 'month' }) => {
  const { transactions } = useTransactions();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateReport = () => {
    setLoading(true);
    setError(null);

    try {
      if (!transactions.length) {
        throw new Error('Nenhuma transação encontrada para análise');
      }

      // Preparar os dados para análise
      const now = new Date();
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        if (timeframe === 'week') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return transactionDate >= weekAgo;
        } else if (timeframe === 'month') {
          return transactionDate.getMonth() === now.getMonth() &&
                 transactionDate.getFullYear() === now.getFullYear();
        } else {
          return transactionDate.getFullYear() === now.getFullYear();
        }
      });

      if (!filteredTransactions.length) {
        throw new Error(`Nenhuma transação encontrada para o período selecionado (${timeframe})`);
      }

      // Calcular métricas importantes
      const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
      const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');
      
      const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
      const balance = totalIncome - totalExpenses;

      // Categorizar Saídas
      const expensesByCategory = expenseTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

      // Encontrar maiores gastos
      const topExpenses = expenseTransactions
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5)
        .map(exp => ({
          description: exp.description,
          amount: exp.amount,
          category: exp.category,
          date: exp.date
        }));

      // Preparar dados para o relatório
      const reportData: FinancialData = {
        totalIncome,
        totalExpenses,
        balance,
        expensesByCategory,
        topExpenses,
        timeframe: timeframe === 'week' ? 'semanal' : timeframe === 'month' ? 'mensal' : 'anual',
        totalTransactions: filteredTransactions.length,
        incomeTransactions: incomeTransactions.length,
        expenseTransactions: expenseTransactions.length
      };

      // Gerar relatório pré-formatado
      const generatedReport = generateFinancialReport(reportData);
      
      setReport(generatedReport);
      setError(null);
      
      toast({
        title: "Relatório Gerado!",
        description: "Seu relatório financeiro foi gerado com sucesso.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro inesperado ao gerar relatório";
      console.error('Erro ao gerar relatório:', error);
      setError(errorMessage);
      setReport(null);
      
      toast({
        title: "Erro ao Gerar Relatório",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    try {
      // Criar o conteúdo do arquivo com cabeçalho e formatação
      const fileContent = `Relatório Financeiro - ${new Date().toLocaleDateString('pt-BR')}\n\n${report}`;
      
      // Criar o blob com encoding UTF-8 para suportar caracteres especiais
      const blob = new Blob([fileContent], { 
        type: 'text/plain;charset=utf-8'
      });

      // Criar URL do objeto
      const url = window.URL.createObjectURL(blob);
      
      // Criar elemento de link invisível
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-financeiro-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.txt`;
      
      // Adicionar à página, clicar e remover
      document.body.appendChild(link);
      link.click();
      
      // Pequeno delay antes de limpar
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Download Concluído",
        description: "Seu relatório foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast({
        title: "Erro no Download",
        description: "Não foi possível baixar o relatório. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
      <CardHeader>
        <CardTitle className="text-xl text-slate-200 flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-500" />
          Relatório Financeiro
          <span className="text-sm font-normal text-slate-400">
            ({timeframe === 'week' ? 'Semanal' : timeframe === 'month' ? 'Mensal' : 'Anual'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-400">
              <p>{error}</p>
            </div>
          )}
          
          {!report ? (
            <Button
              onClick={generateReport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Gerando Relatório...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap font-mono">
                {report}
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={generateReport}
                  disabled={loading}
                  variant="outline"
                  className="flex-1 bg-transparent border-green-500 text-green-500 hover:bg-green-500/10"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Atualizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Atualizar Relatório
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={downloadReport}
                  variant="outline"
                  className="bg-transparent border-blue-500 text-blue-500 hover:bg-blue-500/10"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Relatório
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIReport; 