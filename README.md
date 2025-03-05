# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> ð§âð **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## ð Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
âââ public/
â   âââ favicon.svg
âââ src/
â   âââ components/
â   â   âââ Card.astro
â   âââ layouts/
â   â   âââ Layout.astro
â   âââ pages/
â       âââ index.astro
âââ package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## ð§ Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## ð Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

# CopyCash - Landing Page Otimizada

Landing page de alta performance desenvolvida com Astro.js, otimizada para SEO e velocidade.

## 🚀 Tecnologias

- [Astro.js](https://astro.build/) - Framework web para sites de alto desempenho
- [React](https://reactjs.org/) - Para componentes interativos com hidratação parcial
- Service Worker para experiência offline
- Otimização de imagens e assets
- PWA (Progressive Web App)

## 📋 Requisitos

- Node.js 18.x ou superior
- NPM 8.x ou superior

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Visualizar build de produção
npm run preview
```

## 📦 Deploy no Netlify

Este projeto está configurado para deploy automático no Netlify.

### Configuração Automática

1. Faça fork ou clone este repositório para sua conta GitHub/GitLab/Bitbucket
2. No Netlify, clique em "New site from Git"
3. Selecione o repositório
4. Configurações de build:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Clique em "Deploy site"

### Configuração Manual

Se preferir fazer upload manual:

1. Execute `npm run build`
2. Faça upload da pasta `dist` para o Netlify

### Domínio Personalizado

Para configurar um domínio personalizado no Netlify:

1. Vá para "Domain settings" no painel do Netlify
2. Clique em "Add custom domain"
3. Siga as instruções para configurar os registros DNS

## ☁️ Configuração no Cloudflare

Para usar o Cloudflare como CDN ou para um subdomínio:

### Como CDN para seu site no Netlify

1. Adicione seu domínio ao Cloudflare
2. Configure os nameservers do seu domínio para os fornecidos pelo Cloudflare
3. No Cloudflare, adicione um registro CNAME apontando para seu site Netlify:
   - Nome: `www` ou subdomínio desejado
   - Conteúdo: `seu-site.netlify.app`
   - Proxy: Ativado (ícone laranja)

### Configurações Recomendadas no Cloudflare

- **Page Rules**: Configure regras para cache de página
  - URL: `*seudominio.com/*`
  - Cache Level: Cache Everything
  - Edge Cache TTL: 4 hours

- **Otimizações**:
  - Ative Auto Minify para HTML, CSS e JavaScript
  - Ative Brotli compression
  - Ative Rocket Loader para JavaScript

## 📱 PWA

Este projeto é uma Progressive Web App (PWA) e pode ser instalada em dispositivos móveis e desktops. Recursos:

- Funciona offline
- Pode ser instalada na tela inicial
- Carregamento rápido mesmo em conexões lentas

## 🔍 SEO

Otimizações de SEO implementadas:

- Meta tags dinâmicas
- Sitemap.xml gerado automaticamente
- Robots.txt configurado
- Estrutura de dados Schema.org
- Otimização para compartilhamento em redes sociais

## 📈 Performance

Otimizações de performance implementadas:

- Carregamento assíncrono de scripts não críticos
- Imagens otimizadas e servidas em formatos modernos (WebP)
- CSS crítico inline
- Lazy loading de imagens e componentes
- Compressão de assets

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Desenvolvido por [Ruan Piscitelli](https://github.com/Ruanpiscitelli)
# willlp2
