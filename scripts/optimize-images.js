/**
 * Script para otimização de imagens
 * 
 * Este script processa todas as imagens na pasta public/images e as converte para
 * formatos modernos (WebP e AVIF) com diferentes tamanhos para uso responsivo.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { glob } from 'glob';
import chalk from 'chalk';

// Configuração
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../public/images/optimized');
const sizes = [400, 800, 1200, 1600];
const formats = ['webp', 'avif', 'jpg'];
const quality = {
  webp: 80,
  avif: 65,
  jpg: 80
};

// Função principal
async function optimizeImages() {
  try {
    console.log(chalk.blue('🖼️ Iniciando otimização de imagens...'));
    
    // Criar diretório de saída se não existir
    await fs.mkdir(outputDir, { recursive: true });
    
    // Encontrar todas as imagens
    const imageFiles = await new Promise((resolve, reject) => {
      glob('**/*.{jpg,jpeg,png,gif}', { cwd: sourceDir }, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
    
    console.log(chalk.green(`Encontradas ${imageFiles.length} imagens para otimizar`));
    
    // Processar cada imagem
    for (const file of imageFiles) {
      const inputPath = path.join(sourceDir, file);
      const fileBaseName = path.basename(file, path.extname(file));
      const fileDir = path.dirname(file);
      const outputSubDir = path.join(outputDir, fileDir);
      
      // Criar subdiretório se necessário
      await fs.mkdir(outputSubDir, { recursive: true });
      
      // Carregar imagem com sharp
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      // Processar cada tamanho e formato
      for (const size of sizes) {
        // Pular tamanhos maiores que a imagem original
        if (size > metadata.width) continue;
        
        const resizedImage = image.clone().resize(size);
        
        for (const format of formats) {
          const outputFileName = `${fileBaseName}-${size}.${format}`;
          const outputPath = path.join(outputSubDir, outputFileName);
          
          // Converter e salvar
          await resizedImage
            .toFormat(format, { quality: quality[format] })
            .toFile(outputPath);
          
          console.log(chalk.cyan(`Processado: ${outputFileName}`));
        }
      }
      
      // Também salvar a imagem original otimizada
      const originalOutputPath = path.join(outputSubDir, path.basename(file));
      await image
        .toFormat(path.extname(file).substring(1), { quality: 85 })
        .toFile(originalOutputPath);
    }
    
    console.log(chalk.green('✅ Otimização de imagens concluída com sucesso!'));
    
    // Gerar estatísticas
    const originalSize = await calculateDirSize(sourceDir);
    const optimizedSize = await calculateDirSize(outputDir);
    const savings = originalSize - optimizedSize;
    const savingsPercentage = (savings / originalSize) * 100;
    
    console.log(chalk.yellow('📊 Estatísticas de otimização:'));
    console.log(chalk.yellow(`Tamanho original: ${formatBytes(originalSize)}`));
    console.log(chalk.yellow(`Tamanho otimizado: ${formatBytes(optimizedSize)}`));
    console.log(chalk.green(`Economia: ${formatBytes(savings)} (${savingsPercentage.toFixed(2)}%)`));
    
  } catch (error) {
    console.error(chalk.red('❌ Erro durante a otimização de imagens:'));
    console.error(error);
    process.exit(1);
  }
}

// Função para calcular o tamanho de um diretório
async function calculateDirSize(directory) {
  let totalSize = 0;
  
  const files = await new Promise((resolve, reject) => {
    glob('**/*', { cwd: directory, nodir: true }, (err, files) => {
      if (err) reject(err);
      else resolve(files);
    });
  });
  
  for (const file of files) {
    const stats = await fs.stat(path.join(directory, file));
    totalSize += stats.size;
  }
  
  return totalSize;
}

// Função para formatar bytes em unidades legíveis
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Executar o script
optimizeImages(); 