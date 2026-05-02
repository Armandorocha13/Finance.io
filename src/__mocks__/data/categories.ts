/**
 * Mock de Categorias — Vaidoso FC
 */

export interface MockCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  isDefault: boolean;
}

export const mockCategories: MockCategory[] = [
  // Entradas
  { id: 'cat-1',  name: 'CARTÃO AMARELO',   type: 'income',  isDefault: true  },
  { id: 'cat-2',  name: 'CARTÃO VERMELHO',   type: 'income',  isDefault: true  },
  { id: 'cat-3',  name: 'MENSALIDADE',       type: 'income',  isDefault: true  },
  { id: 'cat-4',  name: 'PATROCÍNIO',        type: 'income',  isDefault: false },
  // Saídas
  { id: 'cat-5',  name: 'BOLA',              type: 'expense', isDefault: true  },
  { id: 'cat-6',  name: 'CAMPO',             type: 'expense', isDefault: true  },
  { id: 'cat-7',  name: 'FESTAS',            type: 'expense', isDefault: true  },
  { id: 'cat-8',  name: 'JUIZ',              type: 'expense', isDefault: true  },
  { id: 'cat-9',  name: 'LAVAGEM DE ROUPA',  type: 'expense', isDefault: true  },
  { id: 'cat-10', name: 'MATERIAIS',         type: 'expense', isDefault: true  },
  { id: 'cat-11', name: 'PASSAGEM GOLEIRO',  type: 'expense', isDefault: true  },
  { id: 'cat-12', name: 'UNIFORMES',         type: 'expense', isDefault: true  },
];

export const mockIncomeCategories  = mockCategories.filter(c => c.type === 'income');
export const mockExpenseCategories = mockCategories.filter(c => c.type === 'expense');
