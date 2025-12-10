-- ============================================================================
-- Script de Verificação - Vaidoso FC
-- ============================================================================
-- 
-- Este script verifica se todas as tabelas, policies e funções foram
-- criadas corretamente.
--
-- Execute este script após as migrações para validar a instalação.
--
-- @author Vaidoso FC
-- @version 1.0.0
-- ============================================================================

-- ============================================================================
-- VERIFICAÇÃO DE TABELAS
-- ============================================================================

DO $$
BEGIN
    -- Verifica se as tabelas existem
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
        RAISE EXCEPTION 'Tabela categories não encontrada!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'transactions') THEN
        RAISE EXCEPTION 'Tabela transactions não encontrada!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'artilharia') THEN
        RAISE EXCEPTION 'Tabela artilharia não encontrada!';
    END IF;
    
    RAISE NOTICE '✓ Todas as tabelas foram criadas com sucesso!';
END $$;

-- ============================================================================
-- VERIFICAÇÃO DE RLS
-- ============================================================================

DO $$
BEGIN
    -- Verifica se RLS está habilitado
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
        RAISE EXCEPTION 'RLS não está habilitado na tabela categories!';
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
        RAISE EXCEPTION 'RLS não está habilitado na tabela transactions!';
    END IF;
    
    IF NOT (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'artilharia') THEN
        RAISE EXCEPTION 'RLS não está habilitado na tabela artilharia!';
    END IF;
    
    RAISE NOTICE '✓ RLS está habilitado em todas as tabelas!';
END $$;

-- ============================================================================
-- VERIFICAÇÃO DE POLICIES
-- ============================================================================

DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Verifica policies de categories
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories';
    
    IF policy_count < 4 THEN
        RAISE EXCEPTION 'Faltam policies na tabela categories! Esperado: 4, Encontrado: %', policy_count;
    END IF;
    
    -- Verifica policies de transactions
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'transactions';
    
    IF policy_count < 4 THEN
        RAISE EXCEPTION 'Faltam policies na tabela transactions! Esperado: 4, Encontrado: %', policy_count;
    END IF;
    
    -- Verifica policies de artilharia
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'artilharia';
    
    IF policy_count < 4 THEN
        RAISE EXCEPTION 'Faltam policies na tabela artilharia! Esperado: 4, Encontrado: %', policy_count;
    END IF;
    
    RAISE NOTICE '✓ Todas as policies foram criadas corretamente!';
END $$;

-- ============================================================================
-- VERIFICAÇÃO DE ÍNDICES
-- ============================================================================

DO $$
BEGIN
    -- Verifica índices principais
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transactions_user_id') THEN
        RAISE WARNING 'Índice idx_transactions_user_id não encontrado!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_artilharia_user_id') THEN
        RAISE WARNING 'Índice idx_artilharia_user_id não encontrado!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_user_id') THEN
        RAISE WARNING 'Índice idx_categories_user_id não encontrado!';
    END IF;
    
    RAISE NOTICE '✓ Índices principais verificados!';
END $$;

-- ============================================================================
-- VERIFICAÇÃO DE FUNÇÕES
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        RAISE WARNING 'Função update_updated_at_column não encontrada!';
    ELSE
        RAISE NOTICE '✓ Função update_updated_at_column encontrada!';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_default_categories') THEN
        RAISE WARNING 'Função create_default_categories não encontrada! (Opcional)';
    ELSE
        RAISE NOTICE '✓ Função create_default_categories encontrada!';
    END IF;
END $$;

-- ============================================================================
-- RESUMO
-- ============================================================================

SELECT 
    'Verificação concluída!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('categories', 'transactions', 'artilharia')) as tabelas_criadas,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('categories', 'transactions', 'artilharia')) as policies_criadas,
    (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%') as indices_criados;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

