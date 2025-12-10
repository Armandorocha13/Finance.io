-- ============================================================================
-- Script de Correção - Criar Usuário de Desenvolvimento
-- ============================================================================
-- 
-- Este script resolve o erro de foreign key constraint criando um usuário
-- de desenvolvimento no auth.users ou modificando a constraint.
--
-- ATENÇÃO: Este script é APENAS para desenvolvimento!
--
-- @author Vaidoso FC
-- @version 1.0.0 (DEV ONLY)
-- ============================================================================

-- ============================================================================
-- OPÇÃO 1: Criar usuário de teste no auth.users (se possível)
-- ============================================================================

-- Tenta criar um usuário de teste no auth.users
-- Nota: Isso pode não funcionar dependendo das permissões
DO $$
BEGIN
    -- Verifica se o usuário já existe
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = '00000000-0000-0000-0000-000000000001'
    ) THEN
        -- Tenta inserir o usuário (pode falhar se não tiver permissão)
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role
        ) VALUES (
            '00000000-0000-0000-0000-000000000001',
            '00000000-0000-0000-0000-000000000000',
            'dev@vaidosofc.local',
            crypt('dev_password', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Usuário de Desenvolvimento"}',
            false,
            'authenticated'
        ) ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Usuário de desenvolvimento criado com sucesso!';
    ELSE
        RAISE NOTICE 'Usuário de desenvolvimento já existe.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Não foi possível criar usuário em auth.users. Tentando alternativa...';
END $$;

-- ============================================================================
-- OPÇÃO 2: Remover as Foreign Keys (APENAS DEV)
-- ============================================================================

-- Remove as constraints de foreign key temporariamente de TODAS as tabelas
-- ATENÇÃO: Isso remove a integridade referencial - apenas para desenvolvimento!

-- Remove de transactions
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- Remove de categories
ALTER TABLE public.categories 
DROP CONSTRAINT IF EXISTS categories_user_id_fkey;

-- Remove de artilharia
ALTER TABLE public.artilharia 
DROP CONSTRAINT IF EXISTS artilharia_user_id_fkey;

-- Verifica se foram removidas
DO $$
DECLARE
    remaining_constraints INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_constraints
    FROM pg_constraint
    WHERE conrelid IN (
        'public.transactions'::regclass,
        'public.categories'::regclass,
        'public.artilharia'::regclass
    )
    AND conname LIKE '%user_id_fkey';
    
    IF remaining_constraints = 0 THEN
        RAISE NOTICE '✅ Todas as constraints de foreign key foram removidas com sucesso!';
    ELSE
        RAISE NOTICE '⚠️  Ainda existem % constraints. Verifique manualmente.', remaining_constraints;
    END IF;
END $$;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verifica se a constraint foi removida/modificada
SELECT 
    conname as constraint_name,
    contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'public.transactions'::regclass
AND conname LIKE '%user_id%';

-- ============================================================================
-- NOTA IMPORTANTE
-- ============================================================================
-- 
-- Para PRODUÇÃO, você DEVE:
-- 1. Recriar a constraint de foreign key:
--    ALTER TABLE public.transactions
--    ADD CONSTRAINT transactions_user_id_fkey 
--    FOREIGN KEY (user_id) 
--    REFERENCES auth.users(id) 
--    ON DELETE CASCADE;
--
-- 2. Garantir que todos os user_ids sejam UUIDs válidos de auth.users
--
-- ============================================================================

