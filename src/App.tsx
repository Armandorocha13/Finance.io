/**
 * App.tsx
 * 
 * Componente raiz da aplicação Vaidoso FC
 * 
 * Responsabilidades:
 * - Configurar providers globais (QueryClient, Theme, Auth)
 * - Definir rotas da aplicação
 * - Configurar integrações externas (PayPal)
 * 
 * @author Vaidoso FC
 * @version 1.0.0
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ui/theme-provider";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
// import { PayPalScriptProvider } from "@paypal/react-paypal-js"; // Desabilitado - não está sendo usado

// Configuração do React Query para gerenciamento de estado do servidor
// Permite cache, refetch automático e sincronização de dados
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Configuração do PayPal para pagamentos (se necessário no futuro)
// Desabilitado por enquanto para evitar erros no console
// Para habilitar, descomente o import e o provider abaixo
// const paypalOptions = {
//   clientId: "SEU_CLIENT_ID_AQUI",
//   currency: "BRL",
//   intent: "capture",
// };

/**
 * Componente principal da aplicação
 * 
 * Estrutura de Providers (ordem importa):
 * 1. QueryClientProvider - Gerencia queries e cache
 * 2. ThemeProvider - Gerencia tema claro/escuro
 * 3. TooltipProvider - Habilita tooltips globais
 * 4. PayPalScriptProvider - Integração PayPal
 * 5. AuthProvider - Contexto de autenticação
 * 6. BrowserRouter - Roteamento da aplicação
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vaidoso-fc-theme">
      <TooltipProvider>
        {/* Toasters para notificações */}
        <Toaster />
        <Sonner />
        
        {/* PayPal desabilitado - não está sendo usado */}
        {/* <PayPalScriptProvider options={paypalOptions}> */}
          <AuthProvider>
            <BrowserRouter>
              <Routes>
                {/* Rota principal - Dashboard */}
                <Route path="/" element={<Index />} />
                
                {/* Rota de autenticação (desativada, mas mantida para compatibilidade) */}
                <Route path="/auth" element={<Auth />} />
                
                {/* Rota catch-all para páginas não encontradas */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        {/* </PayPalScriptProvider> */}
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
