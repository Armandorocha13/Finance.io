# Documentação do Projeto - Vaidoso FC (Finance.io)

## Visão Geral
O Vaidoso FC é uma aplicação web focada na gestão financeira e controle de artilharia de um clube de futebol amador. O sistema permite o gerenciamento de contas, fluxo de caixa (entradas e saídas), relatórios financeiros gerenciais (mensais/anuais) e acompanhamento do ranking de jogadores.

## Tecnologias Utilizadas
- **Frontend**: React (Vite), TypeScript, TailwindCSS, Shadcn UI
- **Backend/Database**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Testes**: Vitest, React Testing Library, Playwright (E2E)
- **Geração de PDF**: jsPDF

## Estrutura do Projeto
- `/src/components/`: Componentes visuais do React (Dashboard, formulários, gráficos).
- `/src/pages/`: Telas principais da aplicação (Auth, Index).
- `/src/hooks/`: Custom hooks para abstração de lógica de negócios (useTransactions, useArtilharia).
- `/src/contexts/`: Contextos globais (AuthContext para autenticação).
- `/src/lib/`: Utilitários e configurações (cliente Supabase).
- `/src/__mocks__/`: Mocks de dados padronizados utilizados para os testes unitários.
- `/e2e/`: Testes End-to-End simulando comportamento de usuário via Playwright.

## Fluxos Principais
1. **Autenticação**: Suporte a Login via e-mail/senha e Magic Link (Supabase Auth).
2. **Dashboard Financeiro**: Visualização geral de saldo, despesas e receitas.
3. **Gestão de Transações**: Criação, edição e exclusão de transações categorizadas.
4. **Relatório Gerencial**: Geração de resumos em PDF do fluxo de caixa e artilharia por mês.
5. **Artilharia**: Gerenciamento do plantel de jogadores e contagem de gols.

## Padrões de Código (Clean Code)
O projeto está em processo de refatoração para seguir as diretrizes:
- Modularização de componentes complexos.
- Nomeação clara (CamelCase para funções e métodos).
- Separação de responsabilidades (UI isolada de regras de negócio via Hooks/Contextos).
- Testes automatizados robustos sem dependência direta do banco de dados (via mocks).
