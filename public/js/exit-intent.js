/**
 * Script de exit-intent para exibir modal quando o usuário tentar sair da página
 * Carregado de forma assíncrona para não afetar a performance da página
 */

(function() {
  console.log('Exit Intent Script - Iniciando...');
  
  // Configurações do exit intent
  const config = {
    enabled: true,
    cookieName: 'exit_intent_shown',
    cookieExpiry: 7, // dias
    delay: 2000, // 2 segundos após carregamento da página
    showOnce: true, // Mostrar apenas uma vez por sessão
    sensitivity: 20, // Sensibilidade para detectar movimento do mouse
    modalId: 'exit-popup',
    debug: true
  };

  // Utilitários
  const ExitIntentUtils = {
    getCookie: function(name) {
      const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
      return match ? decodeURIComponent(match[3]) : null;
    },
    
    setCookie: function(name, value, days) {
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
      }
      document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/';
    },
    
    shouldShowModal: function() {
      if (config.showOnce && this.getCookie(config.cookieName)) {
        console.log('Modal já foi mostrado anteriormente');
        return false;
      }
      return config.enabled;
    },
    
    showModal: function() {
      const modal = document.getElementById(config.modalId);
      if (!modal) {
        console.error('Modal não encontrado:', config.modalId);
        return;
      }
      
      console.log('Mostrando modal');
      
      // Força um reflow para garantir que a transição funcione
      modal.offsetHeight;
      
      modal.classList.add('visible');
      
      if (config.showOnce) {
        this.setCookie(config.cookieName, 'true', config.cookieExpiry);
      }
      
      // Adiciona evento de clique no overlay para fechar
      const overlay = modal.querySelector('.popup-overlay');
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) {
            this.hideModal();
          }
        });
      }
    },
    
    hideModal: function() {
      const modal = document.getElementById(config.modalId);
      if (!modal) {
        console.error('Modal não encontrado ao tentar fechar');
        return;
      }
      
      console.log('Fechando modal');
      modal.classList.remove('visible');
    }
  };

  // Controlador de Exit Intent
  const ExitIntent = {
    init: function() {
      console.log('Exit Intent - Inicializando...');
      
      // Verificar se o modal existe
      const modal = document.getElementById(config.modalId);
      if (!modal) {
        console.error('Modal não encontrado durante inicialização');
        return;
      }
      
      if (!ExitIntentUtils.shouldShowModal()) {
        console.log('Não deve mostrar o modal - já exibido anteriormente');
        return;
      }
      
      // Configurar evento de fechar
      const closeButton = document.getElementById('close-popup');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          console.log('Botão fechar clicado');
          ExitIntentUtils.hideModal();
        });
      } else {
        console.error('Botão de fechar não encontrado');
      }
      
      // Adicionar evento de mouse leave
      document.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
      console.log('Evento mouseleave registrado');
      
      // Configurar timer
      console.log('Configurando timer de', config.delay, 'ms');
      setTimeout(() => {
        this.timer = true;
        console.log('Timer ativado - pronto para mostrar modal');
      }, config.delay);
    },
    
    timer: false,
    shown: false,
    
    handleMouseLeave: function(e) {
      console.log('Mouse leave detectado', {
        clientY: e.clientY,
        shown: this.shown,
        timer: this.timer
      });
      
      if (this.shown) {
        console.log('Modal já foi mostrado, ignorando evento');
        return;
      }
      
      if (!this.timer) {
        console.log('Timer ainda não ativado, ignorando evento');
        return;
      }
      
      if (e.clientY > config.sensitivity) {
        console.log('Mouse não saiu pela parte superior da página');
        return;
      }
      
      console.log('Todas as condições satisfeitas, mostrando modal');
      ExitIntentUtils.showModal();
      this.shown = true;
    }
  };
  
  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM carregado, inicializando Exit Intent');
      ExitIntent.init();
    });
  } else {
    console.log('DOM já carregado, inicializando Exit Intent imediatamente');
    ExitIntent.init();
  }
})(); 