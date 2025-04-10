# Implementação do Google Tag Manager

Este documento descreve como o Google Tag Manager (GTM) foi implementado neste projeto Astro e como gerenciá-lo.

## Estrutura da Implementação

O GTM foi implementado através de um componente Astro dedicado (`GoogleTagManager.astro`) que pode ser usado em dois modos:

1. **Modo Script** (para o `<head>` do documento)
2. **Modo NoScript** (para o início do `<body>`)

### Arquivos Modificados

- `src/components/GoogleTagManager.astro` - Componente reutilizável para o GTM
- `src/layouts/Layout.astro` - Layout principal com GTM implementado
- `src/layouts/MainLayout.astro` - Layout alternativo com GTM implementado
- `netlify.toml` - Configuração de CSP (Content Security Policy) atualizada para permitir o GTM

## Como Usar

O componente `GoogleTagManager.astro` foi projetado para ser flexível e reutilizável:

```astro
<!-- No <head> do documento -->
<GoogleTagManager />

<!-- No início do <body> -->
<GoogleTagManager noscript={true} />
```

### Parâmetros do Componente

- `id` (opcional): O ID do contêiner GTM. Padrão: "GTM-NGT69XDV"
- `noscript` (opcional): Define se o componente deve renderizar a versão noscript. Padrão: false

## Configuração do Content Security Policy (CSP)

Para permitir que o GTM funcione corretamente, a política de segurança de conteúdo (CSP) foi atualizada no arquivo `netlify.toml`:

```toml
Content-Security-Policy = "upgrade-insecure-requests; default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; connect-src 'self' https://www.google-analytics.com; img-src 'self' data: https://www.google-analytics.com https://www.googletagmanager.com; frame-src https://www.googletagmanager.com;"
```

Esta configuração permite:
- Scripts do domínio googletagmanager.com
- Conexões com google-analytics.com
- Imagens de google-analytics.com e googletagmanager.com
- Frames de googletagmanager.com

## Gerenciamento do GTM

### Acessando o Painel do GTM

1. Acesse [Google Tag Manager](https://tagmanager.google.com/)
2. Faça login com a conta associada ao ID GTM-NGT69XDV
3. Selecione o contêiner para gerenciar tags, gatilhos e variáveis

### Adicionando Novas Tags

Para adicionar novas tags (como Facebook Pixel, HotJar, etc.):

1. No painel do GTM, clique em "Tags" > "Nova"
2. Selecione o tipo de tag desejado
3. Configure a tag conforme necessário
4. Defina os gatilhos apropriados (quando a tag deve ser acionada)
5. Salve e publique as alterações

### Testando as Tags

Antes de publicar alterações no GTM:

1. Use o modo de visualização do GTM para testar as alterações
2. Instale a extensão "Tag Assistant" do Chrome para verificar se as tags estão disparando corretamente
3. Verifique se não há erros no console do navegador

## Considerações de Performance

O GTM foi implementado seguindo as melhores práticas para minimizar o impacto na performance:

1. O script do GTM é carregado de forma assíncrona
2. O componente é modular e reutilizável
3. A CSP foi configurada para permitir apenas os domínios necessários

## Solução de Problemas

Se o GTM não estiver funcionando corretamente:

1. Verifique se o ID do contêiner está correto
2. Confirme se a CSP está permitindo os domínios necessários
3. Verifique se o componente está sendo usado corretamente em ambos os locais (head e body)
4. Inspecione o console do navegador para erros relacionados ao GTM

## Recursos Adicionais

- [Documentação oficial do Google Tag Manager](https://developers.google.com/tag-manager/quickstart)
- [Guia de implementação do GTM](https://support.google.com/tagmanager/answer/6103696)
- [Melhores práticas de performance com GTM](https://web.dev/articles/tag-best-practices) 