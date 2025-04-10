/**
 * Service Worker para CopyCash
 * 
 * Este service worker implementa:
 * 1. Estratégia de cache para recursos estáticos
 * 2. Cache-first para imagens e fontes
 * 3. Network-first para HTML e API
 * 4. Fallback offline para páginas
 */

// Nome do cache e versão
const CACHE_NAME = 'copycash-v1';

// Recursos para pré-cache (críticos para a aplicação)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/icons/apple-icon-180.png',
  '/css/critical.css',
  '/scripts/critical.js'
];

// Recursos para cache durante o uso
const RUNTIME_CACHE_PATTERNS = [
  /\.(?:js|css)$/,  // JavaScript e CSS
  /\.(?:png|jpg|jpeg|svg|webp|avif)$/, // Imagens
  /\.(?:woff|woff2|ttf|otf)$/ // Fontes
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Pré-cacheando recursos essenciais');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  // Limpar caches antigos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('copycash-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Removendo cache antigo:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  // Ignorar requisições não GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requisições para analytics e outras APIs externas
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('fonts.googleapis.com') && 
      !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }
  
  // Estratégia para HTML: Network First, fallback para cache
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clonar a resposta para o cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Fallback para página offline
              return caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // Estratégia para recursos estáticos: Cache First, fallback para network
  const isRuntimeCacheable = RUNTIME_CACHE_PATTERNS.some(pattern => 
    pattern.test(url.pathname)
  );
  
  if (isRuntimeCacheable) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Atualizar o cache em segundo plano (stale-while-revalidate)
            fetch(event.request)
              .then(response => {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, response.clone());
                });
              })
              .catch(err => console.error('Erro ao atualizar cache:', err));
            
            return cachedResponse;
          }
          
          // Se não estiver no cache, buscar da rede e armazenar
          return fetch(event.request)
            .then(response => {
              // Verificar se a resposta é válida
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clonar a resposta para o cache
              const responseClone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseClone);
              });
              
              return response;
            });
        })
    );
    return;
  }
  
  // Estratégia padrão para outros recursos: Network First
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Evento de sincronização em segundo plano
self.addEventListener('sync', event => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

// Função para sincronizar dados de analytics
async function syncAnalytics() {
  try {
    const analyticsData = await getAnalyticsDataFromIndexedDB();
    if (analyticsData && analyticsData.length > 0) {
      // Enviar dados para o servidor
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      });
      
      // Limpar dados enviados
      await clearSyncedAnalyticsData();
    }
  } catch (error) {
    console.error('Erro ao sincronizar analytics:', error);
  }
}

// Funções auxiliares para IndexedDB (simplificadas)
function getAnalyticsDataFromIndexedDB() {
  return Promise.resolve([]);
}

function clearSyncedAnalyticsData() {
  return Promise.resolve();
} 