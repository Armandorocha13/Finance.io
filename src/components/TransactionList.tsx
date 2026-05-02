import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar, Trash2 } from 'lucide-react';
import { Transaction } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, isDeleting }) => {
  const { toast } = useToast();

  const formatDate = (dateString: string) => {
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      try {
        await onDelete(transactionId);
        toast({ title: 'Transação excluída', description: 'A transação foi removida com sucesso.' });
      } catch {
        toast({ title: 'Erro ao excluir', description: 'Não foi possível excluir a transação. Tente novamente.', variant: 'destructive' });
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Transações {transactions.length > 5 ? 'Todas' : 'Recentes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma transação encontrada
            </p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-all duration-200 group"
              >
                {/* Lado esquerdo */}
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === 'income'
                        ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                        : 'bg-red-500/15 text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>

                {/* Lado direito */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.type === 'income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}R$ {transaction.amount.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    disabled={isDeleting}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;
