/**
 * Script de analytics para monitoramento de uso
 * Carregado de forma assíncrona para não afetar a performance da página
 */

(function() {
  // Configuração de analytics
  const config = {
    trackPageViews: true,
    trackEvents: true,
    trackUserBehavior: true,
    anonymizeIp: true,
    storageMethod: 'localStorage', // 'localStorage', 'sessionStorage', 'indexedDB'
    batchInterval: 10000, // Enviar analytics a cada 10 segundos
    samplingRate: 1.0, // 100% dos usuários
    // URL do endpoint de analytics (vazia para debug)
    endpoint: '' 
  };
  
  // Inicializar o sistema de analytics
  const Analytics = {
    events: [],
    pageLoadTime: window.performance ? window.performance.now() : Date.now(),
    
    // Inicializar o sistema
    init: function() {
      // Registrar visualização de página
      if (config.trackPageViews) {
        this.trackPageView();
      }
      
      // Registrar eventos de interação do usuário
      if (config.trackEvents) {
        this.setupEventTracking();
      }
      
      // Configurar envio em lote
      if (config.endpoint) {
        setInterval(this.sendBatch.bind(this), config.batchInterval);
      }
      
      // Registrar eventos de ciclo de vida
      window.addEventListener('beforeunload', this.onUnload.bind(this));
      
      console.log('Analytics initialized');
    },
    
    // Registrar visualização de página
    trackPageView: function() {
      const data = {
        type: 'pageview',
        page: window.location.pathname,
        referrer: document.referrer,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`
      };
      
      // Adicionar dados de performance se disponíveis
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        data.loadTime = timing.loadEventEnd - timing.navigationStart;
        data.dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
        data.ttfb = timing.responseStart - timing.requestStart;
        data.domInteractive = timing.domInteractive - timing.navigationStart;
      }
      
      this.events.push(data);
      console.log('Page view tracked', data);
    },
    
    // Registrar evento personalizado
    trackEvent: function(category, action, label, value) {
      const data = {
        type: 'event',
        category: category,
        action: action,
        label: label || null,
        value: value || null,
        timestamp: Date.now(),
        page: window.location.pathname
      };
      
      this.events.push(data);
      console.log('Event tracked', data);
    },
    
    // Configurar rastreamento de eventos
    setupEventTracking: function() {
      // Rastrear cliques
      document.addEventListener('click', (e) => {
        // Identificar botões e links
        const target = e.target.closest('a, button');
        if (!target) return;
        
        let category, action, label;
        
        if (target.tagName === 'A') {
          category = 'link';
          action = 'click';
          label = target.href || target.textContent;
        } else if (target.tagName === 'BUTTON') {
          category = 'button';
          action = 'click';
          label = target.id || target.textContent;
        }
        
        if (category) {
          this.trackEvent(category, action, label);
        }
      });
    },
    
    // Enviar eventos em lote
    sendBatch: function() {
      if (this.events.length === 0 || !config.endpoint) return;
      
      // Clonar e limpar eventos
      const batch = [...this.events];
      this.events = [];
      
      // Se não houver endpoint real, apenas registrar no console
      if (!config.endpoint) {
        console.log('Analytics batch ready to send', batch);
        return;
      }
      
      // Enviar para o servidor
      fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(batch),
        keepalive: true
      }).catch(err => {
        console.error('Failed to send analytics', err);
        // Armazenar falhas para reenvio
        this.storeFailedBatch(batch);
      });
    },
    
    // Armazenar lotes que falharam no envio
    storeFailedBatch: function(batch) {
      try {
        // Armazenar no localStorage para tentar novamente mais tarde
        const failed = JSON.parse(localStorage.getItem('analytics_failed') || '[]');
        failed.push({
          batch: batch,
          timestamp: Date.now()
        });
        localStorage.setItem('analytics_failed', JSON.stringify(failed));
      } catch (e) {
        console.error('Failed to store analytics batch', e);
      }
    },
    
    // Manipular evento de saída da página
    onUnload: function() {
      // Tentar enviar eventos finais
      if (this.events.length > 0 && navigator.sendBeacon && config.endpoint) {
        const blob = new Blob([JSON.stringify(this.events)], {type: 'application/json'});
        navigator.sendBeacon(config.endpoint, blob);
      }
    }
  };
  
  // Inicializar analytics
  Analytics.init();
  
  // Expor API para uso global
  window.Analytics = {
    trackEvent: Analytics.trackEvent.bind(Analytics)
  };
})(); 