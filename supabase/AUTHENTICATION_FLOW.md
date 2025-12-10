# 🔐 Fluxo de Autenticação e Armazenamento de Usuários

## 📋 Visão Geral

Quando um usuário se cadastra no site, os dados são armazenados em duas tabelas:

1. **`auth.users`** (Supabase Auth) - Dados de autenticação
2. **`public.profiles`** - Informações adicionais do perfil

## 🔄 Fluxo Completo

### 1. Cadastro de Usuário

```
Usuário preenche formulário
    ↓
AuthContext.signUp() é chamado
    ↓
supabase.auth.signUp() cria usuário em auth.users
    ↓
Trigger on_auth_user_created executa automaticamente
    ↓
Perfil é criado em public.profiles
    ↓
useProfile carrega o perfil do banco
    ↓
Header exibe informações do perfil
```

### 2. Login de Usuário

```
Usuário faz login
    ↓
AuthContext.signIn() é chamado
    ↓
supabase.auth.signInWithPassword() autentica
    ↓
useProfile carrega o perfil do banco
    ↓
Header exibe informações do perfil
```

## 🗄️ Estrutura de Dados

### auth.users (gerenciado pelo Supabase)

```typescript
{
  id: string;              // UUID único
  email: string;            // Email do usuário
  user_metadata: {
    full_name?: string;     // Nome completo
    name?: string;          // Nome alternativo
  };
  created_at: string;       // Data de criação
  // ... outros campos do Supabase
}
```

### public.profiles (nossa tabela)

```sql
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## 🔧 Componentes Envolvidos

### 1. AuthContext (`src/contexts/AuthContext.tsx`)

- Gerencia autenticação com Supabase
- Funções: `signUp()`, `signIn()`, `signOut()`
- Monitora mudanças de sessão
- Garante criação de perfil após cadastro

### 2. useProfile Hook (`src/hooks/useProfile.ts`)

- Carrega perfil do banco de dados
- Atualiza informações do perfil
- Sincroniza com `auth.users`

### 3. Header (`src/components/ui/header-2.tsx`)

- Exibe informações do usuário
- Usa `useProfile` para mostrar nome completo
- Botão de logout

## 🎯 Como Funciona

### Cadastro Automático de Perfil

O trigger `on_auth_user_created` cria automaticamente um perfil quando um usuário é cadastrado:

```sql
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

A função `handle_new_user()`:
1. Extrai o nome de `user_metadata.full_name` ou `user_metadata.name`
2. Se não houver, usa a parte do email antes do `@`
3. Cria o perfil na tabela `profiles`

### Carregamento de Perfil

O hook `useProfile`:
1. Verifica se há usuário autenticado
2. Busca o perfil na tabela `profiles`
3. Se não encontrar, cria um novo perfil (backup)
4. Atualiza o estado local

## 🔒 Segurança (RLS)

As políticas RLS garantem que:
- Usuários só veem seus próprios perfis
- Usuários só atualizam seus próprios perfis
- Usuários só inserem seus próprios perfis

```sql
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);
```

## 📝 Exemplo de Uso

### No Componente

```typescript
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

function MyComponent() {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();

  return (
    <div>
      <p>Nome: {profile?.full_name || user?.email}</p>
      <button onClick={() => updateProfile({ full_name: 'Novo Nome' })}>
        Atualizar Nome
      </button>
    </div>
  );
}
```

## ✅ Verificação

Para verificar se está funcionando:

1. **Cadastre um usuário** na aplicação
2. **Acesse o Supabase Dashboard**:
   - Vá em **Authentication** → **Users** → Verifique se o usuário foi criado
   - Vá em **Table Editor** → **profiles** → Verifique se o perfil foi criado
3. **Verifique no Header**:
   - O nome do usuário deve aparecer no dropdown
   - Deve usar o `full_name` do perfil se disponível

## 🐛 Troubleshooting

### Perfil não é criado automaticamente

1. Verifique se o trigger existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. Verifique se a função existe:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. Crie manualmente se necessário:
   ```sql
   INSERT INTO public.profiles (id, full_name)
   VALUES (auth.uid(), 'Nome do Usuário');
   ```

### Perfil não aparece no Header

1. Verifique se `useProfile` está sendo chamado
2. Verifique se há erros no console
3. Verifique se o RLS está permitindo a leitura

## 📚 Referências

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Triggers](https://supabase.com/docs/guides/database/triggers)

