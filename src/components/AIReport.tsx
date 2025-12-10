import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTransactions } from '@/hooks/useTransactions';
import { generateFinancialReport, type FinancialData } from '@/services/reportGenerator';
import jsPDF from 'jspdf';

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
        // Parse da data sem problemas de timezone
        let transactionDate: Date;
        if (t.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = t.date.split('-').map(Number);
          transactionDate = new Date(year, month - 1, day);
          transactionDate.setHours(12, 0, 0, 0); // Usa meio-dia para evitar problemas de timezone
        } else {
          transactionDate = new Date(t.date + 'T12:00:00');
        }
        
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
      // Criar novo documento PDF
      const pdf = new jsPDF();
      
      // Configurações
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 25;
      let yPosition = margin;
      const lineHeight = 7;
      const titleFontSize = 20;
      const sectionFontSize = 16;
      const subtitleFontSize = 13;
      const normalFontSize = 11;
      
      // Função para remover emojis e markdown
      const cleanText = (text: string): string => {
        return text
          .replace(/💰/g, '')
          .replace(/💸/g, '')
          .replace(/✅/g, '')
          .replace(/💡/g, '')
          .replace(/🟢/g, '')
          .replace(/🔴/g, '')
          .replace(/🟡/g, '')
          .replace(/\*\*/g, '')
          .trim();
      };
      
      // Função para adicionar nova página se necessário
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
      };
      
      // Função para adicionar texto
      const addText = (text: string, fontSize: number, isBold: boolean = false, x: number = margin) => {
        pdf.setFontSize(fontSize);
        pdf.setFont(undefined, isBold ? 'bold' : 'normal');
        
        const textLines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
        checkPageBreak(textLines.length * lineHeight * 1.3);
        
        textLines.forEach((textLine: string) => {
          pdf.text(textLine, x, yPosition);
          yPosition += lineHeight * 1.3;
        });
      };
      
      // Processar o relatório linha por linha
      const reportLines = report.split('\n');
      
      reportLines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Pular linhas vazias
        if (trimmedLine === '') {
          yPosition += lineHeight * 0.4;
          return;
        }
        
        // Detectar separador
        if (trimmedLine === '---') {
          yPosition += lineHeight * 0.8;
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.3);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += lineHeight * 1.2;
          return;
        }
        
        // Remover markdown e emojis
        const cleanLine = cleanText(line);
        const hasBold = line.includes('**');
        
        // Título principal (Relatório Financeiro)
        if (line.match(/^💰.*Relatório Financeiro/)) {
          // Extrair apenas "Relatório Financeiro [Mês]"
          const titleMatch = cleanLine.match(/Relatório Financeiro\s+([A-Za-z]+)/);
          const titleText = titleMatch ? `Relatório Financeiro ${titleMatch[1]}` : 'Relatório Financeiro';
          yPosition += lineHeight * 0.5;
          addText(titleText, titleFontSize, true);
          yPosition += lineHeight * 1.2;
        }
        // Seções principais (💸 Detalhe, ✅ Status, 💡 Dica)
        else if (line.match(/^💸|^✅|^💡/)) {
          yPosition += lineHeight * 1.2;
          addText(cleanLine, sectionFontSize, true);
          yPosition += lineHeight * 0.8;
        }
        // Subtítulos (começam com ** e não têm dois pontos)
        else if (hasBold && !cleanLine.includes(':')) {
          yPosition += lineHeight * 0.6;
          addText(cleanLine, subtitleFontSize, true);
          yPosition += lineHeight * 0.4;
        }
        // Linhas com "Valor:" ou "Status:"
        else if (cleanLine.includes('Valor:') || cleanLine.includes('Status:')) {
          const colonIndex = cleanLine.indexOf(':');
          if (colonIndex > 0) {
            const label = cleanLine.substring(0, colonIndex + 1).trim();
            const value = cleanLine.substring(colonIndex + 1).trim();
            
            checkPageBreak(lineHeight * 1.8);
            
            // Label em negrito à esquerda
            pdf.setFontSize(normalFontSize);
            pdf.setFont(undefined, 'bold');
            pdf.text(label, margin, yPosition);
            
            // Valor à direita (se houver)
            if (value) {
              pdf.setFont(undefined, 'normal');
              const valueWidth = pdf.getTextWidth(value);
              pdf.text(value, pageWidth - margin - valueWidth, yPosition);
            }
            
            yPosition += lineHeight * 1.6;
          } else {
            addText(cleanLine, normalFontSize, false);
          }
        }
        // "Categoria:" ou "Valor Gasto:"
        else if (cleanLine.includes('Categoria:') || cleanLine.includes('Valor Gasto:')) {
          const colonIndex = cleanLine.indexOf(':');
          if (colonIndex > 0) {
            const label = cleanLine.substring(0, colonIndex + 1).trim();
            const value = cleanLine.substring(colonIndex + 1).trim();
            
            checkPageBreak(lineHeight * 2.5);
            
            // Label em negrito
            pdf.setFontSize(normalFontSize);
            pdf.setFont(undefined, 'bold');
            pdf.text(label, margin, yPosition);
            yPosition += lineHeight * 1.4;
            
            // Valor na próxima linha (sempre em nova linha)
            pdf.setFont(undefined, 'normal');
            const valueLines = pdf.splitTextToSize(value, pageWidth - 2 * margin);
            valueLines.forEach((vl: string) => {
              pdf.text(vl, margin, yPosition);
              yPosition += lineHeight * 1.3;
            });
            
            yPosition += lineHeight * 0.3;
          } else {
            addText(cleanLine, normalFontSize, false);
          }
        }
        // "Status Financeiro:"
        else if (cleanLine.includes('Status Financeiro:')) {
          const colonIndex = cleanLine.indexOf(':');
          if (colonIndex > 0) {
            const label = cleanLine.substring(0, colonIndex + 1).trim();
            const value = cleanLine.substring(colonIndex + 1).trim();
            
            checkPageBreak(lineHeight * 1.8);
            
            // Label em negrito
            pdf.setFontSize(normalFontSize);
            pdf.setFont(undefined, 'bold');
            pdf.text(label, margin, yPosition);
            
            // Valor na mesma linha
            if (value) {
              pdf.setFont(undefined, 'normal');
              pdf.text(value, margin + pdf.getTextWidth(label) + 5, yPosition);
            }
            
            yPosition += lineHeight * 1.6;
          } else {
            addText(cleanLine, normalFontSize, false);
          }
        }
        // Texto normal (dica do mês, etc)
        else {
          addText(cleanLine, normalFontSize, false);
        }
      });
      
      // Salvar o PDF
      const fileName = `relatorio-financeiro-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Download Concluído",
        description: "Seu relatório foi baixado em PDF com sucesso.",
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
              <div className="bg-white/5 rounded-lg p-4 text-sm text-slate-300 whitespace-pre-wrap">
                {report.split('\n').map((line, index) => {
                  // Renderizar linhas com negrito
                  const parts = line.split(/(\*\*.*?\*\*)/g);
                  return (
                    <div key={index}>
                      {parts.map((part, partIndex) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          return <strong key={partIndex} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                        }
                        return <span key={partIndex}>{part}</span>;
                      })}
                    </div>
                  );
                })}
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