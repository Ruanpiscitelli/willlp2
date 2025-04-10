/**
 * Script crítico para carregamento inicial da página
 * Este arquivo é carregado imediatamente e contém funcionalidades essenciais
 */

// Inicializar funcionalidades críticas
document.addEventListener('DOMContentLoaded', function() {
  console.log('Critical script loaded and executed');
  
  // Detectar recursos do navegador
  const browserFeatures = {
    webp: document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0,
    avif: false, // Verificado de forma assíncrona
    intersection: 'IntersectionObserver' in window,
    localStorage: (() => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    })()
  };
  
  // Armazenar recursos do navegador para uso posterior
  window.browserFeatures = browserFeatures;
  
  // Verificar suporte a AVIF de forma assíncrona
  (function checkAvif() {
    const img = new Image();
    img.onload = function() {
      browserFeatures.avif = img.width > 0 && img.height > 0;
    };
    img.onerror = function() {
      browserFeatures.avif = false;
    };
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  })();
  
  // Inicializar recursos críticos da página
  initCriticalFeatures();
});

/**
 * Inicializa funcionalidades críticas para a experiência do usuário
 */
function initCriticalFeatures() {
  // Ativar animações após carregamento para evitar jank
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);
  
  // Monitorar web vitals
  if ('web-vitals' in window) {
    webVitals.getCLS(console.log);
    webVitals.getFID(console.log);
    webVitals.getLCP(console.log);
  }
} 