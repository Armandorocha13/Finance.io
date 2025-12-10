# 🗄️ Instalação do Banco de Dados - Vaidoso FC

## 📋 Visão Geral

Este guia explica como configurar o banco de dados Supabase para a aplicação Vaidoso FC.

## ✅ Pré-requisitos

- Conta no Supabase (https://supabase.com)
- Projeto criado no Supabase
- Acesso ao SQL Editor

## 🚀 Passo a Passo

### 1. Acessar o SQL Editor

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**

### 2. Executar Migração Principal

1. Abra o arquivo `supabase/migrations/001_initial_schema.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em **Run** (ou pressione `Ctrl+Enter`)

**O que este script cria:**
- ✅ 3 tabelas (categories, transactions, artilharia)
- ✅ Índices para performance
- ✅ Row Level Security (RLS)
- ✅ Policies de segurança
- ✅ Triggers para updated_at
- ✅ Função update_updated_at_column

### 3. Executar Seed de Categorias (Opcional)

1. Abra o arquivo `supabase/migrations/002_seed_categories.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor
4. Execute

**O que este script cria:**
- ✅ Função para criar categorias padrão automaticamente
- ✅ Trigger que cria categorias quando usuário é criado
- ✅ Função manual para criar categorias em usuários existentes

### 4. Verificar Instalação

1. Abra o arquivo `supabase/verify_setup.sql`
2. Execute no SQL Editor
3. Verifique se todas as verificações passaram

## 📊 Estrutura das Tabelas

### `categories`
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- name (TEXT)
- type (TEXT: 'income' | 'expense')
- is_default (BOOLEAN)
- created_at, updated_at
```

### `transactions`
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- description (TEXT)
- amount (DECIMAL, > 0)
- type (TEXT: 'income' | 'expense')
- category (TEXT)
- date (DATE)
- created_at, updated_at
```

### `artilharia`
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users)
- nome (TEXT)
- gols (INTEGER, >= 0)
- posicao (TEXT, opcional)
- created_at, updated_at
```

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Isso significa:
- Usuários **só veem** seus próprios dados
- Usuários **só podem inserir** dados para si mesmos
- Usuários **só podem atualizar** seus próprios dados
- Usuários **só podem deletar** seus próprios dados

### Policies Criadas

Cada tabela tem 4 policies:
1. **SELECT** - Ver apenas dados próprios
2. **INSERT** - Inserir apenas com user_id correto
3. **UPDATE** - Atualizar apenas dados próprios
4. **DELETE** - Deletar apenas dados próprios

**Total: 12 policies** (4 por tabela × 3 tabelas)

## 📈 Índices

Índices criados para otimizar consultas frequentes:

**transactions:**
- `idx_transactions_user_id` - Busca por usuário
- `idx_transactions_date` - Ordenação por data
- `idx_transactions_type` - Filtro por tipo
- `idx_transactions_category` - Filtro por categoria
- `idx_transactions_user_date` - Busca por usuário + data (composto)

**categories:**
- `idx_categories_user_id` - Busca por usuário
- `idx_categories_type` - Filtro por tipo
- `idx_categories_user_type` - Busca por usuário + tipo (composto)

**artilharia:**
- `idx_artilharia_user_id` - Busca por usuário
- `idx_artilharia_gols` - Ordenação por gols
- `idx_artilharia_user_gols` - Ranking por usuário (composto)

## 🔄 Triggers

### update_updated_at_column
Atualiza automaticamente o campo `updated_at` quando um registro é modificado.

Aplicado em:
- `categories`
- `transactions`
- `artilharia`

## ✅ Verificação Pós-Instalação

Execute o script `verify_setup.sql` para verificar:

```sql
-- Verificar tabelas
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'transactions', 'artilharia');
-- Deve retornar: 3

-- Verificar RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'transactions', 'artilharia');
-- Todas devem ter rowsecurity = true

-- Verificar policies
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('categories', 'transactions', 'artilharia');
-- Deve retornar: 12
```

## 🐛 Troubleshooting

### Erro: "permission denied for schema public"
- Verifique se está usando a conta de administrador
- Verifique permissões do usuário no Supabase

### Erro: "relation already exists"
- As tabelas já existem
- Você pode usar `DROP TABLE IF EXISTS` antes (cuidado com dados!)

### Erro: "foreign key constraint"
- Certifique-se de que `auth.users` existe
- Verifique se os user_ids são válidos

### Policies não funcionam
- Verifique se RLS está habilitado: `ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;`
- Verifique se as policies estão ativas no Dashboard

## 📝 Próximos Passos

Após executar os scripts:

1. ✅ Verificar se todas as tabelas foram criadas
2. ✅ Testar inserção de dados
3. ✅ Verificar se RLS está funcionando
4. ✅ Atualizar hooks da aplicação (ver `MIGRATION_GUIDE.md`)
5. ✅ Atualizar tipos TypeScript do Supabase

## 🔗 Arquivos Relacionados

- `migrations/001_initial_schema.sql` - Schema principal
- `migrations/002_seed_categories.sql` - Seed de categorias
- `verify_setup.sql` - Script de verificação
- `MIGRATION_GUIDE.md` - Guia de migração dos hooks
- `EXAMPLES/hooks_example.ts` - Exemplos de hooks atualizados

---

**Data de criação**: Dezembro 2024  
**Versão**: 1.0.0  
**Projeto**: Vaidoso FC

