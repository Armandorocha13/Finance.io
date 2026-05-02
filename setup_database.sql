-- ============================================================================
-- Finance.io - Script Completo de Criação do Banco de Dados
-- ============================================================================
-- Execute este script no SQL Editor do seu painel Supabase.
-- URL do Projeto: https://nhsegvlsevdggfbzqvvn.supabase.co
-- ============================================================================

-- ============================================================================
-- EXTENSÕES
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: users (tabela pública espelhando auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Tabela pública de usuários espelhando auth.users';

-- ============================================================================
-- TABELA: profiles
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfis de usuários cadastrados';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (referência a auth.users)';
COMMENT ON COLUMN public.profiles.full_name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL do avatar do usuário';

-- ============================================================================
-- TABELA: categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_user_category UNIQUE (user_id, name, type)
);

COMMENT ON TABLE public.categories IS 'Categorias de transações financeiras';
COMMENT ON COLUMN public.categories.type IS 'Tipo: income (receita) ou expense (despesa)';
COMMENT ON COLUMN public.categories.is_default IS 'Indica se é uma categoria padrão do sistema';

-- ============================================================================
-- TABELA: transactions
-- ============================================================================

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

COMMENT ON TABLE public.transactions IS 'Transações financeiras do usuário';
COMMENT ON COLUMN public.transactions.amount IS 'Valor da transação (sempre positivo)';
COMMENT ON COLUMN public.transactions.type IS 'Tipo: income (receita) ou expense (despesa)';

-- ============================================================================
-- TABELA: budgets (orçamentos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    period TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.budgets IS 'Orçamentos definidos pelo usuário por categoria e período';

-- ============================================================================
-- TABELA: goals (metas financeiras)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount DECIMAL(10, 2) NOT NULL,
    current_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    deadline DATE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.goals IS 'Metas financeiras do usuário';
COMMENT ON COLUMN public.goals.target_amount IS 'Valor alvo da meta';
COMMENT ON COLUMN public.goals.current_amount IS 'Valor atual acumulado';

-- ============================================================================
-- TABELA: investments (investimentos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    initial_value DECIMAL(10, 2) NOT NULL,
    current_value DECIMAL(10, 2) NOT NULL,
    start_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE public.investments IS 'Investimentos do usuário';
COMMENT ON COLUMN public.investments.type IS 'Tipo de investimento (ex: ações, renda fixa, crypto)';

-- ============================================================================
-- TABELA: artilharia (jogadores e gols do clube)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.artilharia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    gols INTEGER NOT NULL DEFAULT 0 CHECK (gols >= 0),
    posicao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_user_jogador UNIQUE (user_id, nome)
);

COMMENT ON TABLE public.artilharia IS 'Artilharia do clube - jogadores e gols';
COMMENT ON COLUMN public.artilharia.gols IS 'Quantidade de gols (não pode ser negativo)';

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

-- categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_type ON public.categories(user_id, type);

-- budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);

-- goals
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);

-- investments
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);

-- artilharia
CREATE INDEX IF NOT EXISTS idx_artilharia_user_id ON public.artilharia(user_id);
CREATE INDEX IF NOT EXISTS idx_artilharia_gols ON public.artilharia(gols DESC);
CREATE INDEX IF NOT EXISTS idx_artilharia_user_gols ON public.artilharia(user_id, gols DESC);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);

-- ============================================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função: atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_artilharia_updated_at
    BEFORE UPDATE ON public.artilharia
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Função: Cria perfil + user público + categorias padrão ao cadastrar usuário
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Cria registro na tabela pública users
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        )
    ) ON CONFLICT (id) DO NOTHING;

    -- Cria perfil na tabela profiles
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        )
    ) ON CONFLICT (id) DO NOTHING;

    -- Cria categorias padrão de receita
    INSERT INTO public.categories (user_id, name, type, is_default) VALUES
        (NEW.id, 'CARTÃO AMARELO', 'income', true),
        (NEW.id, 'CARTÃO VERMELHO', 'income', true),
        (NEW.id, 'MENSALIDADE', 'income', true)
    ON CONFLICT (user_id, name, type) DO NOTHING;

    -- Cria categorias padrão de despesa
    INSERT INTO public.categories (user_id, name, type, is_default) VALUES
        (NEW.id, 'BOLA', 'expense', true),
        (NEW.id, 'CAMPO', 'expense', true),
        (NEW.id, 'FESTAS', 'expense', true),
        (NEW.id, 'JUIZ', 'expense', true),
        (NEW.id, 'LAVAGEM DE ROUPA', 'expense', true),
        (NEW.id, 'MATERIAIS', 'expense', true),
        (NEW.id, 'PASSAGEM GOLEIRO', 'expense', true),
        (NEW.id, 'UNIFORMES', 'expense', true)
    ON CONFLICT (user_id, name, type) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove o trigger se já existir antes de recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger que executa quando um novo usuário é cadastrado
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Função auxiliar: Criar categorias para usuário existente (uso manual)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_categories_for_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado: %', target_user_id;
    END IF;

    DELETE FROM public.categories
    WHERE user_id = target_user_id AND is_default = true;

    INSERT INTO public.categories (user_id, name, type, is_default) VALUES
        (target_user_id, 'CARTÃO AMARELO', 'income', true),
        (target_user_id, 'CARTÃO VERMELHO', 'income', true),
        (target_user_id, 'MENSALIDADE', 'income', true)
    ON CONFLICT (user_id, name, type) DO NOTHING;

    INSERT INTO public.categories (user_id, name, type, is_default) VALUES
        (target_user_id, 'BOLA', 'expense', true),
        (target_user_id, 'CAMPO', 'expense', true),
        (target_user_id, 'FESTAS', 'expense', true),
        (target_user_id, 'JUIZ', 'expense', true),
        (target_user_id, 'LAVAGEM DE ROUPA', 'expense', true),
        (target_user_id, 'MATERIAIS', 'expense', true),
        (target_user_id, 'PASSAGEM GOLEIRO', 'expense', true),
        (target_user_id, 'UNIFORMES', 'expense', true)
    ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artilharia ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA (POLICIES)
-- ============================================================================

-- ---- users ----
CREATE POLICY "Users can view their own user"
    ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own user"
    ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own user"
    ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- ---- profiles ----
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ---- categories ----
CREATE POLICY "Users can view their own categories"
    ON public.categories FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
    ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON public.categories FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
    ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- ---- transactions ----
CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
    ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
    ON public.transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
    ON public.transactions FOR DELETE USING (auth.uid() = user_id);

-- ---- budgets ----
CREATE POLICY "Users can view their own budgets"
    ON public.budgets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budgets"
    ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets"
    ON public.budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets"
    ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- ---- goals ----
CREATE POLICY "Users can view their own goals"
    ON public.goals FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
    ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON public.goals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- ---- investments ----
CREATE POLICY "Users can view their own investments"
    ON public.investments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments"
    ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
    ON public.investments FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
    ON public.investments FOR DELETE USING (auth.uid() = user_id);

-- ---- artilharia ----
CREATE POLICY "Users can view their own artilharia"
    ON public.artilharia FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own artilharia"
    ON public.artilharia FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own artilharia"
    ON public.artilharia FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own artilharia"
    ON public.artilharia FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- VIEW: Perfis Públicos
-- ============================================================================

CREATE OR REPLACE VIEW public.profiles_public AS
SELECT id, full_name, avatar_url, created_at
FROM public.profiles;

COMMENT ON VIEW public.profiles_public IS 'View pública de perfis (sem informações sensíveis)';

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
    tbl TEXT;
    tables_ok BOOLEAN := true;
BEGIN
    FOREACH tbl IN ARRAY ARRAY['users','profiles','categories','transactions','budgets','goals','investments','artilharia']
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = tbl
        ) THEN
            RAISE NOTICE '❌ Tabela ausente: %', tbl;
            tables_ok := false;
        END IF;
    END LOOP;

    IF tables_ok THEN
        RAISE NOTICE '✅ Todas as tabelas foram criadas com sucesso!';
        RAISE NOTICE '✅ Banco de dados Finance.io pronto para uso.';
    END IF;
END $$;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
