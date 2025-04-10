/**
 * Script para registrar o Service Worker
 * 
 * Este script verifica se o navegador suporta Service Workers
 * e registra o nosso SW para melhorar a performance e experiência offline.
 */

// Função para registrar o service worker
function registerServiceWorker() {
  // Verificar se o navegador suporta service worker
  if ('serviceWorker' in navigator) {
    // Registrar o service worker quando a página carregar completamente
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado com sucesso:', registration.scope);
        })
        .catch(error => {
          console.error('Falha ao registrar o Service Worker:', error);
        });
    });
  }
}

// Executar a função de registro
registerServiceWorker();

// Exportar a função para uso em outros módulos se necessário
export { registerServiceWorker }; 