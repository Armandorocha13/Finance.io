import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

interface TransactionFormProps {
  onSubmit: (transaction: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
  }) => void;
  onCancel: () => void;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [categories, setCategories] = useState<Category[]>([]);

  /**
   * Carrega categorias do localStorage (mesma fonte que CategoryManager)
   */
  useEffect(() => {
    const loadCategories = () => {
      const savedCategories = localStorage.getItem('categories');
      let loadedCategories: Category[] = [];
      
      if (savedCategories) {
        try {
          loadedCategories = JSON.parse(savedCategories);
        } catch (e) {
          console.error('Erro ao carregar categorias:', e);
        }
      }

      // Categorias padrão - Futebol (mesmas do CategoryManager)
      const defaultCategories: Category[] = [
        // Entradas (Receitas)
        { id: '1', name: 'CARTÃO AMARELO', type: 'income', isDefault: true },
        { id: '2', name: 'CARTÃO VERMELHO', type: 'income', isDefault: true },
        { id: '3', name: 'MENSALIDADE', type: 'income', isDefault: true },
        // Saídas (Despesas)
        { id: '4', name: 'BOLA', type: 'expense', isDefault: true },
        { id: '5', name: 'CAMPO', type: 'expense', isDefault: true },
        { id: '6', name: 'FESTAS', type: 'expense', isDefault: true },
        { id: '7', name: 'JUIZ', type: 'expense', isDefault: true },
        { id: '8', name: 'LAVAGEM DE ROUPA', type: 'expense', isDefault: true },
        { id: '9', name: 'MATERIAIS', type: 'expense', isDefault: true },
        { id: '10', name: 'PASSAGEM GOLEIRO', type: 'expense', isDefault: true },
        { id: '11', name: 'UNIFORMES', type: 'expense', isDefault: true }
      ];

      // Se não há categorias salvas, usar as padrão
      if (loadedCategories.length === 0) {
        setCategories(defaultCategories);
        localStorage.setItem('categories', JSON.stringify(defaultCategories));
      } else {
        // Adicionar categorias padrão que não existem
        const mergedCategories = [...loadedCategories];
        defaultCategories.forEach(defaultCat => {
          const exists = mergedCategories.some(
            cat => cat.name === defaultCat.name && cat.type === defaultCat.type
          );
          if (!exists) {
            mergedCategories.push(defaultCat);
          }
        });
        setCategories(mergedCategories);
      }
    };

    loadCategories();

    // Escuta mudanças no localStorage para atualizar quando categorias são adicionadas/editadas
    const handleStorageChange = () => {
      loadCategories();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Também verifica periodicamente (para mudanças na mesma aba)
    const interval = setInterval(loadCategories, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  /**
   * Filtra categorias por tipo (receita ou despesa)
   */
  const getCategoriesByType = (type: 'income' | 'expense'): string[] => {
    return categories
      .filter(cat => cat.type === type)
      .map(cat => cat.name)
      .sort();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category) return;

    onSubmit({
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date
    });

    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Nova Transação</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="description" className="text-white">Descrição</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Ex: Compra no supermercado"
            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
            required
          />
        </div>

        <div>
          <Label htmlFor="amount" className="text-white">Valor</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0,00"
            className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
            required
          />
        </div>

        <div>
          <Label htmlFor="type" className="text-white">Tipo</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value: 'income' | 'expense') => 
              setFormData({ ...formData, type: value, category: '' })
            }
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="income" className="text-green-400">Receita</SelectItem>
              <SelectItem value="expense" className="text-red-400">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category" className="text-white">Categoria</Label>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {getCategoriesByType(formData.type).length > 0 ? (
                getCategoriesByType(formData.type).map((category) => (
                  <SelectItem key={category} value={category} className="text-white">
                    {category}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-1.5 text-sm text-slate-500">
                  Nenhuma categoria disponível
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="date" className="text-white">Data</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="bg-white/10 border-white/20 text-white"
            required
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 bg-transparent border-white text-white hover:bg-white/10"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
        >
          Salvar
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;
