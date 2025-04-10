# Atualizações na Política de Segurança de Conteúdo (CSP)

## Problema Identificado

Foram detectados erros 403 (Forbidden) no console do navegador relacionados a serviços de terceiros:

```
GET https://api.visitorapi.com/api/?pid=9AIcXi79egjcfAfi2q7D 403 (Forbidden)
GET https://cdn.wts.chat/static/widgets/undefined/undefined.json 403 (Forbidden)
```

Estes erros ocorriam porque os domínios `api.visitorapi.com` e `cdn.wts.chat` não estavam incluídos na Política de Segurança de Conteúdo (CSP) definida no arquivo `netlify.toml`.

## Causa do Problema

A CSP é uma camada de segurança que controla quais recursos podem ser carregados pelo navegador. No nosso caso, a CSP estava bloqueando requisições para:

1. **VisitorAPI**: Um serviço para identificação de visitantes, provavelmente adicionado via Google Tag Manager.
2. **WTS Chat**: Um widget de chat, também provavelmente adicionado via Google Tag Manager.

## Solução Aplicada

Atualizamos a CSP no arquivo `netlify.toml` para permitir conexões com estes domínios:

```diff
Content-Security-Policy = "upgrade-insecure-requests; default-src 'self'; 
- script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; 
+ script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.wts.chat; 
- connect-src 'self' https://www.google-analytics.com; 
+ connect-src 'self' https://www.google-analytics.com https://api.visitorapi.com https://cdn.wts.chat; 
img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; 
frame-src https://www.googletagmanager.com;"
```

### Alterações específicas:

1. Adicionado `https://cdn.wts.chat` à diretiva `script-src` para permitir o carregamento de scripts do widget de chat.
2. Adicionado `https://api.visitorapi.com` e `https://cdn.wts.chat` à diretiva `connect-src` para permitir conexões com estes serviços.

## Benefícios da Solução

1. **Funcionalidade Restaurada**: Os serviços de identificação de visitantes e chat agora funcionam corretamente.
2. **Segurança Mantida**: A CSP continua protegendo o site, permitindo apenas os domínios específicos necessários.
3. **Experiência do Usuário Melhorada**: Eliminação de erros no console e funcionamento correto de todos os recursos.

## Considerações para o Futuro

1. **Monitoramento de Erros**: Continuar monitorando o console para identificar possíveis bloqueios de CSP.
2. **Documentação de Serviços**: Manter uma lista atualizada de todos os serviços de terceiros utilizados no site.
3. **Revisão Periódica da CSP**: Revisar regularmente a CSP para garantir que ela seja tão restritiva quanto possível sem comprometer a funcionalidade.

## Referências

- [MDN Web Docs: Content Security Policy](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CSP)
- [Google Tag Manager e CSP](https://developers.google.com/tag-platform/tag-manager/web/csp) 