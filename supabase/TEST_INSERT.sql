-- ============================================================================
-- Script de Teste - Verificar se Inserção Funciona
-- ============================================================================
-- 
-- Execute este script para testar se as policies estão funcionando
-- e se é possível inserir uma transação de teste.
--
-- @author Vaidoso FC
-- ============================================================================

-- Teste de inserção com UUID de desenvolvimento
INSERT INTO public.transactions (
  user_id,
  description,
  amount,
  type,
  category,
  date
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Teste de Inserção',
  100.00,
  'expense',
  'BOLA',
  CURRENT_DATE
);

-- Verifica se foi inserido
SELECT * FROM public.transactions 
WHERE user_id = '00000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC
LIMIT 5;

-- Limpa o teste (opcional)
-- DELETE FROM public.transactions 
-- WHERE description = 'Teste de Inserção' 
-- AND user_id = '00000000-0000-0000-0000-000000000001';

