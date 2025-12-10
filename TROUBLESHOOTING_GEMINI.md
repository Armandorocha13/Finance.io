# 🔧 Troubleshooting - API Google Gemini

## ❌ Erro 429: Quota Exceeded

### Problema
Você está vendo o erro:
```
429 - You exceeded your current quota
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_*
```

### Causas Possíveis

1. **Modelo não disponível no seu plano**
   - O modelo `gemini-2.0-flash-exp` pode não estar disponível no seu plano Pro
   - Solução: Use `gemini-1.5-pro` ou `gemini-pro`

2. **API Key não vinculada ao plano Pro**
   - A API key pode estar usando o free tier
   - Solução: Verifique no Google AI Studio se a key está no plano correto

3. **Quota realmente excedida**
   - Mesmo no plano Pro há limites
   - Solução: Verifique seus limites em https://ai.dev/usage

## ✅ Soluções Implementadas

### 1. Mudança de Modelo
O sistema agora usa `gemini-1.5-pro` ao invés de `gemini-2.0-flash-exp`, que é mais estável e disponível no plano Pro.

### 2. Fallback Automático
Se o modelo principal falhar, o sistema tenta automaticamente:
- `gemini-pro` (se estava usando `gemini-1.5-pro`)
- `gemini-1.5-flash` (alternativa mais rápida)

### 3. Fallback Local
Se todos os modelos falharem, o sistema gera um relatório local completo.

## 🔍 Verificações Necessárias

### 1. Verificar API Key no Google AI Studio

1. Acesse: https://makersuite.google.com/app/apikey
2. Verifique se sua API key está ativa
3. Confirme que está no plano Pro
4. Verifique os limites de quota

### 2. Verificar Modelos Disponíveis

No Google AI Studio, verifique quais modelos estão disponíveis para sua conta:
- `gemini-pro` - Modelo padrão estável
- `gemini-1.5-pro` - Versão mais recente e poderosa
- `gemini-1.5-flash` - Versão mais rápida
- `gemini-2.0-flash-exp` - Experimental (pode não estar disponível)

### 3. Verificar Quotas

Acesse: https://ai.dev/usage?tab=rate-limit
- Verifique suas quotas atuais
- Veja quantas requisições você pode fazer
- Confirme os limites de tokens

## 🛠️ Ajustes no Código

### Alterar Modelo Manualmente

No arquivo `server.js`, linha 20, você pode alterar:

```javascript
// Opção 1: Modelo mais poderoso (recomendado para Pro)
const GEMINI_MODEL = 'gemini-1.5-pro';

// Opção 2: Modelo padrão estável
const GEMINI_MODEL = 'gemini-pro';

// Opção 3: Modelo mais rápido
const GEMINI_MODEL = 'gemini-1.5-flash';
```

### Testar API Key

Crie um arquivo de teste `test-gemini.js`:

```javascript
const API_KEY = 'AIzaSyACEPLxQW-8jTVmiUK7mm5-lUMhbAPxjVU';
const MODEL = 'gemini-1.5-pro';

async function testGemini() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Olá, você está funcionando?' }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        })
      }
    );

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Resposta:', data);
  } catch (error) {
    console.error('Erro:', error);
  }
}

testGemini();
```

Execute: `node test-gemini.js`

## 📋 Checklist de Verificação

- [ ] API Key está correta no `server.js`
- [ ] API Key está ativa no Google AI Studio
- [ ] Conta está no plano Pro
- [ ] Modelo escolhido está disponível para sua conta
- [ ] Quotas não foram excedidas
- [ ] Servidor backend está rodando (`npm run dev:server`)
- [ ] Frontend está rodando (`npm run dev`)

## 🚀 Próximos Passos

1. **Verifique sua API Key no Google AI Studio**
2. **Confirme que está no plano Pro**
3. **Teste com o modelo `gemini-1.5-pro`** (já configurado)
4. **Se ainda falhar, tente `gemini-pro`**
5. **O sistema usará fallback local automaticamente se necessário**

## 💡 Dica

Mesmo que a API falhe, o sistema continua funcionando com o relatório local, que é completo e funcional. Você sempre terá seus relatórios financeiros!

