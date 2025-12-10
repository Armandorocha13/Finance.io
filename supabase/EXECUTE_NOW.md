# 🚨 EXECUTE AGORA - Permitir Salvamento no Banco

## ⚡ Passo a Passo Rápido

### 1. Acesse o Supabase Dashboard
👉 https://zmowanlowqpioxbycead.supabase.co

### 2. Vá em SQL Editor
- Menu lateral → **SQL Editor**
- Clique em **New Query**

### 3. Execute o Script
Copie e cole o conteúdo do arquivo:
```
supabase/migrations/003_allow_dev_inserts.sql
```

### 4. Clique em RUN
Ou pressione `Ctrl+Enter`

### 5. Verifique
Você deve ver: "Success. No rows returned"

## ✅ Pronto!

Agora as transações serão salvas no banco de dados Supabase!

## 🔍 Como Verificar

1. Crie uma transação na aplicação
2. Acesse: https://zmowanlowqpioxbycead.supabase.co/project/_/editor
3. Vá em **Table Editor** → **transactions**
4. Você deve ver a transação salva!

## ⚠️ Importante

Este script é **APENAS para desenvolvimento**.
Para produção, você precisará:
- Remover as policies temporárias
- Implementar autenticação real
- Recriar as policies seguras

---

**Execute o script agora e teste criando uma transação!**

