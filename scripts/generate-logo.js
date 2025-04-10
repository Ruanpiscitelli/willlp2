/**
 * Script para gerar um logo simples
 * 
 * Este script utiliza o canvas para gerar um logo simples
 * que será usado como base para gerar os ícones PWA.
 * 
 * Uso: node scripts/generate-logo.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createCanvas } from 'canvas';

// Obter o diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const OUTPUT_FILE = path.join(__dirname, '../src/assets/logo.png');
const SIZE = 512; // Tamanho do logo em pixels

// Criar diretório de saída se não existir
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Função para gerar o logo
async function generateLogo() {
  console.log('Gerando logo...');
  
  try {
    // Criar canvas
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');
    
    // Definir fundo
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, SIZE, SIZE);
    
    // Desenhar círculo externo
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FF6B00'; // Cor laranja
    ctx.fill();
    
    // Desenhar círculo interno
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00C31D'; // Cor verde
    ctx.fill();
    
    // Desenhar texto "CC"
    ctx.font = `bold ${SIZE / 3}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('CC', SIZE / 2, SIZE / 2);
    
    // Salvar como PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(OUTPUT_FILE, buffer);
    
    console.log(`✓ Logo gerado com sucesso: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('Erro ao gerar logo:', error);
  }
}

// Executar a função principal
generateLogo(); 