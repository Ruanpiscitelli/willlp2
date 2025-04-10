// Service Worker para cache de recursos estáticos
const CACHE_NAME = 'copycash-cache-v1';

// Lista de recursos que devem ser armazenados em cache
const urlsToCache = [
  '/',
  '/favicon.png'
  // Removidas as referências a arquivos que não existem
];

// Instalação do service worker e cache inicial
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceptar requisições e servir do cache quando possível
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retorna a resposta do cache
        if (response) {
          return response;
        }

        // Clone da requisição (streams só podem ser consumidos uma vez)
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Verifica se recebemos uma resposta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone da resposta (streams só podem ser consumidos uma vez)
            const responseToCache = response.clone();

            // Não armazena em cache se for API ou recurso dinâmico
            if (event.request.url.includes('/api/') || 
                event.request.url.includes('?') ||
                event.request.method !== 'GET') {
              return response;
            }

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});

// Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 