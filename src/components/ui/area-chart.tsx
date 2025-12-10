/**
 * area-chart.tsx
 * 
 * Componente de gráfico de área para exibir dados financeiros
 * Utiliza Recharts para renderização
 * 
 * @author Vaidoso FC
 * @version 1.0.0
 */

"use client";

import React from "react";
import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

export type DataPoint = Record<string, string | number>;

export interface AreaChartProps {
  /**
   * Dados para o gráfico
   * Array de objetos onde cada objeto representa um ponto de dados
   */
  data?: DataPoint[];
  
  /**
   * Categorias (chaves dos dados) para exibir no gráfico
   * Ex: ["entradas", "saidas"]
   */
  categories?: string[];
  
  /**
   * Chave do índice (eixo X)
   * Ex: "date"
   */
  index?: string;
  
  /**
   * Se true, as áreas serão empilhadas
   */
  stacked?: boolean;
  
  /**
   * Classes CSS adicionais
   */
  className?: string;
  
  /**
   * Cores para cada categoria
   */
  colors?: string[];
  
  /**
   * Altura do gráfico
   */
  height?: number;
}

/* Valores padrão */
const defaultIndex = "date";
const defaultCategories = ["entradas", "saidas"];
const defaultData: DataPoint[] = [];
const defaultColors = ["#10B981", "#EF4444"]; // Verde para entradas, vermelho para saídas

/**
 * Componente AreaChart
 * 
 * Renderiza um gráfico de área usando Recharts
 * 
 * @param {AreaChartProps} props - Propriedades do componente
 * @returns {JSX.Element} Gráfico de área
 */
const AreaChartRoot = React.forwardRef<
  HTMLDivElement,
  AreaChartProps
>(function AreaChartRoot(
  {
    data = defaultData,
    categories = defaultCategories,
    index = defaultIndex,
    stacked = false,
    className,
    colors = defaultColors,
    height = 400,
    ...otherProps
  }: AreaChartProps,
  ref
) {
  // Se não houver dados, retorna um placeholder
  if (!data || data.length === 0) {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center w-full text-muted-foreground", className)}
        style={{ height: typeof height === 'number' ? `${height}px` : height || '400px' }}
        {...otherProps}
      >
        <p>Nenhum dado disponível para exibir</p>
      </div>
    );
  }

  // Calcula a altura do container - se não for especificada, usa 100% do container pai
  const containerHeight = height !== undefined 
    ? (typeof height === 'number' ? `${height}px` : height)
    : '100%';
  
  return (
    <div 
      ref={ref} 
      className={cn("w-full h-full", className)} 
      style={{ height: containerHeight }}
      {...otherProps}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {categories.map((category, index) => (
              <linearGradient
                key={category}
                id={`color${category}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={colors[index % colors.length]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={colors[index % colors.length]}
                  stopOpacity={0.1}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis
            dataKey={index}
            stroke="currentColor"
            fontSize={12}
            opacity={0.5}
            tickFormatter={(value) => {
              // Formatação de data se for uma data
              if (typeof value === 'string' && value.includes('-')) {
                const date = new Date(value);
                return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              }
              return value;
            }}
          />
          <YAxis
            stroke="currentColor"
            fontSize={12}
            opacity={0.5}
            tickFormatter={(value) => {
              if (typeof value === 'number') {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  notation: 'compact',
                  maximumFractionDigits: 0,
                }).format(value);
              }
              return value;
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--foreground)',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => [
              new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value),
              name === 'entradas' ? 'Entradas' : name === 'saidas' ? 'Saídas' : name,
            ]}
            labelFormatter={(label) => {
              if (typeof label === 'string' && label.includes('-')) {
                const date = new Date(label);
                return date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });
              }
              return label;
            }}
          />
          <Legend
            formatter={(value) => {
              if (value === 'entradas') return 'Entradas';
              if (value === 'saidas') return 'Saídas';
              return value;
            }}
          />
          {categories.map((category, index) => (
            <Area
              key={category}
              type="monotone"
              dataKey={category}
              stackId={stacked ? "1" : undefined}
              stroke={colors[index % colors.length]}
              fill={`url(#color${category})`}
              strokeWidth={2}
              name={category === 'entradas' ? 'Entradas' : category === 'saidas' ? 'Saídas' : category}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
});

AreaChartRoot.displayName = "AreaChart";

export const AreaChart = AreaChartRoot;
export default AreaChart;

