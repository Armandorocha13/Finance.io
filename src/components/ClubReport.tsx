/**
 * ClubReport.tsx
 *
 * Relatório do Clube — Vaidoso FC
 *
 * Exibe resumos financeiros mensais e anuais + artilharia.
 * Permite gerar e baixar o relatório do mês em PDF.
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Trophy,
  FileText,
  Download,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { useArtilharia } from '@/hooks/useArtilharia';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

function calcTotals(txs: Transaction[]) {
  const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0);
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0);
  return { income, expense, balance: income - expense };
}

function byCategory(txs: Transaction[]) {
  const map: Record<string, number> = {};
  txs.forEach(t => { map[t.category] = (map[t.category] || 0) + (t.amount || 0); });
  return Object.entries(map).sort((a, b) => b[1] - a[1]);
}

// ─── Componentes internos ────────────────────────────────────────────────────

const StatCard = ({
  label, value, icon: Icon, color,
}: { label: string; value: string; icon: React.ElementType; color: string }) => (
  <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/60 border border-border">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className="text-base font-bold text-foreground">{value}</p>
    </div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider border-b border-border pb-1 mb-3">
    {children}
  </h3>
);

// ─── Componente principal ────────────────────────────────────────────────────

const ClubReport: React.FC = () => {
  const { transactions } = useTransactions();
  const { jogadores } = useArtilharia();

  const now = new Date();
  const [selYear,  setSelYear]  = useState(now.getFullYear());
  const [selMonth, setSelMonth] = useState(now.getMonth() + 1); // 1-based
  const [generating, setGenerating] = useState(false);

  // Anos disponíveis: sempre exibe de 2020 até o ano atual
  // independente de existirem transações, para permitir registros retroativos
  const years = useMemo(() => {
    const start = 2020;
    const end   = now.getFullYear();
    return Array.from({ length: end - start + 1 }, (_, i) => end - i); // decrescente
  }, []);

  // ── Filtros ─────────────────────────────────────────────────────────────────

  const monthlyTxs = useMemo(() =>
    transactions.filter(t => {
      const [y, m] = t.date.split('-').map(Number);
      return y === selYear && m === selMonth;
    }),
    [transactions, selYear, selMonth]
  );

  const annualTxs = useMemo(() =>
    transactions.filter(t => Number(t.date.slice(0, 4)) === selYear),
    [transactions, selYear]
  );

  // ── Cálculos ─────────────────────────────────────────────────────────────────

  const monthly = useMemo(() => calcTotals(monthlyTxs), [monthlyTxs]);
  const annual  = useMemo(() => calcTotals(annualTxs),  [annualTxs]);

  const monthExpCats = useMemo(() =>
    byCategory(monthlyTxs.filter(t => t.type === 'expense')),
    [monthlyTxs]
  );
  const monthIncCats = useMemo(() =>
    byCategory(monthlyTxs.filter(t => t.type === 'income')),
    [monthlyTxs]
  );

  // Top artilheiros
  const top5 = useMemo(() =>
    [...jogadores].sort((a, b) => b.gols - a.gols).slice(0, 5),
    [jogadores]
  );

  // Resumo mensal por mês no ano selecionado
  const monthlyBreakdown = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const txs = annualTxs.filter(t => Number(t.date.slice(5, 7)) === m);
      const { income, expense, balance } = calcTotals(txs);
      return { month: m, label: MONTH_NAMES[i].slice(0, 3), income, expense, balance, count: txs.length };
    });
  }, [annualTxs]);

  // ── PDF ───────────────────────────────────────────────────────────────────────

  const generatePDF = () => {
    setGenerating(true);
    try {
      const pdf   = new jsPDF();
      const W     = pdf.internal.pageSize.getWidth();
      const H     = pdf.internal.pageSize.getHeight();
      const mg    = 18;
      const lh    = 6.5;
      let   y     = mg;

      const checkBreak = (need = lh * 2) => {
        if (y + need > H - mg) { pdf.addPage(); y = mg; }
      };

      const line = (x1: number, y1: number, x2: number, y2: number) => {
        pdf.setDrawColor(210, 210, 210);
        pdf.setLineWidth(0.3);
        pdf.line(x1, y1, x2, y2);
      };

      const txt = (
        text: string,
        size: number,
        bold = false,
        x = mg,
        color: [number, number, number] = [30, 30, 30]
      ) => {
        pdf.setFontSize(size);
        pdf.setFont('helvetica', bold ? 'bold' : 'normal');
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(text, W - mg * 2);
        checkBreak(lines.length * lh * 1.4);
        lines.forEach((l: string) => { pdf.text(l, x, y); y += lh * 1.35; });
      };

      const row = (label: string, value: string, indent = mg) => {
        checkBreak(lh * 1.8);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(label, indent, y);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 30, 30);
        const vw = pdf.getTextWidth(value);
        pdf.text(value, W - mg - vw, y);
        y += lh * 1.5;
      };

      const section = (title: string) => {
        checkBreak(lh * 3);
        y += lh * 0.5;
        line(mg, y, W - mg, y);
        y += lh * 0.8;
        txt(title, 12, true, mg, [20, 20, 20]);
        y += lh * 0.3;
      };

      // ── Cabeçalho ──────────────────────────────────────────────────────────

      // Faixa verde no topo
      pdf.setFillColor(22, 163, 74);
      pdf.rect(0, 0, W, 28, 'F');

      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('VAIDOSO FC', mg, 12);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Relatório Financeiro do Clube', mg, 19);

      // Data de emissão (canto superior direito)
      const emissao = `Emitido em: ${now.toLocaleDateString('pt-BR')}`;
      const emW = pdf.getTextWidth(emissao);
      pdf.text(emissao, W - mg - emW, 19);

      y = 36;

      // Período
      txt(`Período: ${MONTH_NAMES[selMonth - 1]} / ${selYear}`, 14, true, mg, [20, 20, 20]);
      y += lh * 0.5;

      // ── Resumo Mensal ──────────────────────────────────────────────────────

      section(`RESUMO MENSAL — ${MONTH_NAMES[selMonth - 1].toUpperCase()} ${selYear}`);
      row('Total de Entradas',  BRL(monthly.income));
      row('Total de Saídas',    BRL(monthly.expense));
      row('Saldo do Mês',       BRL(monthly.balance));
      row('Nº de Transações',   String(monthlyTxs.length));

      // ── Entradas por categoria ─────────────────────────────────────────────

      if (monthIncCats.length > 0) {
        section('ENTRADAS POR CATEGORIA (MÊS)');
        monthIncCats.forEach(([cat, val]) => row(cat, BRL(val), mg + 4));
      }

      // ── Saídas por categoria ───────────────────────────────────────────────

      if (monthExpCats.length > 0) {
        section('SAÍDAS POR CATEGORIA (MÊS)');
        monthExpCats.forEach(([cat, val]) => row(cat, BRL(val), mg + 4));
      }

      // ── Resumo Anual ───────────────────────────────────────────────────────

      section(`RESUMO ANUAL — ${selYear}`);
      row('Total de Entradas no Ano',  BRL(annual.income));
      row('Total de Saídas no Ano',    BRL(annual.expense));
      row('Saldo Anual',               BRL(annual.balance));
      row('Nº de Transações no Ano',   String(annualTxs.length));

      // ── Evolução mensal ────────────────────────────────────────────────────

      section('EVOLUÇÃO MENSAL DO ANO');
      const activeMths = monthlyBreakdown.filter(m => m.count > 0);
      if (activeMths.length === 0) {
        txt('Nenhuma transação no ano selecionado.', 10, false, mg, [120, 120, 120]);
      } else {
        activeMths.forEach(m => {
          checkBreak(lh * 2);
          txt(MONTH_NAMES[m.month - 1], 10, true, mg, [40, 40, 40]);
          y -= lh * 0.3;
          row(`  Entradas: ${BRL(m.income)}   Saídas: ${BRL(m.expense)}`, BRL(m.balance), mg + 4);
        });
      }

      // ── Rodapé ────────────────────────────────────────────────────────────

      const totalPages = (pdf as any).internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(150, 150, 150);
        pdf.text(
          `Vaidoso FC — Relatório gerado em ${now.toLocaleString('pt-BR')} — Página ${p}/${totalPages}`,
          mg,
          H - 8
        );
      }

      const fileName = `vaidoso-fc-relatorio-financeiro-${MONTH_NAMES[selMonth - 1].toLowerCase()}-${selYear}.pdf`;
      pdf.save(fileName);

      toast({ title: 'PDF gerado!', description: `Arquivo "${fileName}" baixado com sucesso.` });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao gerar PDF', description: 'Não foi possível criar o arquivo.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const balanceColor = (v: number) =>
    v >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="space-y-6">

      {/* ── Filtros de período ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            Relatório do Clube
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            {/* Mês */}
            <div className="space-y-1 min-w-[140px]">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Mês
              </label>
              <Select value={String(selMonth)} onValueChange={v => setSelMonth(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((name, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ano */}
            <div className="space-y-1 min-w-[100px]">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Ano
              </label>
              <Select value={String(selYear)} onValueChange={v => setSelYear(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botões PDF */}
            <div className="ml-auto flex items-center gap-2">
              <Button
                onClick={generatePDF}
                disabled={generating}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white gap-2"
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Baixar Relatório (PDF)</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Resumo Mensal ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">
            Resumo Mensal — {MONTH_NAMES[selMonth - 1]} {selYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="Entradas" value={BRL(monthly.income)}
              icon={TrendingUp}  color="bg-green-500/15 text-green-600 dark:text-green-400" />
            <StatCard label="Saídas"   value={BRL(monthly.expense)}
              icon={TrendingDown} color="bg-red-500/15 text-red-600 dark:text-red-400" />
            <StatCard label="Saldo"    value={BRL(monthly.balance)}
              icon={DollarSign}  color="bg-blue-500/15 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Entradas por categoria */}
          {monthIncCats.length > 0 && (
            <div>
              <SectionTitle>Entradas por categoria</SectionTitle>
              <div className="space-y-1.5">
                {monthIncCats.map(([cat, val]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{BRL(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Saídas por categoria */}
          {monthExpCats.length > 0 && (
            <div>
              <SectionTitle>Saídas por categoria</SectionTitle>
              <div className="space-y-1.5">
                {monthExpCats.map(([cat, val]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{cat}</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{BRL(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {monthlyTxs.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nenhuma transação em {MONTH_NAMES[selMonth - 1]} {selYear}.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Resumo Anual ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">
            Resumo Anual — {selYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard label="Entradas no Ano" value={BRL(annual.income)}
              icon={TrendingUp}  color="bg-green-500/15 text-green-600 dark:text-green-400" />
            <StatCard label="Saídas no Ano"   value={BRL(annual.expense)}
              icon={TrendingDown} color="bg-red-500/15 text-red-600 dark:text-red-400" />
            <StatCard label="Saldo Anual"      value={BRL(annual.balance)}
              icon={DollarSign}  color="bg-purple-500/15 text-purple-600 dark:text-purple-400" />
          </div>

          {/* Evolução mês a mês */}
          <div>
            <SectionTitle>Evolução mês a mês</SectionTitle>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b border-border">
                    <th className="text-left pb-2 font-medium">Mês</th>
                    <th className="text-right pb-2 font-medium">Entradas</th>
                    <th className="text-right pb-2 font-medium">Saídas</th>
                    <th className="text-right pb-2 font-medium">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyBreakdown.map(m => (
                    <tr
                      key={m.month}
                      className={`border-b border-border/50 ${m.month === selMonth ? 'bg-green-500/5' : ''}`}
                    >
                      <td className={`py-2 font-medium ${m.month === selMonth ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                        {m.label}
                      </td>
                      <td className="py-2 text-right text-green-600 dark:text-green-400">
                        {m.income > 0 ? BRL(m.income) : '—'}
                      </td>
                      <td className="py-2 text-right text-red-600 dark:text-red-400">
                        {m.expense > 0 ? BRL(m.expense) : '—'}
                      </td>
                      <td className={`py-2 text-right font-semibold ${m.count > 0 ? balanceColor(m.balance) : 'text-muted-foreground'}`}>
                        {m.count > 0 ? BRL(m.balance) : '—'}
                      </td>
                    </tr>
                  ))}
                  {/* Totais */}
                  <tr className="border-t-2 border-border bg-muted/40">
                    <td className="py-2 font-bold text-foreground">Total</td>
                    <td className="py-2 text-right font-bold text-green-600 dark:text-green-400">{BRL(annual.income)}</td>
                    <td className="py-2 text-right font-bold text-red-600 dark:text-red-400">{BRL(annual.expense)}</td>
                    <td className={`py-2 text-right font-bold ${balanceColor(annual.balance)}`}>{BRL(annual.balance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Artilharia ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Artilharia — Ranking Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          {top5.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              Nenhum jogador cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {top5.map((j, i) => (
                <div
                  key={j.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    i === 0 && j.gols > 0
                      ? 'border-yellow-400/40 bg-yellow-500/5'
                      : 'border-border bg-muted/40'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    i === 0 && j.gols > 0
                      ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {i === 0 && j.gols > 0 ? <Trophy className="w-4 h-4" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{j.nome}</p>
                    {j.posicao && <p className="text-xs text-muted-foreground">{j.posicao}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">{j.gols}</span>
                    <span className="text-xs text-muted-foreground ml-1">gols</span>
                  </div>
                </div>
              ))}

              {jogadores.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-1">
                  +{jogadores.length - 5} jogadores — veja a lista completa na aba Artilharia.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubReport;
