# Quick Start - Configuração do Supabase

## 🚀 Início Rápido

### 1. Executar Migrações

No **Supabase Dashboard** → **SQL Editor**:

1. Execute `migrations/001_initial_schema.sql`
2. (Opcional) Execute `migrations/002_seed_categories.sql`
3. Execute `verify_setup.sql` para verificar

### 2. Verificar Configuração

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Verificar RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Testar Inserção

```sql
-- Teste (substitua 'seu-user-id' pelo ID real)
INSERT INTO public.categories (user_id, name, type, is_default)
VALUES ('seu-user-id', 'TESTE', 'income', false);

-- Deve funcionar se RLS estiver correto
```

## ✅ Checklist Rápido

- [ ] Tabelas criadas (3 tabelas)
- [ ] RLS habilitado (todas as tabelas)
- [ ] Policies criadas (12 policies total)
- [ ] Índices criados
- [ ] Funções criadas
- [ ] Triggers criados

## 🔗 Links Úteis

- [Supabase Dashboard](https://app.supabase.com)
- [Documentação RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [SQL Editor](https://app.supabase.com/project/_/sql)

