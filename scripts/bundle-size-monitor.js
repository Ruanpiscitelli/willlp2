/**
 * Script para monitorar o tamanho do bundle
 * 
 * Este script analisa o tamanho dos bundles gerados e compara com limites predefinidos,
 * alertando quando os bundles ultrapassam os limites recomendados.
 * 
 * Uso: node scripts/bundle-size-monitor.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import chalk from 'chalk';
import zlib from 'zlib';
import { promisify } from 'util';

// Obter o diretório atual usando ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify zlib functions
const gzipPromise = promisify(zlib.gzip);
const brotliPromise = promisify(zlib.brotliCompress);

// Configurações
const DIST_DIR = path.join(__dirname, '../dist');
const STATS_FILE = path.join(__dirname, '../bundle-stats.json');
const BUNDLE_LIMITS = {
  js: {
    individual: 100 * 1024, // 100KB para arquivos JS individuais
    total: 300 * 1024, // 300KB para todos os JS
    critical: 150 * 1024 // 150KB para JS crítico (vendor + main)
  },
  css: {
    individual: 50 * 1024, // 50KB para arquivos CSS individuais
    total: 100 * 1024 // 100KB para todos os CSS
  },
  images: {
    individual: 200 * 1024, // 200KB para imagens individuais
    hero: 400 * 1024 // 400KB para imagens de hero
  }
};

// Função para formatar bytes em formato legível
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Função para verificar se o diretório dist existe
function checkDistDir() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(chalk.red('Diretório dist não encontrado. Execute o build antes de monitorar o tamanho do bundle.'));
    process.exit(1);
  }
}

// Função para analisar arquivos JS
async function analyzeJsFiles() {
  console.log(chalk.blue('\nAnalisando arquivos JavaScript...'));
  
  const jsFiles = glob.sync(`${DIST_DIR}/**/*.js`, { nodir: true });
  let totalSize = 0;
  let criticalSize = 0;
  const results = [];
  
  for (const file of jsFiles) {
    const content = fs.readFileSync(file);
    const size = content.length;
    totalSize += size;
    
    // Verificar se é um arquivo crítico (vendor ou main)
    const fileName = path.basename(file);
    const isCritical = fileName.includes('vendor') || fileName.includes('main');
    
    if (isCritical) {
      criticalSize += size;
    }
    
    // Comprimir para obter tamanho gzip e brotli
    const gzipped = await gzipPromise(content, { level: 9 });
    const brotlied = await brotliPromise(content, { 
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } 
    });
    
    results.push({
      file: path.relative(DIST_DIR, file),
      size,
      gzipSize: gzipped.length,
      brotliSize: brotlied.length,
      isCritical
    });
    
    // Verificar se excede o limite individual
    const exceedsLimit = size > BUNDLE_LIMITS.js.individual;
    const status = exceedsLimit ? chalk.red('EXCEDE LIMITE') : chalk.green('OK');
    
    console.log(
      `${chalk.cyan(path.basename(file))}: ` +
      `${chalk.yellow(formatBytes(size))} / ` +
      `Gzip: ${chalk.yellow(formatBytes(gzipped.length))} / ` +
      `Brotli: ${chalk.yellow(formatBytes(brotlied.length))} ` +
      `${isCritical ? chalk.magenta('[CRÍTICO] ') : ''}` +
      `${status}`
    );
  }
  
  // Verificar limites totais
  const exceedsTotalLimit = totalSize > BUNDLE_LIMITS.js.total;
  const exceedsCriticalLimit = criticalSize > BUNDLE_LIMITS.js.critical;
  
  console.log(
    `\nTotal JS: ${chalk.yellow(formatBytes(totalSize))} ` +
    `${exceedsTotalLimit ? chalk.red('(EXCEDE LIMITE)') : chalk.green('(OK)')}`
  );
  
  console.log(
    `JS Crítico: ${chalk.yellow(formatBytes(criticalSize))} ` +
    `${exceedsCriticalLimit ? chalk.red('(EXCEDE LIMITE)') : chalk.green('(OK)')}`
  );
  
  return {
    totalSize,
    criticalSize,
    files: results,
    exceedsTotalLimit,
    exceedsCriticalLimit
  };
}

// Função para analisar arquivos CSS
async function analyzeCssFiles() {
  console.log(chalk.blue('\nAnalisando arquivos CSS...'));
  
  const cssFiles = glob.sync(`${DIST_DIR}/**/*.css`, { nodir: true });
  let totalSize = 0;
  const results = [];
  
  for (const file of cssFiles) {
    const content = fs.readFileSync(file);
    const size = content.length;
    totalSize += size;
    
    // Comprimir para obter tamanho gzip e brotli
    const gzipped = await gzipPromise(content, { level: 9 });
    const brotlied = await brotliPromise(content, { 
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } 
    });
    
    results.push({
      file: path.relative(DIST_DIR, file),
      size,
      gzipSize: gzipped.length,
      brotliSize: brotlied.length
    });
    
    // Verificar se excede o limite individual
    const exceedsLimit = size > BUNDLE_LIMITS.css.individual;
    const status = exceedsLimit ? chalk.red('EXCEDE LIMITE') : chalk.green('OK');
    
    console.log(
      `${chalk.cyan(path.basename(file))}: ` +
      `${chalk.yellow(formatBytes(size))} / ` +
      `Gzip: ${chalk.yellow(formatBytes(gzipped.length))} / ` +
      `Brotli: ${chalk.yellow(formatBytes(brotlied.length))} ` +
      `${status}`
    );
  }
  
  // Verificar limite total
  const exceedsTotalLimit = totalSize > BUNDLE_LIMITS.css.total;
  
  console.log(
    `\nTotal CSS: ${chalk.yellow(formatBytes(totalSize))} ` +
    `${exceedsTotalLimit ? chalk.red('(EXCEDE LIMITE)') : chalk.green('(OK)')}`
  );
  
  return {
    totalSize,
    files: results,
    exceedsTotalLimit
  };
}

// Função para analisar imagens
function analyzeImages() {
  console.log(chalk.blue('\nAnalisando imagens...'));
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.avif'];
  const imageFiles = glob.sync(`${DIST_DIR}/**/*+(${imageExtensions.join('|')})`, { nodir: true });
  let totalSize = 0;
  const results = [];
  let largeImagesCount = 0;
  
  for (const file of imageFiles) {
    const stats = fs.statSync(file);
    const size = stats.size;
    totalSize += size;
    
    const fileName = path.basename(file);
    const isHero = fileName.includes('hero') || fileName.includes('banner') || fileName.includes('background');
    const limit = isHero ? BUNDLE_LIMITS.images.hero : BUNDLE_LIMITS.images.individual;
    
    results.push({
      file: path.relative(DIST_DIR, file),
      size,
      isHero
    });
    
    // Verificar se excede o limite
    const exceedsLimit = size > limit;
    if (exceedsLimit) {
      largeImagesCount++;
    }
    
    const status = exceedsLimit ? chalk.red('EXCEDE LIMITE') : chalk.green('OK');
    
    console.log(
      `${chalk.cyan(path.basename(file))}: ` +
      `${chalk.yellow(formatBytes(size))} ` +
      `${isHero ? chalk.magenta('[HERO] ') : ''}` +
      `${status}`
    );
  }
  
  console.log(`\nTotal de imagens: ${imageFiles.length}`);
  console.log(`Tamanho total: ${chalk.yellow(formatBytes(totalSize))}`);
  console.log(`Imagens grandes: ${largeImagesCount} (excedendo limites recomendados)`);
  
  return {
    totalSize,
    files: results,
    largeImagesCount
  };
}

// Função para salvar estatísticas
function saveStats(stats) {
  try {
    // Verificar se já existe um arquivo de estatísticas
    let previousStats = null;
    if (fs.existsSync(STATS_FILE)) {
      previousStats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
    }
    
    // Adicionar timestamp
    stats.timestamp = new Date().toISOString();
    
    // Comparar com estatísticas anteriores se disponíveis
    if (previousStats) {
      // Calcular diferenças
      stats.diff = {
        js: {
          totalSize: stats.js.totalSize - previousStats.js.totalSize,
          criticalSize: stats.js.criticalSize - previousStats.js.criticalSize
        },
        css: {
          totalSize: stats.css.totalSize - previousStats.css.totalSize
        },
        images: {
          totalSize: stats.images.totalSize - previousStats.images.totalSize,
          count: stats.images.files.length - previousStats.images.files.length
        }
      };
      
      // Exibir diferenças
      console.log(chalk.blue('\nComparação com build anterior:'));
      
      const jsChange = stats.diff.js.totalSize;
      console.log(
        `JS Total: ${jsChange >= 0 ? '+' : ''}${formatBytes(jsChange)} ` +
        `(${jsChange >= 0 ? chalk.red('↑') : chalk.green('↓')})`
      );
      
      const cssChange = stats.diff.css.totalSize;
      console.log(
        `CSS Total: ${cssChange >= 0 ? '+' : ''}${formatBytes(cssChange)} ` +
        `(${cssChange >= 0 ? chalk.red('↑') : chalk.green('↓')})`
      );
      
      const imagesChange = stats.diff.images.totalSize;
      console.log(
        `Imagens Total: ${imagesChange >= 0 ? '+' : ''}${formatBytes(imagesChange)} ` +
        `(${imagesChange >= 0 ? chalk.red('↑') : chalk.green('↓')})`
      );
    }
    
    // Salvar estatísticas
    fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));
    console.log(chalk.green(`\nEstatísticas salvas em ${STATS_FILE}`));
  } catch (error) {
    console.error(chalk.red(`Erro ao salvar estatísticas: ${error.message}`));
  }
}

// Função principal
async function main() {
  try {
    console.log(chalk.yellow('=== Monitor de Tamanho de Bundle ==='));
    
    // Verificar se o diretório dist existe
    checkDistDir();
    
    // Analisar arquivos JS
    const jsStats = await analyzeJsFiles();
    
    // Analisar arquivos CSS
    const cssStats = await analyzeCssFiles();
    
    // Analisar imagens
    const imageStats = analyzeImages();
    
    // Consolidar estatísticas
    const stats = {
      js: jsStats,
      css: cssStats,
      images: imageStats
    };
    
    // Salvar estatísticas
    saveStats(stats);
    
    // Verificar se há problemas
    const hasIssues = 
      jsStats.exceedsTotalLimit || 
      jsStats.exceedsCriticalLimit || 
      cssStats.exceedsTotalLimit || 
      imageStats.largeImagesCount > 0;
    
    if (hasIssues) {
      console.log(chalk.yellow('\n⚠️ Alguns arquivos excedem os limites recomendados. Considere otimizá-los.'));
    } else {
      console.log(chalk.green('\n✅ Todos os arquivos estão dentro dos limites recomendados.'));
    }
    
  } catch (error) {
    console.error(chalk.red(`\nErro: ${error.message}`));
    process.exit(1);
  }
}

// Executar o script
main(); 