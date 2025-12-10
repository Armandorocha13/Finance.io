# Scripts de Banco de Dados - Supabase

## 📋 Estrutura

Este diretório contém os scripts SQL para configuração do banco de dados Supabase.

## 🗂️ Arquivos

- `migrations/001_initial_schema.sql` - Script principal de criação do schema

## 🚀 Como Usar

### Opção 1: Via Supabase Dashboard (Recomendado)

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `migrations/001_initial_schema.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter`

### Opção 2: Via Supabase CLI

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Vincular ao projeto
supabase link --project-ref seu-project-ref

# Aplicar migração
supabase db push
```

### Opção 3: Via psql

```bash
psql -h db.oooxngcquideicyrqmvo.supabase.co -U postgres -d postgres -f migrations/001_initial_schema.sql
```

## 📊 Tabelas Criadas

### 1. `categories`
Armazena categorias de transações financeiras.

**Campos:**
- `id` (UUID) - ID único
- `user_id` (UUID) - Referência ao usuário
- `name` (TEXT) - Nome da categoria
- `type` (TEXT) - 'income' ou 'expense'
- `is_default` (BOOLEAN) - Se é categoria padrão
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. `transactions`
Armazena transações financeiras.

**Campos:**
- `id` (UUID) - ID único
- `user_id` (UUID) - Referência ao usuário
- `description` (TEXT) - Descrição
- `amount` (DECIMAL) - Valor (sempre positivo)
- `type` (TEXT) - 'income' ou 'expense'
- `category` (TEXT) - Categoria
- `date` (DATE) - Data da transação
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 3. `artilharia`
Armazena jogadores e gols.

**Campos:**
- `id` (UUID) - ID único
- `user_id` (UUID) - Referência ao usuário
- `nome` (TEXT) - Nome do jogador
- `gols` (INTEGER) - Quantidade de gols (>= 0)
- `posicao` (TEXT) - Posição do jogador (opcional)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔒 Segurança

### Row Level Security (RLS)
Todas as tabelas têm RLS habilitado, garantindo que:
- Usuários só veem seus próprios dados
- Usuários só podem inserir dados para si mesmos
- Usuários só podem atualizar seus próprios dados
- Usuários só podem deletar seus próprios dados

### Policies
Cada tabela tem 4 policies:
1. **SELECT** - Visualizar apenas dados próprios
2. **INSERT** - Inserir apenas com user_id correto
3. **UPDATE** - Atualizar apenas dados próprios
4. **DELETE** - Deletar apenas dados próprios

## 📈 Índices

Índices criados para otimizar consultas:
- `transactions`: user_id, date, type, category, (user_id, date)
- `categories`: user_id, type, (user_id, type)
- `artilharia`: user_id, gols, (user_id, gols)

## 🔄 Triggers

Triggers automáticos para:
- Atualizar `updated_at` quando um registro é modificado

## ⚠️ Importante

- **Backup**: Sempre faça backup antes de executar scripts em produção
- **Teste**: Teste primeiro em ambiente de desenvolvimento
- **Autenticação**: Certifique-se de que a autenticação do Supabase está configurada
- **RLS**: As policies garantem segurança, mas verifique se estão funcionando corretamente

## 🔧 Troubleshooting

### Erro: "permission denied"
- Verifique se está usando a conta correta
- Verifique se o RLS está habilitado

### Erro: "relation already exists"
- As tabelas já existem, você pode usar `DROP TABLE IF EXISTS` antes (cuidado!)

### Erro: "foreign key constraint"
- Certifique-se de que `auth.users` existe
- Verifique se os user_ids são válidos

## 📝 Próximos Passos

Após executar o script:
1. Verifique se todas as tabelas foram criadas
2. Teste as policies de segurança
3. Atualize os tipos TypeScript do Supabase
4. Configure a aplicação para usar o Supabase

