# Guia de Migração: localStorage → Supabase

## 📋 Visão Geral

Este guia explica como migrar a aplicação de localStorage para Supabase como banco de dados principal.

## 🗄️ Estrutura do Banco

### Tabelas Criadas

1. **`categories`** - Categorias de transações
2. **`transactions`** - Transações financeiras
3. **`artilharia`** - Jogadores e gols

## 🔧 Passo a Passo

### 1. Executar Scripts SQL

Execute os scripts na seguinte ordem:

```bash
# 1. Schema inicial (tabelas, índices, RLS, policies)
supabase/migrations/001_initial_schema.sql

# 2. Seed de categorias (opcional, se quiser categorias automáticas)
supabase/migrations/002_seed_categories.sql
```

### 2. Atualizar Hooks

#### useTransactions.ts

Substituir localStorage por Supabase:

```typescript
// ANTES (localStorage)
const savedTransactions = localStorage.getItem('transactions');

// DEPOIS (Supabase)
const { data, error } = await supabase
  .from('transactions')
  .select('*')
  .eq('user_id', user.id)
  .order('date', { ascending: false });
```

#### useArtilharia.ts

Substituir localStorage por Supabase:

```typescript
// ANTES (localStorage)
const savedJogadores = localStorage.getItem('artilharia');

// DEPOIS (Supabase)
const { data, error } = await supabase
  .from('artilharia')
  .select('*')
  .eq('user_id', user.id)
  .order('gols', { ascending: false });
```

### 3. Atualizar CategoryManager.tsx

Substituir localStorage por Supabase para categorias.

### 4. Migrar Dados Existentes (Opcional)

Se houver dados no localStorage que precisam ser migrados:

```typescript
// Script de migração (executar uma vez)
async function migrateLocalStorageToSupabase() {
  const localTransactions = JSON.parse(
    localStorage.getItem('transactions') || '[]'
  );
  
  for (const transaction of localTransactions) {
    await supabase.from('transactions').insert({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
      user_id: user.id
    });
  }
  
  // Repetir para artilharia e categories
}
```

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. As policies garantem:
- ✅ Usuários só veem seus próprios dados
- ✅ Usuários só podem modificar seus próprios dados
- ✅ user_id é automaticamente validado

### Verificar Policies

No Supabase Dashboard:
1. Vá em **Authentication** → **Policies**
2. Verifique se as policies estão ativas
3. Teste com diferentes usuários

## 📊 Verificação

### Testar Conexão

```typescript
// Teste básico
const { data, error } = await supabase
  .from('transactions')
  .select('count');

if (error) {
  console.error('Erro ao conectar:', error);
} else {
  console.log('Conexão OK!');
}
```

### Verificar Dados

```sql
-- No SQL Editor do Supabase
SELECT COUNT(*) FROM transactions;
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM artilharia;
```

## ⚠️ Importante

1. **Backup**: Sempre faça backup antes de migrar
2. **Teste**: Teste em ambiente de desenvolvimento primeiro
3. **Autenticação**: Certifique-se de que auth está funcionando
4. **RLS**: Verifique se as policies estão corretas

## 🐛 Troubleshooting

### Erro: "new row violates row-level security policy"
- Verifique se está autenticado
- Verifique se o user_id está correto
- Verifique se as policies estão ativas

### Erro: "relation does not exist"
- Execute o script de migração
- Verifique se está no schema correto (public)

### Dados não aparecem
- Verifique RLS policies
- Verifique se user_id está correto
- Verifique logs do Supabase

## 📝 Checklist

- [ ] Scripts SQL executados
- [ ] Tabelas criadas
- [ ] RLS habilitado
- [ ] Policies criadas
- [ ] Hooks atualizados
- [ ] Dados migrados (se necessário)
- [ ] Testes realizados
- [ ] Tipos TypeScript atualizados

