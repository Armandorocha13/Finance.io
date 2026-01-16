/**
 * DateFilter.tsx
 * 
 * Componente moderno para filtrar transações por período de data
 * 
 * Opções:
 * - Botões rápidos (Hoje, 7 dias, 15 dias, 30 dias, Mês atual)
 * - Por mês e ano específico
 * - Todos os dados
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Filter, Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterType = 'all' | 'year' | 'month';

export interface DateFilterProps {
  filterType: FilterType;
  selectedYear: number;
  selectedMonth: number;
  onFilterChange: (type: FilterType) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

const DateFilter: React.FC<DateFilterProps> = ({
  filterType,
  selectedYear,
  selectedMonth,
  onFilterChange,
  onYearChange,
  onMonthChange,
}) => {
  // Gera anos dos últimos 5 anos até o próximo ano
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 4 + i);

  const months = [
    { value: 1, label: 'Jan', fullLabel: 'Janeiro' },
    { value: 2, label: 'Fev', fullLabel: 'Fevereiro' },
    { value: 3, label: 'Mar', fullLabel: 'Março' },
    { value: 4, label: 'Abr', fullLabel: 'Abril' },
    { value: 5, label: 'Mai', fullLabel: 'Maio' },
    { value: 6, label: 'Jun', fullLabel: 'Junho' },
    { value: 7, label: 'Jul', fullLabel: 'Julho' },
    { value: 8, label: 'Ago', fullLabel: 'Agosto' },
    { value: 9, label: 'Set', fullLabel: 'Setembro' },
    { value: 10, label: 'Out', fullLabel: 'Outubro' },
    { value: 11, label: 'Nov', fullLabel: 'Novembro' },
    { value: 12, label: 'Dez', fullLabel: 'Dezembro' },
  ];

  const quickFilters = [
    { value: 'all' as FilterType, label: 'Todos' },
    { value: 'year' as FilterType, label: 'Anual' },
    { value: 'month' as FilterType, label: 'Mensal' },
  ];

  return (
    <Card className="bg-gradient-to-br from-card/20 to-card/10 backdrop-blur-xl border-border/50 shadow-lg">
      <CardContent className="pt-6 pb-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Filter className="w-5 h-5 text-primary" />
              </div>
              <div className="text-center">
                <Label className="text-base font-semibold text-foreground">Filtro de Período</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Selecione o período para análise</p>
              </div>
            </div>
          </div>

          {/* Botões Rápidos */}
          <div className="flex flex-wrap gap-2 justify-center">
            {quickFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={filterType === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onFilterChange(filter.value)}
                className={cn(
                  "transition-all duration-200 min-w-[80px]",
                  filterType === filter.value
                    ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md scale-105"
                    : "hover:bg-accent/50 hover:scale-105 border-border/50"
                )}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Seletores de Mês/Ano (quando personalizado) */}
          {(filterType === 'month' || filterType === 'year') && (
            <div className={cn(
              "grid gap-4 pt-4 border-t border-border/50 animate-in slide-in-from-top-2 duration-300 w-full",
              filterType === 'month' ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
            )}>
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  Ano
                </Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => onYearChange(parseInt(value))}
                >
                  <SelectTrigger id="year" className="h-11 bg-background/50 border-border/50 hover:border-primary/50 transition-colors">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filterType === 'month' && (
                <div className="space-y-2">
                  <Label htmlFor="month" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Mês
                  </Label>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => onMonthChange(parseInt(value))}
                  >
                    <SelectTrigger id="month" className="h-11 bg-background/50 border-border/50 hover:border-primary/50 transition-colors">
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{month.label}</span>
                            <span className="text-xs text-muted-foreground">({month.fullLabel})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DateFilter;

