# 🚨 ORDEM DE EXECUÇÃO DOS SCRIPTS

## ⚡ Execute nesta ordem:

### 1️⃣ Script Principal (se ainda não executou)
```
supabase/migrations/001_initial_schema.sql
```

### 2️⃣ Permitir Inserções sem Autenticação
```
supabase/migrations/003_allow_dev_inserts.sql
```

### 3️⃣ Remover Foreign Key Constraints (RESOLVE O ERRO ATUAL)
```
supabase/migrations/004_fix_dev_user.sql
```

## 📝 Passo a Passo

1. Acesse: https://zmowanlowqpioxbycead.supabase.co
2. Vá em **SQL Editor**
3. Execute os scripts na ordem acima
4. Teste criando uma transação

## ✅ Após Executar

As transações devem ser salvas no banco de dados!

## 🔍 Verificar

1. Crie uma transação na aplicação
2. Acesse: **Table Editor** → **transactions**
3. Você deve ver a transação salva!

---

**Execute o script 004_fix_dev_user.sql AGORA para resolver o erro de foreign key!**

