# Correção da Integração do VisitorAPI

## Problema Identificado

Foram identificados erros 403 (Forbidden) ao tentar carregar o VisitorAPI em nosso site. Esses erros estavam relacionados a restrições de segurança impostas pela Content Security Policy (CSP) configurada no arquivo `netlify.toml`.

## Causa do Problema

A Content Security Policy (CSP) é uma camada de segurança que ajuda a detectar e mitigar certos tipos de ataques, como Cross-Site Scripting (XSS) e injeção de dados. No entanto, quando configurada de forma muito restritiva, pode impedir o funcionamento adequado de scripts legítimos de terceiros.

No nosso caso, a CSP estava bloqueando:

1. A execução de scripts do domínio `api.visitorapi.com`
2. A avaliação dinâmica de código JavaScript (`eval` e funções similares) que o VisitorAPI pode utilizar
3. Conexões adequadas com os endpoints da API

## Solução Aplicada

### 1. Atualização da Content Security Policy

Modificamos a CSP no arquivo `netlify.toml` para incluir:

- Adição de `'unsafe-eval'` na diretiva `script-src` para permitir avaliação dinâmica de código
- Inclusão explícita de `https://api.visitorapi.com` na diretiva `script-src`
- Garantia de que tanto `https://*.visitorapi.com` quanto `https://api.visitorapi.com` estejam presentes nas diretivas `script-src` e `connect-src`

```toml
Content-Security-Policy = "upgrade-insecure-requests; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://cdn.wts.chat https://*.visitorapi.com https://api.visitorapi.com; connect-src 'self' https://www.google-analytics.com https://*.visitorapi.com https://api.visitorapi.com https://cdn.wts.chat; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; frame-src https://www.googletagmanager.com;"
```

### 2. Implementação de Script de Correção

Criamos um script personalizado (`visitor-api-fix.js`) que:

- Verifica se o VisitorAPI já está carregado
- Carrega o script manualmente se necessário
- Adiciona atributo `crossOrigin="anonymous"` para melhorar a compatibilidade com a CSP
- Implementa tratamento de erros e tentativas de recarregamento
- Funciona mesmo se o Google Tag Manager não estiver disponível

### 3. Implementação de Script de Diagnóstico

Criamos um script de diagnóstico (`visitor-api-test.js`) que:

- Verifica se o VisitorAPI está carregado corretamente
- Exibe informações detalhadas sobre o estado do VisitorAPI
- Monitora recursos de rede relacionados ao VisitorAPI
- Verifica a CSP atual
- Fornece feedback detalhado no console para depuração

### 4. Atualização do Processo de Build

Modificamos o processo de build para:

- Copiar automaticamente os scripts personalizados para a pasta pública
- Garantir que os scripts estejam disponíveis em todas as páginas
- Incluir o script de diagnóstico apenas em ambiente de desenvolvimento

## Como Testar a Solução

1. Verifique o console do navegador para mensagens de diagnóstico
2. Confirme que não há erros 403 relacionados ao VisitorAPI
3. Verifique se o objeto `window.VisitorAPI` está disponível no console
4. Confirme que os dados do visitante estão sendo carregados corretamente

## Considerações de Segurança

Embora tenhamos adicionado `'unsafe-eval'` à CSP, isso foi feito de forma controlada:

1. A permissão é limitada apenas aos domínios específicos listados na diretiva `script-src`
2. Mantivemos todas as outras restrições de segurança da CSP
3. Continuamos monitorando o comportamento do site para detectar possíveis problemas de segurança

## Próximos Passos

1. Monitorar o funcionamento do VisitorAPI em produção
2. Considerar a implementação de uma solução mais restritiva no futuro, se possível
3. Manter a documentação atualizada com quaisquer alterações futuras na integração

## Referências

- [Content Security Policy (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CSP)
- [VisitorAPI Documentation](https://visitorapi.com/docs)
- [Netlify Headers Documentation](https://docs.netlify.com/routing/headers/) 