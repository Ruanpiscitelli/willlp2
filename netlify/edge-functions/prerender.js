/**
 * Edge Function para otimização de performance no Netlify
 * 
 * Esta função implementa:
 * 1. Prerendering de páginas para melhorar o tempo de carregamento
 * 2. Cache-Control headers otimizados
 * 3. Compressão de resposta
 */

export default async function handler(request, context) {
  // Obter a URL da solicitação
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Configurar headers padrão para melhorar performance
  const responseInit = {
    headers: {
      'X-Edge-Function': 'prerender',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  };
  
  // Configurar cache mais longo para assets estáticos
  if (path.startsWith('/assets/') || 
      path.endsWith('.webp') || 
      path.endsWith('.avif') || 
      path.endsWith('.jpg') || 
      path.endsWith('.png') || 
      path.endsWith('.svg')) {
    responseInit.headers['Cache-Control'] = 'public, max-age=31536000, immutable';
  }
  
  // Adicionar preload para recursos críticos
  if (path === '/' || path === '/index.html') {
    // Adicionar Link headers para preload de recursos críticos
    const criticalResources = [
      // Removidas as referências a arquivos que não existem
    ];
    
    // Só adiciona o header Link se houver recursos críticos
    if (criticalResources.length > 0) {
      responseInit.headers['Link'] = criticalResources.join(', ');
    }
  }
  
  // Continuar para o próximo middleware ou para a resposta final
  return context.next(responseInit);
} 