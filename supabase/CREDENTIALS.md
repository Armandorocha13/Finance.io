# 🔐 Credenciais do Projeto Supabase

## 📋 Informações de Conexão

### URL do Projeto
```
https://zmowanlowqpioxbycead.supabase.co
```

### String de Conexão PostgreSQL
```
postgresql://postgres:UqXAaQWafg8Guokw@db.zmowanlowqpioxbycead.supabase.co:5432/postgres
```

### Detalhes da Conexão
- **Host**: `db.zmowanlowqpioxbycead.supabase.co`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `UqXAaQWafg8Guokw`
- **Project ID**: `zmowanlowqpioxbycead`

## 🔑 Chave Pública (anon key)

**Como obter:**
1. Acesse: https://zmowanlowqpioxbycead.supabase.co
2. Vá em **Settings** → **API**
3. Copie a chave **anon public**

**Onde usar:**
- `src/integrations/supabase/client.ts` → `SUPABASE_PUBLISHABLE_KEY`
- Variável de ambiente: `VITE_SUPABASE_ANON_KEY`

## 📝 Arquivos Atualizados

✅ `supabase/config.toml` - Project ID atualizado
✅ `.env.example` - Template com novas credenciais
✅ Scripts de conexão criados

## 🔄 Próximos Passos

1. **Atualizar cliente Supabase:**
   - Edite `src/integrations/supabase/client.ts`
   - Atualize URL e chave anon
   - Veja: `UPDATE_CLIENT.md`

2. **Executar migrações:**
   - Execute `migrations/001_initial_schema.sql`
   - Execute `migrations/002_seed_categories.sql` (opcional)
   - Execute `verify_setup.sql` para verificar

3. **Testar conexão:**
   - Execute `test_connection.sql`
   - Ou use os scripts: `connect.sh` / `connect.ps1`

## 🔗 Links Rápidos

- [Dashboard](https://zmowanlowqpioxbycead.supabase.co)
- [SQL Editor](https://zmowanlowqpioxbycead.supabase.co/project/_/sql)
- [API Settings](https://zmowanlowqpioxbycead.supabase.co/project/_/settings/api)
- [Database Settings](https://zmowanlowqpioxbycead.supabase.co/project/_/settings/database)

## ⚠️ Segurança

- ✅ **Nunca commite** credenciais no git
- ✅ Use variáveis de ambiente para produção
- ✅ Mantenha a senha do banco em segredo
- ✅ Use RLS (Row Level Security) para proteger dados

## 📚 Documentação

- `QUICK_SETUP.md` - Setup rápido (5 minutos)
- `INSTALLATION.md` - Instalação completa
- `CONNECTION_INFO.md` - Detalhes de conexão
- `UPDATE_CLIENT.md` - Como atualizar o cliente

---

**Última atualização**: Dezembro 2024  
**Projeto**: Vaidoso FC

