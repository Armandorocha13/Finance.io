-- ============================================================================
-- Script de Seed - Categorias Padrão de Futebol
-- ============================================================================
-- 
-- Este script insere as categorias padrão de futebol para novos usuários.
-- 
-- IMPORTANTE: Este script deve ser executado APÓS a migração inicial.
-- As categorias serão criadas automaticamente quando um usuário se cadastrar
-- através de uma função trigger ou pela aplicação.
--
-- @author Vaidoso FC
-- @version 1.0.0
-- ============================================================================

-- ============================================================================
-- FUNÇÃO: Criar categorias padrão para novo usuário
-- ============================================================================

/**
 * Função que cria categorias padrão quando um novo usuário é criado
 * Esta função é chamada automaticamente via trigger
 */
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Categorias de Entradas (Receitas)
    INSERT INTO public.categories (user_id, name, type, is_default) VALUES
        (NEW.id, 'CARTÃO AMARELO', 'income', true),
        (NEW.id, 'CARTÃO VERMELHO', 'income', true),
        (NEW.id, 'MENSALIDADE', 'income', true);
    
    -- Categorias de Saídas (Despesas)
    INSERT INTO public.categories (user_id, name, type, is_default) VALUES
        (NEW.id, 'BOLA', 'expense', true),
        (NEW.id, 'CAMPO', 'expense', true),
        (NEW.id, 'FESTAS', 'expense', true),
        (NEW.id, 'JUIZ', 'expense', true),
        (NEW.id, 'LAVAGEM DE ROUPA', 'expense', true),
        (NEW.id, 'MATERIAIS', 'expense', true),
        (NEW.id, 'PASSAGEM GOLEIRO', 'expense', true),
        (NEW.id, 'UNIFORMES', 'expense', true);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Criar categorias ao criar usuário
-- ============================================================================

-- Trigger que executa a função quando um novo usuário é criado em auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_categories();

-- ============================================================================
-- FUNÇÃO ALTERNATIVA: Criar categorias manualmente para usuário existente
-- ============================================================================

/**
 * Função para criar categorias padrão para um usuário específico
 * Útil para usuários que já existem antes da criação desta função
 * 
 * @param target_user_id UUID do usuário
 */
CREATE OR REPLACE FUNCTION public.seed_categories_for_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Verifica se o usuário existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado: %', target_user_id;
    END IF;
    
    -- Remove categorias padrão existentes (se houver duplicatas)
    DELETE FROM public.categories 
    WHERE user_id = target_user_id AND is_default = true;
    
    -- Categorias de Entradas (Receitas)
    INSERT INTO public.categories (user_id, name, type, is_default) VALUES
        (target_user_id, 'CARTÃO AMARELO', 'income', true),
        (target_user_id, 'CARTÃO VERMELHO', 'income', true),
        (target_user_id, 'MENSALIDADE', 'income', true)
    ON CONFLICT (user_id, name, type) DO NOTHING;
    
    -- Categorias de Saídas (Despesas)
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
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON FUNCTION public.create_default_categories() IS 
'Cria categorias padrão de futebol quando um novo usuário é criado';

COMMENT ON FUNCTION public.seed_categories_for_user(UUID) IS 
'Cria categorias padrão para um usuário específico (útil para migração)';

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

