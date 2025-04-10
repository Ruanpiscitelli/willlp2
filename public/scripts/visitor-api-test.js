/**
 * Script para testar se o VisitorAPI está funcionando corretamente
 * 
 * Este script verifica se o VisitorAPI está carregado e exibe informações
 * sobre o visitante no console para fins de depuração.
 */

(function() {
  // Função para verificar o VisitorAPI
  function checkVisitorAPI() {
    if (window.VisitorAPI) {
      console.log('✅ VisitorAPI está carregado');
      
      // Verificar se há dados do visitante
      if (window.VisitorAPI.visitor) {
        console.log('✅ Dados do visitante disponíveis:', window.VisitorAPI.visitor);
      } else {
        console.warn('⚠️ VisitorAPI carregado, mas sem dados do visitante');
      }

      // Verificar métodos disponíveis
      console.log('📝 Métodos disponíveis no VisitorAPI:', Object.keys(window.VisitorAPI));
    } else {
      console.error('❌ VisitorAPI não está carregado');
      
      // Verificar se o script está sendo carregado
      const visitorScripts = document.querySelectorAll('script[src*="visitorapi"]');
      if (visitorScripts.length > 0) {
        console.log('📝 Scripts do VisitorAPI encontrados:', visitorScripts.length);
        
        // Listar os scripts
        visitorScripts.forEach((script, index) => {
          console.log(`Script ${index + 1}:`, script.src, 'Status:', script.readyState || 'desconhecido');
        });
      } else {
        console.error('❌ Nenhum script do VisitorAPI encontrado no DOM');
      }
      
      // Verificar erros de rede
      if (window.performance && window.performance.getEntries) {
        const resources = window.performance.getEntries();
        const visitorResources = resources.filter(r => r.name.includes('visitorapi'));
        
        if (visitorResources.length > 0) {
          console.log('📝 Recursos do VisitorAPI:', visitorResources);
          
          // Verificar status dos recursos
          visitorResources.forEach((resource, index) => {
            console.log(`Recurso ${index + 1}:`, {
              url: resource.name,
              duration: resource.duration,
              startTime: resource.startTime,
              transferSize: resource.transferSize,
              decodedBodySize: resource.decodedBodySize
            });
          });
        } else {
          console.error('❌ Nenhum recurso do VisitorAPI encontrado');
        }
      }
      
      // Verificar CSP
      console.log('📝 Verificando Content Security Policy...');
      const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (metaCSP) {
        console.log('CSP encontrada no meta tag:', metaCSP.content);
      } else {
        console.log('Nenhuma CSP encontrada no meta tag (isso é normal se estiver definida no servidor)');
      }
      
      // Tentar novamente após 5 segundos
      setTimeout(checkVisitorAPI, 5000);
    }
  }
  
  // Verificar após o carregamento da página
  if (document.readyState === 'complete') {
    checkVisitorAPI();
  } else {
    window.addEventListener('load', function() {
      // Aguardar 2 segundos após o carregamento para dar tempo ao VisitorAPI
      setTimeout(checkVisitorAPI, 2000);
    });
  }
})(); 