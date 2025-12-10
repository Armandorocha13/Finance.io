-- ============================================================================
-- Script de Migração - Tabela de Perfis de Usuário
-- ============================================================================
-- 
-- Este script cria a tabela public.profiles para armazenar informações
-- adicionais dos usuários cadastrados, relacionada com auth.users do Supabase.
--
-- Estrutura:
-- - Relacionamento 1:1 com auth.users
-- - Armazena informações de perfil (nome, avatar, configurações)
-- - Triggers automáticos para criar perfil ao cadastrar usuário
-- - RLS (Row Level Security) para segurança
--
-- @author Vaidoso FC
-- @version 1.0.0
-- ============================================================================

-- ============================================================================
-- EXTENSÕES NECESSÁRIAS
-- ============================================================================

-- Habilita extensão UUID (já deve estar habilitada, mas garantimos)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: profiles
-- ============================================================================

-- Cria a tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários na tabela
COMMENT ON TABLE public.profiles IS 'Perfis de usuários cadastrados';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (referência a auth.users)';
COMMENT ON COLUMN public.profiles.full_name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL do avatar do usuário';
COMMENT ON COLUMN public.profiles.created_at IS 'Data de criação do perfil';
COMMENT ON COLUMN public.profiles.updated_at IS 'Data da última atualização';

-- ============================================================================
-- ÍNDICES
-- ============================================================================

-- Índice para melhorar performance de consultas por nome
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON public.profiles(full_name);

-- ============================================================================
-- FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================================================

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove o trigger se já existir antes de criar
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;

-- Trigger para atualizar updated_at na tabela profiles
CREATE TRIGGER set_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- FUNÇÃO: Criar perfil automaticamente ao cadastrar usuário
-- ============================================================================

-- Função que cria um perfil automaticamente quando um usuário é criado em auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1) -- Usa parte do email como fallback
        )
    )
    ON CONFLICT (id) DO NOTHING; -- Evita erro se perfil já existir
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove o trigger se já existir antes de criar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger que executa a função quando um novo usuário é criado
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilita RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remove policies existentes antes de criar (evita erro se já existirem)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Policy: Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Usuários podem inserir seu próprio perfil (backup caso trigger falhe)
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================================================
-- VIEW: Perfis públicos (apenas informações básicas)
-- ============================================================================

-- View para consultar perfis públicos (sem informações sensíveis)
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT
    id,
    full_name,
    avatar_url,
    created_at
FROM public.profiles;

-- Comentário na view
COMMENT ON VIEW public.profiles_public IS 'View pública de perfis (sem informações sensíveis)';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verifica se a tabela foi criada corretamente
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) THEN
        RAISE NOTICE '✅ Tabela profiles criada com sucesso!';
    ELSE
        RAISE EXCEPTION '❌ Erro ao criar tabela profiles';
    END IF;
END $$;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
-- 
-- 1. A tabela profiles está relacionada com auth.users através de uma
--    foreign key que usa CASCADE DELETE, então quando um usuário é deletado
--    do auth.users, seu perfil também é deletado automaticamente.
--
-- 2. O trigger on_auth_user_created cria automaticamente um perfil quando
--    um novo usuário se cadastra, usando o nome do user_metadata ou email.
--
-- 3. As policies RLS garantem que usuários só podem ver e editar seus
--    próprios perfis.
--
-- 4. Para atualizar o perfil de um usuário, use:
--    UPDATE public.profiles 
--    SET full_name = 'Novo Nome', avatar_url = 'https://...'
--    WHERE id = auth.uid();
--
-- ============================================================================

