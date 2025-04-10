/**
 * Configuração do PostCSS para otimização de CSS
 * 
 * Este arquivo configura plugins do PostCSS para:
 * 1. Autoprefixer - adiciona prefixos de vendor automaticamente
 * 2. cssnano - minifica e otimiza CSS
 * 3. purgecss - remove CSS não utilizado (opcional, desativado por padrão)
 */

import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
// const purgecss = require('@fullhuman/postcss-purgecss'); // Descomentado apenas se necessário

export default {
  plugins: {
    autoprefixer: {},
    cssnano: {
      preset: 'default'
    }
  }
}; 