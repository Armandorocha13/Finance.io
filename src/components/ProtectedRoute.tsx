/**
 * ProtectedRoute.tsx
 * 
 * Componente de rota protegida
 * 
 * NOTA: Autenticação está desativada.
 * Este componente sempre renderiza os children sem verificação.
 * 
 * Quando autenticação for reativada, este componente deve:
 * - Verificar se usuário está autenticado
 * - Redirecionar para /auth se não estiver
 * - Exibir loading durante verificação
 * 
 * @author Vaidoso FC
 * @version 1.0.0
 */

import React from 'react';

/**
 * Props do componente ProtectedRoute
 */
interface ProtectedRouteProps {
  children: React.ReactNode; // Componentes filhos a serem renderizados
}

/**
 * Componente de rota protegida
 * 
 * Atualmente sempre renderiza os children pois autenticação está desativada.
 * 
 * @param {ProtectedRouteProps} props - Props do componente
 * @returns {JSX.Element} Children renderizados
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // TODO: Implementar verificação de autenticação quando reativada
  // Autenticação desativada - sempre renderiza os children
  return <>{children}</>;
};

export default ProtectedRoute;
