/**
 * ProtectedRoute.tsx
 * 
 * Componente de rota protegida
 * 
 * Protege rotas que requerem autenticação:
 * - Verifica se usuário está autenticado
 * - Redireciona para /auth se não estiver
 * - Exibe loading durante verificação
 * 
 * @author Vaidoso FC
 * @version 2.0.0
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Props do componente ProtectedRoute
 */
interface ProtectedRouteProps {
  children: React.ReactNode; // Componentes filhos a serem renderizados
}

/**
 * Componente de rota protegida
 * 
 * Verifica autenticação e redireciona para /auth se necessário.
 * 
 * @param {ProtectedRouteProps} props - Props do componente
 * @returns {JSX.Element} Children renderizados ou null (durante loading)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se não está carregando e não há usuário, redireciona para login
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Exibe loading durante verificação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não há usuário, não renderiza nada (será redirecionado)
  if (!user) {
    return null;
  }

  // Usuário autenticado - renderiza children
  return <>{children}</>;
};

export default ProtectedRoute;
