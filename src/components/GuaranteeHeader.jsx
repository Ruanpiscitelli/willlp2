import React, { memo } from 'react';

// Componentes SVG otimizados
const ProfitArrow = memo(() => (
  React.createElement('svg', {
    viewBox: "0 0 24 24",
    width: "15",
    height: "15",
    fill: "#00ff00"
  }, React.createElement('path', {
    d: "M7 14l5-5 5 5z"
  }))
));

// Componente otimizado com memo para evitar re-renderizações desnecessárias
const GuaranteeHeader = memo(({ number, badge, title }) => {
  // Alturas predefinidas - mesmas no servidor e cliente
  const predefinedHeights = [22, 18, 25, 15, 30];
  
  return React.createElement(
    'div',
    { className: "guarantee-header-container" },
    React.createElement(
      'div',
      { className: "guarantee-number-badge" },
      React.createElement(
        'div',
        { className: "guarantee-number" },
        React.createElement(
          'span',
          { className: "number-label" },
          `GARANTIA #${number}`
        ),
        React.createElement(
          'div',
          { className: "stock-chart" },
          predefinedHeights.map((height, i) => 
            React.createElement('div', {
              key: i,
              className: "chart-bar",
              style: {
                height: `${height}px`,
                animationDelay: `${i * 0.2}s`
              }
            })
          )
        )
      ),
      React.createElement(
        'div',
        { className: "guarantee-badge" },
        React.createElement('span', null, badge),
        badge.includes('R$') && 
          React.createElement(
            'div',
            { className: "profit-arrow" },
            React.createElement(ProfitArrow, null)
          )
      )
    ),
    React.createElement('h3', { className: "guarantee-title" }, title),
    React.createElement(
      'div',
      { className: "ticker-tape" },
      React.createElement(
        'div',
        { className: "ticker-content" },
        React.createElement('span', { className: "ticker-item profit" }, 
          "GCASH ", 
          React.createElement('span', { className: "value" }, "+12.8%")
        ),
        React.createElement('span', { className: "ticker-item loss" }, 
          "BCOIN ", 
          React.createElement('span', { className: "value" }, "-3.2%")
        ),
        React.createElement('span', { className: "ticker-item profit" }, 
          "VGOLD ", 
          React.createElement('span', { className: "value" }, "+7.5%")
        ),
        React.createElement('span', { className: "ticker-item profit" }, 
          "INDEX ", 
          React.createElement('span', { className: "value" }, "+2.1%")
        ),
        React.createElement('span', { className: "ticker-item loss" }, 
          "RBOND ", 
          React.createElement('span', { className: "value" }, "-1.4%")
        )
      )
    )
  );
});

// Adicionar displayName para facilitar depuração
GuaranteeHeader.displayName = 'GuaranteeHeader';

export default GuaranteeHeader;
