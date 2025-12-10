# 🚨 ORDEM DE EXECUÇÃO DOS SCRIPTS

## ⚡ Execute nesta ordem:

### 1️⃣ Script Principal (se ainda não executou)
```
supabase/migrations/001_initial_schema.sql
```

### 2️⃣ Seed de Categorias (opcional, mas recomendado)
```
supabase/migrations/002_seed_categories.sql
```

### 3️⃣ Permitir Inserções sem Autenticação (APENAS DEV)
```
supabase/migrations/003_allow_dev_inserts.sql
```

### 4️⃣ Remover Foreign Key Constraints (APENAS DEV)
```
supabase/migrations/004_fix_dev_user.sql
```

### 5️⃣ Criar Tabela de Perfis de Usuário (NOVO!)
```
supabase/migrations/005_create_user_profiles.sql
```

## 📝 Passo a Passo

1. Acesse: https://zmowanlowqpioxbycead.supabase.co
2. Vá em **SQL Editor**
3. Execute os scripts na ordem acima
4. Teste criando uma conta e uma transação

## ✅ Após Executar

- ✅ Tabela de perfis criada
- ✅ Trigger automático para criar perfil ao cadastrar usuário
- ✅ RLS configurado para segurança
- ✅ As transações devem ser salvas no banco de dados!

## 🔍 Verificar

1. Crie uma conta na aplicação
2. Acesse: **Table Editor** → **profiles**
3. Você deve ver o perfil criado automaticamente!
4. Crie uma transação na aplicação
5. Acesse: **Table Editor** → **transactions**
6. Você deve ver a transação salva!

---

**Execute o script 005_create_user_profiles.sql para criar a tabela de usuários!**

