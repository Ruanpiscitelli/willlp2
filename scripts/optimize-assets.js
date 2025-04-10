/**
 * Script para otimizar assets
 * 
 * Este script comprime imagens e otimiza o tamanho dos assets
 * para melhorar a performance do site.
 * 
 * Uso: node scripts/optimize-assets.js
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { glob } from 'glob';
import { promisify } from 'util';
import { gzip, brotliCompress, constants } from 'zlib';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify zlib functions
const gzipPromise = promisify(gzip);
const brotliPromise = promisify(brotliCompress);

// Configurações
const PUBLIC_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist');
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const COMPRESS_EXTENSIONS = ['.js', '.css', '.html', '.svg', '.json', '.xml'];
const IMAGE_QUALITY = 80; // Qualidade para compressão de imagens (0-100)

// Função para otimizar imagens
async function optimizeImages() {
  console.log('Otimizando imagens...');
  
  // Encontrar todas as imagens no diretório public
  const imageFiles = await glob(`${DIST_DIR}/**/*+(${IMAGE_EXTENSIONS.join('|')})`, { nodir: true });
  
  let totalSaved = 0;
  let totalProcessed = 0;
  
  for (const file of imageFiles) {
    try {
      const stats = fs.statSync(file);
      const originalSize = stats.size;
      
      // Ignorar arquivos muito pequenos (menos de 1KB) que podem estar corrompidos
      if (originalSize < 1024) {
        console.log(`⚠️ Ignorando arquivo muito pequeno: ${path.basename(file)} (${formatBytes(originalSize)})`);
        continue;
      }
      
      // Obter extensão do arquivo
      const ext = path.extname(file).toLowerCase();
      
      // Verificar se o arquivo é uma imagem válida antes de processar
      try {
        const metadata = await sharp(file).metadata();
        if (!metadata) {
          console.error(`Arquivo inválido ou corrompido: ${path.basename(file)}`);
          continue;
        }

        // Configurar opções de compressão com base no tipo de arquivo
        let options = {};
        let pipeline = sharp(file);
        
        if (ext === '.jpg' || ext === '.jpeg') {
          options = { quality: IMAGE_QUALITY };
          pipeline = pipeline.jpeg(options);
        } else if (ext === '.png') {
          options = { compressionLevel: 9 };
          pipeline = pipeline.png(options);
        } else if (ext === '.webp') {
          options = { quality: IMAGE_QUALITY, lossless: false };
          pipeline = pipeline.webp(options);
        } else if (ext === '.gif') {
          // Para GIFs, apenas copiar o arquivo
          continue;
        }
        
        // Redimensionar imagens muito grandes (opcional)
        if (metadata.width > 2000) {
          pipeline = pipeline.resize(2000, null, { withoutEnlargement: true });
        }
        
        // Salvar imagem otimizada
        const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
        fs.writeFileSync(file, data);
        
        const newSize = data.length;
        const saved = originalSize - newSize;
        const percentage = Math.round((saved / originalSize) * 100);
        
        totalSaved += saved;
        totalProcessed++;
        
        console.log(`✓ ${path.basename(file)}: ${formatBytes(originalSize)} → ${formatBytes(newSize)} (${percentage}% redução)`);
      } catch (metadataError) {
        console.error(`Erro ao processar metadados de ${path.basename(file)}:`, metadataError.message);
        continue;
      }
    } catch (error) {
      console.error(`Erro ao otimizar ${path.basename(file)}:`, error.message);
    }
  }
  
  console.log(`\nTotal de imagens processadas: ${totalProcessed}`);
  console.log(`Total economizado: ${formatBytes(totalSaved)}`);
}

// Função para comprimir arquivos estáticos
async function compressStaticFiles() {
  console.log('\nComprimindo arquivos estáticos...');
  
  // Verificar se o diretório dist existe
  if (!fs.existsSync(DIST_DIR)) {
    console.log('Diretório dist não encontrado. Execute o build antes de comprimir os arquivos.');
    return;
  }
  
  // Encontrar todos os arquivos para compressão
  const filesToCompress = await glob(`${DIST_DIR}/**/*+(${COMPRESS_EXTENSIONS.join('|')})`, { nodir: true });
  
  let totalProcessed = 0;
  
  for (const file of filesToCompress) {
    try {
      const content = fs.readFileSync(file);
      
      // Criar versão gzip
      const gzipped = await gzipPromise(content, { level: 9 });
      fs.writeFileSync(`${file}.gz`, gzipped);
      
      // Criar versão brotli
      const brotlied = await brotliPromise(content, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
      fs.writeFileSync(`${file}.br`, brotlied);
      
      const originalSize = content.length;
      const gzipSize = gzipped.length;
      const brotliSize = brotlied.length;
      
      console.log(`✓ ${path.basename(file)}: Original: ${formatBytes(originalSize)}, Gzip: ${formatBytes(gzipSize)}, Brotli: ${formatBytes(brotliSize)}`);
      
      totalProcessed++;
    } catch (error) {
      console.error(`Erro ao comprimir ${path.basename(file)}:`, error.message);
    }
  }
  
  console.log(`\nTotal de arquivos comprimidos: ${totalProcessed}`);
}

// Função para formatar bytes em formato legível
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Função principal
async function main() {
  try {
    // Otimizar imagens
    await optimizeImages();
    
    // Comprimir arquivos estáticos
    await compressStaticFiles();
    
    console.log('\nOtimização de assets concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao otimizar assets:', error);
  }
}

// Executar função principal
main(); 