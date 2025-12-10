-- ============================================================================
-- Script de Migração do Banco de Dados - Vaidoso FC
-- ============================================================================
-- 
-- Este script cria todas as tabelas, relacionamentos e políticas de segurança
-- necessárias para o funcionamento da aplicação Vaidoso FC.
--
-- Tabelas criadas:
-- 1. transactions - Transações financeiras (Entradas e Saidas)
-- 2. categories - Categorias de transações
-- 3. artilharia - Jogadores e gols (artilharia do clube)
--
-- Segurança:
-- - Row Level Security (RLS) habilitado em todas as tabelas
-- - Policies para garantir que usuários só acessem seus próprios dados
--
-- @author Vaidoso FC
-- @version 1.0.0
-- ============================================================================

-- ============================================================================
-- EXTENSÕES
-- ============================================================================

-- Habilita UUID v4 para geração de IDs únicos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabela: categories
-- Descrição: Armazena categorias de transações (Entradas e Saidas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Evita categorias duplicadas para o mesmo usuário
    CONSTRAINT unique_user_category UNIQUE (user_id, name, type)
);

-- Comentários na tabela
COMMENT ON TABLE public.categories IS 'Categorias de transações financeiras';
COMMENT ON COLUMN public.categories.id IS 'ID único da categoria';
COMMENT ON COLUMN public.categories.user_id IS 'ID do usuário proprietário';
COMMENT ON COLUMN public.categories.name IS 'Nome da categoria';
COMMENT ON COLUMN public.categories.type IS 'Tipo: income (receita) ou expense (despesa)';
COMMENT ON COLUMN public.categories.is_default IS 'Indica se é uma categoria padrão do sistema';

-- ----------------------------------------------------------------------------
-- Tabela: transactions
-- Descrição: Armazena transações financeiras (Entradas e Saidas)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários na tabela
COMMENT ON TABLE public.transactions IS 'Transações financeiras do clube';
COMMENT ON COLUMN public.transactions.id IS 'ID único da transação';
COMMENT ON COLUMN public.transactions.user_id IS 'ID do usuário proprietário';
COMMENT ON COLUMN public.transactions.description IS 'Descrição da transação';
COMMENT ON COLUMN public.transactions.amount IS 'Valor da transação (sempre positivo)';
COMMENT ON COLUMN public.transactions.type IS 'Tipo: income (receita) ou expense (despesa)';
COMMENT ON COLUMN public.transactions.category IS 'Categoria da transação';
COMMENT ON COLUMN public.transactions.date IS 'Data da transação';

-- ----------------------------------------------------------------------------
-- Tabela: artilharia
-- Descrição: Armazena jogadores e seus gols (artilharia do clube)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.artilharia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    gols INTEGER NOT NULL DEFAULT 0 CHECK (gols >= 0),
    posicao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: Evita jogadores duplicados para o mesmo usuário
    CONSTRAINT unique_user_jogador UNIQUE (user_id, nome)
);

-- Comentários na tabela
COMMENT ON TABLE public.artilharia IS 'Artilharia do clube - jogadores e gols';
COMMENT ON COLUMN public.artilharia.id IS 'ID único do jogador';
COMMENT ON COLUMN public.artilharia.user_id IS 'ID do usuário proprietário';
COMMENT ON COLUMN public.artilharia.nome IS 'Nome completo do jogador';
COMMENT ON COLUMN public.artilharia.gols IS 'Quantidade de gols marcados (não pode ser negativo)';
COMMENT ON COLUMN public.artilharia.posicao IS 'Posição do jogador (opcional)';

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Índices para melhorar performance de consultas

-- Índices para transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

-- Índices para categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON public.categories(user_id, type);

-- Índices para artilharia
CREATE INDEX IF NOT EXISTS idx_artilharia_user_id ON public.artilharia(user_id);
CREATE INDEX IF NOT EXISTS idx_artilharia_gols ON public.artilharia(gols DESC);
CREATE INDEX IF NOT EXISTS idx_artilharia_user_gols ON public.artilharia(user_id, gols DESC);

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Função: update_updated_at_column
-- Descrição: Atualiza automaticamente o campo updated_at quando um registro é modificado
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artilharia_updated_at
    BEFORE UPDATE ON public.artilharia
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artilharia ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA (POLICIES)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- POLICIES: categories
-- ----------------------------------------------------------------------------

-- Policy: Usuários podem ver apenas suas próprias categorias
CREATE POLICY "Users can view their own categories"
    ON public.categories
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir suas próprias categorias
CREATE POLICY "Users can insert their own categories"
    ON public.categories
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar suas próprias categorias
CREATE POLICY "Users can update their own categories"
    ON public.categories
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas próprias categorias
CREATE POLICY "Users can delete their own categories"
    ON public.categories
    FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- POLICIES: transactions
-- ----------------------------------------------------------------------------

-- Policy: Usuários podem ver apenas suas próprias transações
CREATE POLICY "Users can view their own transactions"
    ON public.transactions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir suas próprias transações
CREATE POLICY "Users can insert their own transactions"
    ON public.transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar suas próprias transações
CREATE POLICY "Users can update their own transactions"
    ON public.transactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas próprias transações
CREATE POLICY "Users can delete their own transactions"
    ON public.transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- POLICIES: artilharia
-- ----------------------------------------------------------------------------

-- Policy: Usuários podem ver apenas seus próprios jogadores
CREATE POLICY "Users can view their own artilharia"
    ON public.artilharia
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir seus próprios jogadores
CREATE POLICY "Users can insert their own artilharia"
    ON public.artilharia
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem atualizar seus próprios jogadores
CREATE POLICY "Users can update their own artilharia"
    ON public.artilharia
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios jogadores
CREATE POLICY "Users can delete their own artilharia"
    ON public.artilharia
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- DADOS INICIAIS (SEED)
-- ============================================================================

-- Nota: Os dados iniciais serão inseridos pela aplicação quando necessário
-- As categorias padrão de futebol serão criadas pelo CategoryManager

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

