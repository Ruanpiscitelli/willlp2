/**
 * Script para verificar o status do Service Worker
 * 
 * Este script verifica se o service worker foi gerado corretamente
 * e se está funcionando como esperado.
 */

import { readFileSync, statSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';

// Caminho para o service worker gerado
const swPath = join(process.cwd(), 'dist', 'sw.js');

// Função principal
async function checkServiceWorker() {
  console.log(chalk.blue('🔍 Verificando o Service Worker...'));

  // Verifica se o arquivo do service worker existe
  if (!existsSync(swPath)) {
    console.error(chalk.red('❌ Service Worker não encontrado em dist/sw.js'));
    console.log(chalk.yellow('ℹ️ Execute "npm run generate-sw" para gerar o service worker.'));
    process.exit(1);
  }

  // Lê o conteúdo do service worker
  const swContent = readFileSync(swPath, 'utf8');
  
  // Verifica o tamanho do arquivo
  const swSize = statSync(swPath).size;
  const swSizeKB = (swSize / 1024).toFixed(2);
  
  console.log(chalk.green(`✅ Service Worker encontrado: ${swSizeKB} KB`));
  
  // Verifica se o service worker contém as estratégias de cache esperadas
  const hasCacheFirst = swContent.includes('CacheFirst');
  const hasStaleWhileRevalidate = swContent.includes('StaleWhileRevalidate');
  const hasNetworkFirst = swContent.includes('NetworkFirst');
  
  if (hasCacheFirst && hasStaleWhileRevalidate && hasNetworkFirst) {
    console.log(chalk.green('✅ Service Worker contém todas as estratégias de cache esperadas'));
  } else {
    console.warn(chalk.yellow('⚠️ Service Worker pode não conter todas as estratégias de cache esperadas'));
    if (!hasCacheFirst) console.warn(chalk.yellow('  - CacheFirst não encontrado'));
    if (!hasStaleWhileRevalidate) console.warn(chalk.yellow('  - StaleWhileRevalidate não encontrado'));
    if (!hasNetworkFirst) console.warn(chalk.yellow('  - NetworkFirst não encontrado'));
  }
  
  // Verifica se o arquivo de registro do service worker existe
  const registerSwPath = join(process.cwd(), 'public', 'js', 'register-sw.js');
  if (existsSync(registerSwPath)) {
    console.log(chalk.green('✅ Script de registro do Service Worker encontrado'));
  } else {
    console.error(chalk.red('❌ Script de registro do Service Worker não encontrado'));
    console.log(chalk.yellow('ℹ️ Crie o arquivo public/js/register-sw.js para registrar o service worker.'));
  }
  
  // Verifica se o service worker está sendo importado em algum arquivo HTML
  const distDir = join(process.cwd(), 'dist');
  const htmlFiles = findHtmlFiles(distDir);
  
  let swRegistered = false;
  for (const htmlFile of htmlFiles) {
    const htmlContent = readFileSync(htmlFile, 'utf8');
    if (htmlContent.includes('register-sw.js') || htmlContent.includes('sw.js')) {
      swRegistered = true;
      break;
    }
  }
  
  if (swRegistered) {
    console.log(chalk.green('✅ Service Worker está sendo importado em pelo menos um arquivo HTML'));
  } else {
    console.warn(chalk.yellow('⚠️ Service Worker não parece estar sendo importado em nenhum arquivo HTML'));
    console.log(chalk.yellow('ℹ️ Adicione uma referência ao script register-sw.js em seus arquivos HTML.'));
  }
  
  console.log(chalk.blue('🔍 Verificação do Service Worker concluída'));
}

// Função para encontrar arquivos HTML em um diretório
function findHtmlFiles(dir) {
  let results = [];
  const list = readdirSync(dir);
  
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(filePath));
    } else if (file.endsWith('.html')) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Executa a função principal
checkServiceWorker().catch(error => {
  console.error(chalk.red('❌ Erro ao verificar o Service Worker:'), error);
  process.exit(1);
}); 