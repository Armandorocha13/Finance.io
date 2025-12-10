# 📋 Guia da Tabela de Perfis de Usuário

## 📖 Visão Geral

A tabela `public.profiles` armazena informações adicionais dos usuários cadastrados, complementando os dados básicos do `auth.users` do Supabase.

## 🗂️ Estrutura da Tabela

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Campos

- **id**: UUID que referencia `auth.users(id)` - chave primária
- **full_name**: Nome completo do usuário
- **avatar_url**: URL do avatar/foto do usuário
- **created_at**: Data de criação do perfil
- **updated_at**: Data da última atualização (atualizado automaticamente)

## 🔄 Funcionalidades Automáticas

### 1. Criação Automática de Perfil

Quando um usuário se cadastra, um trigger cria automaticamente um perfil:

```sql
-- Trigger executado automaticamente após INSERT em auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

O perfil é criado com:
- `id`: ID do usuário do `auth.users`
- `full_name`: Extraído de `user_metadata.full_name` ou `user_metadata.name`, ou parte do email como fallback

### 2. Atualização Automática de `updated_at`

O campo `updated_at` é atualizado automaticamente quando o perfil é modificado:

```sql
-- Trigger executado antes de UPDATE em profiles
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

## 🔒 Segurança (RLS)

Row Level Security (RLS) está habilitado com as seguintes políticas:

### Políticas

1. **SELECT**: Usuários podem ver apenas seu próprio perfil
2. **UPDATE**: Usuários podem atualizar apenas seu próprio perfil
3. **INSERT**: Usuários podem inserir apenas seu próprio perfil (backup caso trigger falhe)

```sql
-- Exemplo de política
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);
```

## 📊 Como Usar

### Consultar Perfil do Usuário Atual

```typescript
// No frontend (React)
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

### Atualizar Perfil

```typescript
// Atualizar nome completo
const { data, error } = await supabase
  .from('profiles')
  .update({ full_name: 'Novo Nome' })
  .eq('id', user.id)
  .select();

// Atualizar avatar
const { data, error } = await supabase
  .from('profiles')
  .update({ avatar_url: 'https://exemplo.com/avatar.jpg' })
  .eq('id', user.id)
  .select();
```

### Consultar Perfil via SQL

```sql
-- Ver perfil do usuário atual
SELECT * FROM public.profiles WHERE id = auth.uid();

-- Atualizar perfil
UPDATE public.profiles 
SET full_name = 'Novo Nome', avatar_url = 'https://...'
WHERE id = auth.uid();
```

## 🔗 Relacionamentos

### Com `auth.users`

- **Relacionamento**: 1:1 (um usuário = um perfil)
- **Foreign Key**: `profiles.id` → `auth.users.id`
- **CASCADE DELETE**: Quando um usuário é deletado, seu perfil também é deletado

### Com Outras Tabelas

A tabela `profiles` pode ser usada em JOINs com outras tabelas:

```sql
-- Exemplo: Transações com informações do perfil
SELECT 
    t.*,
    p.full_name,
    p.avatar_url
FROM transactions t
JOIN profiles p ON t.user_id = p.id
WHERE t.user_id = auth.uid();
```

## 📝 View Pública

Uma view `profiles_public` está disponível para consultas públicas (sem informações sensíveis):

```sql
-- View pública
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT
    id,
    full_name,
    avatar_url,
    created_at
FROM public.profiles;
```

## ⚠️ Notas Importantes

1. **Criação Automática**: O perfil é criado automaticamente ao cadastrar um usuário. Não é necessário criar manualmente.

2. **CASCADE DELETE**: Se um usuário for deletado do `auth.users`, seu perfil será deletado automaticamente.

3. **RLS**: As políticas RLS garantem que usuários só acessem seus próprios perfis. Para permitir acesso público, você precisaria criar políticas adicionais.

4. **Atualização de `updated_at`**: O campo `updated_at` é atualizado automaticamente. Não é necessário atualizá-lo manualmente.

## 🧪 Testando

### 1. Criar um Usuário

1. Cadastre um usuário na aplicação
2. Verifique se o perfil foi criado automaticamente:

```sql
SELECT * FROM public.profiles;
```

### 2. Atualizar Perfil

```sql
UPDATE public.profiles 
SET full_name = 'Nome de Teste'
WHERE id = (SELECT id FROM auth.users LIMIT 1);
```

### 3. Verificar RLS

Tente acessar um perfil de outro usuário (deve falhar):

```sql
-- Isso deve retornar erro se não for seu próprio perfil
SELECT * FROM public.profiles WHERE id != auth.uid();
```

## 📚 Referências

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Triggers](https://supabase.com/docs/guides/database/triggers)

