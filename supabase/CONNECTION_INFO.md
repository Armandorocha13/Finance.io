# 🔐 Informações de Conexão - Supabase

## 📋 Credenciais do Projeto

### URL do Projeto
```
https://zmowanlowqpioxbycead.supabase.co
```

### String de Conexão PostgreSQL
```
postgresql://postgres:UqXAaQWafg8Guokw@db.zmowanlowqpioxbycead.supabase.co:5432/postgres
```

### Senha do Banco
```
UqXAaQWafg8Guokw
```

## 🔑 Como Obter a Chave Pública (anon key)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione o projeto: `zmowanlowqpioxbycead`
3. Vá em **Settings** → **API**
4. Em **Project API keys**, copie a chave **anon public**

## 📝 Configuração no Código

### Arquivo: `src/integrations/supabase/client.ts`

Atualize com a nova URL e chave:

```typescript
const SUPABASE_URL = "https://zmowanlowqpioxbycead.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sua_chave_anon_aqui";
```

### Usando Variáveis de Ambiente (Recomendado)

1. Crie o arquivo `.env.local` (baseado em `.env.example`)
2. Adicione as variáveis:
   ```
   VITE_SUPABASE_URL=https://zmowanlowqpioxbycead.supabase.co
   VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
   ```
3. Atualize `client.ts` para usar variáveis:
   ```typescript
   const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
   const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

## 🔌 Testando a Conexão

### Via psql (linha de comando)

```bash
psql "postgresql://postgres:UqXAaQWafg8Guokw@db.zmowanlowqpioxbycead.supabase.co:5432/postgres"
```

### Via Supabase Dashboard

1. Acesse: https://zmowanlowqpioxbycead.supabase.co
2. Faça login
3. Vá em **SQL Editor**

### Via Código (Teste Rápido)

```typescript
import { supabase } from '@/integrations/supabase/client';

// Teste de conexão
async function testConnection() {
  const { data, error } = await supabase
    .from('transactions')
    .select('count');
  
  if (error) {
    console.error('Erro de conexão:', error);
  } else {
    console.log('Conexão OK!');
  }
}
```

## ⚠️ Segurança

- ✅ **Nunca commite** o arquivo `.env.local` no git
- ✅ Use variáveis de ambiente para credenciais
- ✅ A chave **anon** é pública, mas ainda assim deve ser protegida
- ✅ A senha do banco deve ser mantida em segredo
- ✅ Use RLS (Row Level Security) para proteger dados

## 📊 Informações do Projeto

- **Project ID**: `zmowanlowqpioxbycead`
- **Database Host**: `db.zmowanlowqpioxbycead.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`

## 🔗 Links Úteis

- [Dashboard](https://zmowanlowqpioxbycead.supabase.co)
- [SQL Editor](https://zmowanlowqpioxbycead.supabase.co/project/_/sql)
- [API Settings](https://zmowanlowqpioxbycead.supabase.co/project/_/settings/api)

