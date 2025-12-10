# Estrutura do Projeto Vaidoso FC

## 📁 Organização de Diretórios

```
src/
├── components/          # Componentes React reutilizáveis
│   ├── ui/            # Componentes de UI base (shadcn/ui)
│   ├── Dashboard.tsx  # Dashboard principal
│   ├── TransactionForm.tsx
│   ├── TransactionList.tsx
│   ├── CategoryManager.tsx
│   ├── ArtilhariaManager.tsx
│   ├── AIReport.tsx
│   └── ProtectedRoute.tsx
│
├── contexts/           # Contextos React (estado global)
│   └── AuthContext.tsx # Contexto de autenticação
│
├── hooks/             # Hooks customizados
│   ├── useTransactions.ts
│   ├── useArtilharia.ts
│   ├── use-toast.ts
│   └── use-mobile.tsx
│
├── pages/             # Páginas/rotas da aplicação
│   ├── Index.tsx      # Página principal (Dashboard)
│   ├── Auth.tsx       # Página de autenticação
│   └── NotFound.tsx   # Página 404
│
├── services/          # Serviços e lógica de negócio
│   ├── financialMetrics.ts
│   └── deepseek.ts
│
├── integrations/      # Integrações externas
│   └── supabase/     # Cliente Supabase
│
├── lib/              # Utilitários e helpers
│   └── utils.ts      # Funções utilitárias (cn, etc)
│
├── types/            # Definições de tipos TypeScript
│   └── financial.ts
│
├── App.tsx           # Componente raiz
└── main.tsx          # Ponto de entrada
```

## 🎯 Princípios de Organização

### Clean Code
- **Separação de responsabilidades**: Cada arquivo tem uma responsabilidade única
- **Nomenclatura clara**: Nomes descritivos e auto-explicativos
- **Comentários**: Código documentado para facilitar manutenção
- **DRY (Don't Repeat Yourself)**: Reutilização de código

### Estrutura de Features
- Componentes agrupados por funcionalidade
- Hooks específicos para cada domínio
- Serviços isolados para lógica de negócio

## 📝 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: `Dashboard.tsx`)
- **Hooks**: camelCase com prefixo `use` (ex: `useTransactions.ts`)
- **Utilitários**: camelCase (ex: `utils.ts`)
- **Tipos/Interfaces**: PascalCase (ex: `Transaction`)

### Comentários
- **JSDoc** para funções e componentes principais
- **Comentários inline** para lógica complexa
- **TODO** para melhorias futuras

## 🔧 Arquivos Removidos (Não Utilizados)

Os seguintes arquivos foram removidos por não estarem em uso:
- `src/components/FinancialDashboard.tsx` - Componente não utilizado
- `src/contexts/ThemeContext.tsx` - Duplicado (usar `ui/theme-provider`)
- `src/components/ThemeToggle.tsx` - Duplicado (usar `ui/theme-toggle`)
- `src/pages/payment-success.tsx` - Rota não configurada
- `src/utils/setupFootballCategories.ts` - Função não utilizada

## 🚀 Próximos Passos

1. Reativar autenticação quando necessário
2. Integrar com Supabase para persistência
3. Adicionar testes unitários
4. Implementar validação de formulários mais robusta

