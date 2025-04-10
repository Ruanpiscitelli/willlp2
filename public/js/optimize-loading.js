/**
 * Script para otimizar o carregamento de JavaScript
 * Implementa estratégias de carregamento inteligente e priorização
 */

// Configuração de prioridades
const PRIORITY = {
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4
};

// Mapa de recursos e suas prioridades
const resourcePriorities = new Map();

// Observador de interseção para lazy loading
const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadResource(entry.target.dataset.src, entry.target.dataset.type);
      intersectionObserver.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '50px'
});

// Função para registrar recursos e suas prioridades
function registerResource(url, priority, type = 'script') {
  resourcePriorities.set(url, { priority, type });
}

// Função para carregar recursos de forma otimizada
async function loadResource(url, type = 'script') {
  if (type === 'script') {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.head.appendChild(script);
    return new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
  } else if (type === 'style') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
    return new Promise((resolve, reject) => {
      link.onload = resolve;
      link.onerror = reject;
    });
  }
}

// Função para carregar recursos em ordem de prioridade
async function loadPrioritizedResources() {
  const sortedResources = Array.from(resourcePriorities.entries())
    .sort(([, a], [, b]) => a.priority - b.priority);

  for (const [url, { type }] of sortedResources) {
    if (document.querySelector(`[src="${url}"]`)) continue;
    await loadResource(url, type);
  }
}

// Função para configurar lazy loading
function setupLazyLoading(selector, type = 'script') {
  document.querySelectorAll(selector).forEach(element => {
    if (element.dataset.src) {
      element.dataset.type = type;
      intersectionObserver.observe(element);
    }
  });
}

// Função para otimizar carregamento de scripts inline
function optimizeInlineScripts() {
  const scripts = document.querySelectorAll('script:not([src])');
  scripts.forEach(script => {
    if (script.textContent.length > 1000) {
      const blob = new Blob([script.textContent], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      const newScript = document.createElement('script');
      newScript.src = url;
      newScript.async = true;
      script.parentNode.replaceChild(newScript, script);
    }
  });
}

// Função para pré-carregar recursos críticos
function preloadCriticalResources() {
  const criticalResources = Array.from(resourcePriorities.entries())
    .filter(([, { priority }]) => priority === PRIORITY.CRITICAL);

  criticalResources.forEach(([url, { type }]) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = type;
    link.href = url;
    document.head.appendChild(link);
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Registrar recursos críticos
  registerResource('/assets/vendor-react.js', PRIORITY.CRITICAL);
  registerResource('/js/components.js', PRIORITY.HIGH);
  registerResource('/js/pages.js', PRIORITY.MEDIUM);
  
  // Configurar lazy loading para scripts não críticos
  setupLazyLoading('[data-lazy-script]', 'script');
  setupLazyLoading('[data-lazy-style]', 'style');
  
  // Otimizar scripts inline
  optimizeInlineScripts();
  
  // Pré-carregar recursos críticos
  preloadCriticalResources();
  
  // Carregar recursos priorizados
  loadPrioritizedResources();
});

// Exportar funções úteis
export {
  registerResource,
  loadResource,
  setupLazyLoading,
  PRIORITY
}; 