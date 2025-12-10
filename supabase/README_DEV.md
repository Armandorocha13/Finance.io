# ⚠️ Configuração para Desenvolvimento

## Script de Desenvolvimento

Para permitir que a aplicação salve dados no Supabase mesmo sem autenticação real, execute o script:

```sql
supabase/migrations/003_allow_dev_inserts.sql
```

### Como Executar

1. Acesse o [Supabase Dashboard](https://zmowanlowqpioxbycead.supabase.co)
2. Vá em **SQL Editor**
3. Execute o conteúdo do arquivo `003_allow_dev_inserts.sql`

### O que o Script Faz

- Remove a policy restritiva de INSERT
- Cria uma policy temporária que permite inserções sem autenticação
- **ATENÇÃO**: Isso é apenas para desenvolvimento!

### Para Produção

Quando for para produção, você DEVE:

1. Remover a policy de desenvolvimento:
```sql
DROP POLICY IF EXISTS "Allow dev inserts (TEMPORARY)" ON public.transactions;
```

2. Recriar a policy segura:
```sql
CREATE POLICY "Users can insert their own transactions"
    ON public.transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

## UUID de Desenvolvimento

A aplicação usa o UUID `00000000-0000-0000-0000-000000000001` para todas as transações de desenvolvimento quando não há usuário autenticado.

