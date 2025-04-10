/**
 * Script para gerar ícones PWA
 * 
 * Este script gera ícones PWA em diferentes tamanhos
 * a partir do logo principal.
 * 
 * Uso: node scripts/generate-icons.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

// Obter o diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const ICONS_DIR = path.join(__dirname, '../public/icons');
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Criar diretório de saída se não existir
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Função para gerar ícones PWA
async function generatePWAIcons() {
  console.log('Gerando ícones PWA...');
  
  try {
    // Gerar ícones em diferentes tamanhos
    for (const size of ICON_SIZES) {
      // Criar canvas com o tamanho do ícone
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Definir fundo
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, size, size);
      
      // Desenhar círculo externo
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FF6B00'; // Cor laranja
      ctx.fill();
      
      // Desenhar círculo interno
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00C31D'; // Cor verde
      ctx.fill();
      
      // Desenhar texto "CC"
      ctx.font = `bold ${size / 3}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('CC', size / 2, size / 2);
      
      // Salvar como PNG
      const outputFile = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
      const buffer = canvas.toBuffer('image/png');
      fs.writeFileSync(outputFile, buffer);
      
      console.log(`✓ Ícone gerado: ${outputFile}`);
    }
    
    // Gerar ícone para Apple
    const appleIconSize = 180;
    const appleCanvas = createCanvas(appleIconSize, appleIconSize);
    const appleCtx = appleCanvas.getContext('2d');
    
    // Definir fundo
    appleCtx.fillStyle = '#000000';
    appleCtx.fillRect(0, 0, appleIconSize, appleIconSize);
    
    // Desenhar círculo externo
    appleCtx.beginPath();
    appleCtx.arc(appleIconSize / 2, appleIconSize / 2, appleIconSize / 2.2, 0, Math.PI * 2);
    appleCtx.fillStyle = '#FF6B00'; // Cor laranja
    appleCtx.fill();
    
    // Desenhar círculo interno
    appleCtx.beginPath();
    appleCtx.arc(appleIconSize / 2, appleIconSize / 2, appleIconSize / 3, 0, Math.PI * 2);
    appleCtx.fillStyle = '#00C31D'; // Cor verde
    appleCtx.fill();
    
    // Desenhar texto "CC"
    appleCtx.font = `bold ${appleIconSize / 3}px Arial`;
    appleCtx.textAlign = 'center';
    appleCtx.textBaseline = 'middle';
    appleCtx.fillStyle = '#FFFFFF';
    appleCtx.fillText('CC', appleIconSize / 2, appleIconSize / 2);
    
    // Salvar como PNG
    const appleIconFile = path.join(ICONS_DIR, 'apple-icon-180.png');
    const appleBuffer = appleCanvas.toBuffer('image/png');
    fs.writeFileSync(appleIconFile, appleBuffer);
    
    console.log(`✓ Ícone Apple gerado: ${appleIconFile}`);
    
    console.log('✓ Todos os ícones PWA foram gerados com sucesso!');
    
  } catch (error) {
    console.error('Erro ao gerar ícones PWA:', error);
  }
}

// Executar a função principal
generatePWAIcons(); 