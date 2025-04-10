/**
 * Script para verificar e corrigir a integração do VisitorAPI
 * 
 * Este script verifica se o VisitorAPI está carregado corretamente e tenta
 * recarregá-lo caso ocorra algum erro.
 */

(function() {
  // Verificar se o VisitorAPI já está carregado
  if (window.VisitorAPI) {
    console.log('VisitorAPI já está carregado');
    return;
  }

  // Função para carregar o VisitorAPI manualmente
  function loadVisitorAPI() {
    const pid = '9AIcXi79egjcfAfi2q7D'; // ID do projeto VisitorAPI
    
    // Criar elemento de script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://api.visitorapi.com/js/?pid=' + pid;
    script.crossOrigin = 'anonymous'; // Adicionar crossorigin para melhorar compatibilidade com CSP
    
    // Adicionar handlers de erro e sucesso
    script.onerror = function(error) {
      console.warn('Erro ao carregar VisitorAPI:', error);
      console.warn('Tentando novamente em 3 segundos...');
      // Tentar novamente após 3 segundos
      setTimeout(loadVisitorAPI, 3000);
    };
    
    script.onload = function() {
      console.log('VisitorAPI carregado com sucesso');
      // Verificar se o objeto VisitorAPI está disponível
      if (window.VisitorAPI) {
        console.log('Objeto VisitorAPI disponível');
      } else {
        console.warn('Objeto VisitorAPI não disponível após carregamento do script');
      }
    };
    
    // Adicionar script ao documento
    document.head.appendChild(script);
  }

  // Verificar se o GTM está carregado
  if (window.dataLayer) {
    // Adicionar evento ao dataLayer para informar que o VisitorAPI será carregado manualmente
    window.dataLayer.push({
      'event': 'visitorapi_manual_load',
      'visitorapi_status': 'loading'
    });
    
    // Carregar o VisitorAPI
    loadVisitorAPI();
  } else {
    // Se o GTM não estiver carregado, aguardar e tentar novamente
    console.warn('Google Tag Manager não encontrado. Aguardando...');
    setTimeout(function() {
      if (window.dataLayer) {
        loadVisitorAPI();
      } else {
        console.error('Google Tag Manager não foi carregado após espera.');
        // Carregar VisitorAPI mesmo sem GTM
        loadVisitorAPI();
      }
    }, 2000);
  }
})(); 