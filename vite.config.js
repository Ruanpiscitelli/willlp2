/**
 * Configuração do Vite para otimização de build
 * 
 * Este arquivo configura o Vite para:
 * 1. Otimizar o build para produção
 * 2. Configurar plugins para análise de bundle
 * 3. Otimizar a compressão de assets
 */

import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig({
  // Configurações de build
  build: {
    // Otimizações para produção
    target: 'es2018',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3, // Aumentar passes para melhor otimização
        toplevel: true, // Habilitar otimizações de nível superior
        unsafe_math: true, // Otimizações matemáticas agressivas
        unsafe_methods: true, // Otimizar chamadas de método
      },
      mangle: {
        toplevel: true, // Mangling mais agressivo
        properties: {
          regex: /^_/ // Mangling apenas para propriedades privadas
        }
      },
      format: {
        comments: false,
        ecma: 2018,
      },
    },
    
    // Configurações de Rollup
    rollupOptions: {
      output: {
        // Estratégia de chunking otimizada
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            // Separar chunks por funcionalidade
            if (id.includes('@astro')) {
              return 'vendor-astro';
            }
            if (id.includes('sharp') || id.includes('image')) {
              return 'vendor-image';
            }
            return 'vendor';
          }
          // Separar código da aplicação por módulos
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/pages/')) {
            return 'pages';
          }
        },
        // Otimizar nomes de chunks
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]',
      },
    },
    
    // Relatório de análise de bundle
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500, // Reduzir limite de aviso para chunks grandes
  },
  
  // Plugins
  plugins: [
    // Plugin de visualização de bundle
    process.env.ANALYZE === 'true' && visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
      template: 'treemap', // Visualização mais detalhada
    }),
    // Compressão gzip otimizada
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 5120, // Reduzir threshold para 5KB
      deleteOriginFile: false,
      verbose: true,
      filter: /\.(js|css|html|json|svg)$/i,
    }),
    // Compressão brotli otimizada
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 5120, // Reduzir threshold para 5KB
      deleteOriginFile: false,
      verbose: true,
      filter: /\.(js|css|html|json|svg)$/i,
    }),
  ].filter(Boolean),
  
  // Configurações de otimização
  optimizeDeps: {
    // Pré-bundling otimizado
    include: [
      'react', 
      'react-dom',
      // Incluir dependências comuns
      'react/jsx-runtime',
    ],
    // Excluir dependências grandes raramente usadas
    exclude: [
      'sharp', // Usado apenas em build
    ],
  },
  
  // Configurações de servidor de desenvolvimento
  server: {
    hmr: {
      overlay: true,
    },
  },
  
  // Otimizações de cache
  cacheDir: '.vite',
  clearScreen: false, // Manter logs para debug
}); 