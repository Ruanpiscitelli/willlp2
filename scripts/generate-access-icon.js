/**
 * Script para gerar o ícone de acesso rápido
 * 
 * Este script gera um ícone de acesso rápido para o PWA
 * 
 * Uso: node scripts/generate-access-icon.js
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
const SIZE = 192; // Tamanho do ícone em pixels

// Criar diretório de saída se não existir
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

// Função para gerar o ícone de acesso rápido
async function generateAccessIcon() {
  console.log('Gerando ícone de acesso rápido...');
  
  try {
    // Criar canvas
    const canvas = createCanvas(SIZE, SIZE);
    const ctx = canvas.getContext('2d');
    
    // Definir fundo
    ctx.fillStyle = '#c30000'; // Vermelho
    ctx.fillRect(0, 0, SIZE, SIZE);
    
    // Desenhar símbolo de acesso (seta)
    ctx.beginPath();
    ctx.moveTo(SIZE * 0.3, SIZE * 0.5);
    ctx.lineTo(SIZE * 0.7, SIZE * 0.5);
    ctx.lineTo(SIZE * 0.5, SIZE * 0.7);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Desenhar círculo superior
    ctx.beginPath();
    ctx.arc(SIZE * 0.5, SIZE * 0.3, SIZE * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Salvar como PNG
    const outputFile = path.join(ICONS_DIR, 'access-icon.png');
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputFile, buffer);
    
    console.log(`✓ Ícone de acesso rápido gerado: ${outputFile}`);
    
  } catch (error) {
    console.error('Erro ao gerar ícone de acesso rápido:', error);
  }
}

// Executar a função principal
generateAccessIcon(); 