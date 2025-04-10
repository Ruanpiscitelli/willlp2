/**
 * Script para registrar o Service Worker
 * 
 * Este script verifica se o navegador suporta Service Workers
 * e registra o service worker para habilitar funcionalidades offline.
 */

// Importa a classe Workbox para gerenciar o service worker
import { Workbox } from 'workbox-window';

// Função para registrar o service worker
function registerServiceWorker() {
  // Verifica se o navegador suporta service workers
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/sw.js');

    // Adiciona um listener para quando o service worker for atualizado
    wb.addEventListener('installed', (event) => {
      if (event.isUpdate) {
        // Se for uma atualização, notifica o usuário
        if (confirm('Nova versão disponível! Clique em OK para atualizar.')) {
          window.location.reload();
        }
      }
    });

    // Adiciona um listener para quando o service worker estiver esperando
    wb.addEventListener('waiting', (event) => {
      // Notifica o usuário sobre a nova versão
      if (confirm('Nova versão disponível! Clique em OK para atualizar.')) {
        // Envia uma mensagem para o service worker ativar a nova versão
        wb.messageSkipWaiting();
      }
    });

    // Registra o service worker
    wb.register()
      .then((registration) => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      .catch((error) => {
        console.error('Falha ao registrar o Service Worker:', error);
      });
  } else {
    console.log('Service Workers não são suportados neste navegador.');
  }
}

// Registra o service worker quando a página for carregada
window.addEventListener('load', () => {
  registerServiceWorker();
});

// Exporta a função para uso em outros arquivos
export { registerServiceWorker }; 