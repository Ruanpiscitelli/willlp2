import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import compress from 'astro-compress';
import netlify from '@astrojs/netlify';

// https://astro.build/config
export default defineConfig({
  integrations: [
    // Otimizar integração React
    react({
      // Habilitar modo legado para melhor performance
      legacy: {
        hydratePaths: true,
      },
      // Otimizar renderização
      experimentalReactChildren: true,
    }),
    // Compressão otimizada
    compress({
      css: true,
      js: true,
      img: true,
      svg: true,
      html: true,
      logger: 1,
      
      // Otimizações JavaScript
      jsMinifier: 'terser',
      terser: {
        format: {
          comments: false,
        },
        compress: {
          drop_console: true,
          passes: 3,
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_methods: true,
          unsafe_proto: true,
          unsafe_regexp: true,
          unsafe_undefined: true,
        },
        mangle: {
          toplevel: true,
          properties: {
            regex: /^_/
          }
        }
      },
      
      // Otimizações HTML
      html: {
        removeAttributeQuotes: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        collapseWhitespace: true,
        conservativeCollapse: true,
        minifyCSS: true,
        minifyJS: {
          compress: {
            drop_console: true,
            pure_getters: true,
            unsafe: true,
            passes: 3,
          },
          mangle: true,
          keep_fnames: false,
        },
      },
      
      // Otimizações de imagem
      img: {
        quality: 80,
      },
      
      // Otimizações SVG
      svg: {
        multipass: true,
        plugins: [
          { removeViewBox: false },
          { removeDimensions: true },
          { removeUselessDefs: true },
        ],
      },
      
      // Otimizações CSS
      css: {
        level: {
          1: {
            all: true,
          },
          2: {
            all: true,
            removeUnusedAtRules: true,
            restructureRules: true,
          }
        }
      },
      
      // Compressão avançada
      gzip: true,
      brotli: true,
    })
  ],
  // Configuração para o sistema nativo de assets do Astro
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    // Otimizar cache de imagens
    cacheDir: '.astro/cache/images',
  },
  // Habilita transições de view para melhor UX durante navegação
  viewTransitions: true,
  // Outras otimizações de build
  build: {
    inlineStylesheets: 'auto', // Inline CSS pequenos
    // Otimizar assets
    assets: 'assets',
    // Dividir CSS por página
    split: true,
  },
  output: 'static',
  adapter: netlify(),
  vite: {
    build: {
      // Configuração para extrair CSS crítico
      cssCodeSplit: true,
      // Remover comentários do CSS em produção
      cssMinify: 'lightningcss',
      // Otimizações de Rollup para melhorar performance
      rollupOptions: {
        output: {
          // Manter arquivos CSS separados para permitir injeção crítica
          assetFileNames: 'assets/[name].[hash][extname]',
          // Agrupar vendor scripts separados para melhor cache
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'astro': ['astro'],
          },
        },
      },
      // Otimizações de minificação
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log'],
          passes: 3,
        },
        keep_fnames: false,
      },
    },
    // Configurações globais de CSS para Vite
    css: {
      devSourcemap: false,
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
    // Configurações de servidor para desenvolvimento
    server: {
      // Configurar compressão no servidor de desenvolvimento
      fs: {
        strict: true,
      },
      // Otimizar HMR
      hmr: {
        overlay: false,
      },
    },
    // Otimizações de cache
    optimizeDeps: {
      include: ['react', 'react-dom'],
      exclude: ['sharp'],
    },
  }
});
