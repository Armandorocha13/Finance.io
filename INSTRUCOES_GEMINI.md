# 🔧 Instruções para usar a API Google Gemini

## ✅ Configuração Atual

O sistema está configurado para usar a **API Google Gemini** com seu plano Pro.

### Credenciais Configuradas
- **API Key**: Configurada no servidor (`server.js`)
- **Modelo**: `gemini-2.0-flash-exp` (experimental, mais rápido)
- **Endpoint**: `https://generativelanguage.googleapis.com/v1beta`

## 🚀 Como Usar

### 1. Inicie o Servidor Backend

```bash
npm run dev:server
```

O servidor estará rodando na porta 3000 e você verá:
```
Servidor rodando na porta 3000
Endpoint Gemini disponível em: POST /api/gemini/chat
```

### 2. Inicie o Frontend

Em outro terminal:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:8080`

## 📋 Funcionalidades

### Geração de Relatórios com IA
- ✅ Análise financeira inteligente
- ✅ Recomendações personalizadas
- ✅ Insights sobre padrões de gastos
- ✅ Sugestões de economia
- ✅ Metas financeiras sugeridas

### Fallback Automático
Se a API Gemini estiver indisponível, o sistema automaticamente:
- Gera relatório local completo
- Mantém todas as funcionalidades
- Informa o usuário sobre o modo local

## 🔍 Modelos Disponíveis

Você pode alterar o modelo no arquivo `server.js`:

```javascript
const GEMINI_MODEL = 'gemini-2.0-flash-exp'; // Rápido e experimental
// ou
const GEMINI_MODEL = 'gemini-pro'; // Mais estável para produção
// ou
const GEMINI_MODEL = 'gemini-1.5-pro'; // Mais poderoso
```

## ⚙️ Parâmetros de Geração

Atualmente configurados:
- **Temperature**: 0.7 (criatividade balanceada)
- **Max Output Tokens**: 2000
- **Top P**: 0.8
- **Top K**: 40

## 🔐 Segurança

⚠️ **IMPORTANTE**: Em produção, mova a API Key para variáveis de ambiente:

1. Crie um arquivo `.env`:
```env
GEMINI_API_KEY=AIzaSyACEPLxQW-8jTVmiUK7mm5-lUMhbAPxjVU
```

2. Atualize `server.js`:
```javascript
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
```

## 📊 Monitoramento

Com o plano Pro do Gemini, você pode:
- Monitorar uso no [Google AI Studio](https://makersuite.google.com/app/apikey)
- Verificar quotas e limites
- Acompanhar custos

## 🐛 Troubleshooting

### Erro: "API key not valid"
- Verifique se a API key está correta
- Confirme que a API está habilitada no Google Cloud Console

### Erro: "Quota exceeded"
- Verifique seus limites no Google AI Studio
- Considere usar o fallback local temporariamente

### Erro: "Model not found"
- Verifique se o modelo está disponível na sua região
- Tente usar `gemini-pro` ao invés de `gemini-2.0-flash-exp`

## 📝 Estrutura da Requisição

```
Frontend → /api/gemini/chat → Backend → Google Gemini API
```

## 🎯 Próximos Passos

1. Teste a geração de relatórios
2. Ajuste os parâmetros se necessário
3. Configure variáveis de ambiente para produção
4. Monitore o uso da API

