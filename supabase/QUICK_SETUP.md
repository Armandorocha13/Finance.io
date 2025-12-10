# ⚡ Setup Rápido - Supabase Vaidoso FC

## 🎯 Objetivo

Configurar o banco de dados Supabase em 5 minutos.

## 📋 Checklist

- [ ] 1. Atualizar cliente Supabase
- [ ] 2. Executar migração do banco
- [ ] 3. Verificar instalação
- [ ] 4. Testar conexão

## 🚀 Passo a Passo

### 1️⃣ Atualizar Cliente Supabase

**Arquivo:** `src/integrations/supabase/client.ts`

```typescript
const SUPABASE_URL = "https://zmowanlowqpioxbycead.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "OBTER_NO_DASHBOARD";
```

**Como obter a chave:**
1. Acesse: https://zmowanlowqpioxbycead.supabase.co
2. Settings → API → anon public key

### 2️⃣ Executar Migração

**No Supabase Dashboard → SQL Editor:**

1. Execute: `migrations/001_initial_schema.sql`
2. (Opcional) Execute: `migrations/002_seed_categories.sql`
3. Execute: `verify_setup.sql`

### 3️⃣ Verificar

Execute: `test_connection.sql`

Deve retornar:
- ✅ 3 tabelas criadas
- ✅ 12 policies criadas
- ✅ RLS habilitado

### 4️⃣ Testar no Código

```typescript
import { supabase } from '@/integrations/supabase/client';

// Teste
const { data, error } = await supabase
  .from('transactions')
  .select('count');
  
console.log(error ? 'ERRO' : 'OK');
```

## 🔐 Credenciais

- **URL**: https://zmowanlowqpioxbycead.supabase.co
- **DB Password**: UqXAaQWafg8Guokw
- **Connection**: `postgresql://postgres:UqXAaQWafg8Guokw@db.zmowanlowqpioxbycead.supabase.co:5432/postgres`

## 📚 Documentação Completa

- `INSTALLATION.md` - Instalação detalhada
- `CONNECTION_INFO.md` - Informações de conexão
- `MIGRATION_GUIDE.md` - Guia de migração dos hooks

## ⚠️ Problemas?

1. Verifique se a URL está correta
2. Verifique se a chave anon está correta
3. Execute `test_connection.sql` para diagnosticar
4. Verifique logs no Supabase Dashboard

---

**Tempo estimado:** 5-10 minutos

