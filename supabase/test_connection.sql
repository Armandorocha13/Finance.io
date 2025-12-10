-- ============================================================================
-- Script de Teste de Conexão - Vaidoso FC
-- ============================================================================
-- 
-- Execute este script para testar a conexão com o banco de dados
-- e verificar se tudo está funcionando corretamente.
--
-- @author Vaidoso FC
-- @version 1.0.0
-- ============================================================================

-- Teste 1: Verificar conexão
SELECT 
    'Conexão estabelecida com sucesso!' as status,
    current_database() as database,
    current_user as user,
    version() as postgres_version;

-- Teste 2: Verificar se as tabelas existem
SELECT 
    'Verificando tabelas...' as info,
    COUNT(*) FILTER (WHERE table_name = 'categories') as categories_exists,
    COUNT(*) FILTER (WHERE table_name = 'transactions') as transactions_exists,
    COUNT(*) FILTER (WHERE table_name = 'artilharia') as artilharia_exists
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('categories', 'transactions', 'artilharia');

-- Teste 3: Verificar RLS
SELECT 
    'Verificando RLS...' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('categories', 'transactions', 'artilharia')
ORDER BY tablename;

-- Teste 4: Verificar policies
SELECT 
    'Verificando policies...' as info,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('categories', 'transactions', 'artilharia')
GROUP BY tablename
ORDER BY tablename;

-- Teste 5: Verificar extensões
SELECT 
    'Verificando extensões...' as info,
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE extname = 'uuid-ossp';

-- Teste 6: Teste de inserção (se autenticado)
-- Descomente e ajuste o user_id se necessário
/*
DO $$
DECLARE
    test_user_id UUID := auth.uid();
BEGIN
    IF test_user_id IS NULL THEN
        RAISE NOTICE '⚠️  Não autenticado. Teste de inserção pulado.';
    ELSE
        -- Teste de inserção em categories
        INSERT INTO public.categories (user_id, name, type, is_default)
        VALUES (test_user_id, 'TESTE CONEXÃO', 'income', false)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ Teste de inserção bem-sucedido!';
    END IF;
END $$;
*/

-- Resumo final
SELECT 
    '=== RESUMO DO TESTE ===' as summary,
    (SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'public' 
     AND table_name IN ('categories', 'transactions', 'artilharia')) as tabelas_criadas,
    (SELECT COUNT(*) FROM pg_policies 
     WHERE schemaname = 'public' 
     AND tablename IN ('categories', 'transactions', 'artilharia')) as policies_criadas,
    (SELECT COUNT(*) FROM pg_tables 
     WHERE schemaname = 'public' 
     AND tablename IN ('categories', 'transactions', 'artilharia')
     AND rowsecurity = true) as tabelas_com_rls;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

