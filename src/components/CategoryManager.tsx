import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Tag, Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault: boolean;
}

interface CategoryManagerProps {
  onCategoryAdded?: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ onCategoryAdded }) => {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const savedCategories = localStorage.getItem('categories');
    let loadedCategories: Category[] = [];

    if (savedCategories) {
      try {
        loadedCategories = JSON.parse(savedCategories);
      } catch (e) {
        console.error('Erro ao carregar categorias:', e);
      }
    }

    const defaultCategories: Category[] = [
      { id: '1', name: 'CARTÃO AMARELO', type: 'income', isDefault: true },
      { id: '2', name: 'CARTÃO VERMELHO', type: 'income', isDefault: true },
      { id: '3', name: 'MENSALIDADE', type: 'income', isDefault: true },
      { id: '4', name: 'BOLA', type: 'expense', isDefault: true },
      { id: '5', name: 'CAMPO', type: 'expense', isDefault: true },
      { id: '6', name: 'FESTAS', type: 'expense', isDefault: true },
      { id: '7', name: 'JUIZ', type: 'expense', isDefault: true },
      { id: '8', name: 'LAVAGEM DE ROUPA', type: 'expense', isDefault: true },
      { id: '9', name: 'MATERIAIS', type: 'expense', isDefault: true },
      { id: '10', name: 'PASSAGEM GOLEIRO', type: 'expense', isDefault: true },
      { id: '11', name: 'UNIFORMES', type: 'expense', isDefault: true },
    ];

    if (loadedCategories.length === 0) {
      setCategories(defaultCategories);
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
    } else {
      const mergedCategories = [...loadedCategories];
      defaultCategories.forEach((defaultCat) => {
        const exists = mergedCategories.some(
          (cat) => cat.name === defaultCat.name && cat.type === defaultCat.type
        );
        if (!exists) mergedCategories.push(defaultCat);
      });
      setCategories(mergedCategories);
      localStorage.setItem('categories', JSON.stringify(mergedCategories));
    }
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories]);

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({ title: 'Erro', description: 'O nome da categoria não pode estar vazio.', variant: 'destructive' });
      return;
    }
    if (categories.some((cat) => cat.name.toLowerCase() === newCategory.trim().toLowerCase() && cat.type === categoryType)) {
      toast({ title: 'Erro', description: 'Já existe uma categoria com este nome.', variant: 'destructive' });
      return;
    }
    const newCategoryObj: Category = {
      id: Date.now().toString(),
      name: newCategory.trim(),
      type: categoryType,
      isDefault: false,
    };
    setCategories((prev) => [...prev, newCategoryObj]);
    setNewCategory('');
    toast({ title: 'Sucesso', description: 'Categoria adicionada com sucesso!' });
    onCategoryAdded?.();
  };

  const handleEditStart = (category: Category) => {
    setEditingCategory(category.id);
    setEditValue(category.name);
  };

  const handleEditSave = (categoryId: string) => {
    if (!editValue.trim()) {
      toast({ title: 'Erro', description: 'O nome da categoria não pode estar vazio.', variant: 'destructive' });
      return;
    }
    const duplicateName = categories.some(
      (cat) => cat.id !== categoryId && cat.name.toLowerCase() === editValue.trim().toLowerCase() && cat.type === categoryType
    );
    if (duplicateName) {
      toast({ title: 'Erro', description: 'Já existe uma categoria com este nome.', variant: 'destructive' });
      return;
    }
    setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, name: editValue.trim() } : cat)));
    setEditingCategory(null);
    setEditValue('');
    toast({ title: 'Sucesso', description: 'Categoria atualizada com sucesso!' });
  };

  const handleEditCancel = () => {
    setEditingCategory(null);
    setEditValue('');
  };

  const handleDelete = (categoryId: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    toast({ title: 'Sucesso', description: 'Categoria excluída com sucesso!' });
  };

  // Linha de categoria — reutilizada nas abas de entrada e saída
  const CategoryRow = ({ category }: { category: Category }) => (
    <div className="flex items-center justify-between p-2 bg-muted rounded border border-border">
      {editingCategory === category.id ? (
        <div className="flex items-center gap-2 w-full">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="flex-1 h-8"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEditSave(category.id)}
            className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-500/10"
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEditCancel}
            className="h-8 px-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <>
          <span className="text-sm font-medium text-foreground">{category.name}</span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditStart(category)}
              className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(category.id)}
              className="h-8 px-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Tag className="w-5 h-5 mr-2" />
          Gerenciar Categorias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={categoryType} onValueChange={(value) => setCategoryType(value as 'income' | 'expense')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="income"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-700 dark:data-[state=active]:text-green-400"
            >
              Entradas
            </TabsTrigger>
            <TabsTrigger
              value="expense"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-700 dark:data-[state=active]:text-red-400"
            >
              Saídas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="income" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Categorias de Entrada</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.filter((cat) => cat.type === 'income').map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="expense" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Categorias de Saída</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {categories.filter((cat) => cat.type === 'expense').map((category) => (
                  <CategoryRow key={category.id} category={category} />
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Formulário de adição */}
        <div className="mt-6 space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Adicionar Nova Categoria</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="categoryType">Tipo</Label>
              <Select value={categoryType} onValueChange={(value: 'income' | 'expense') => setCategoryType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income" className="text-green-700 dark:text-green-400">Entrada</SelectItem>
                  <SelectItem value="expense" className="text-red-700 dark:text-red-400">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="newCategory">Nome da Categoria</Label>
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ex: Entretenimento"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
            </div>

            <Button
              onClick={handleAddCategory}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Categoria
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
