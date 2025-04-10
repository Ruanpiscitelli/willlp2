/**
 * Script para injetar o registro do Service Worker nos arquivos HTML
 * 
 * Este script adiciona a tag de script para registrar o service worker
 * em todos os arquivos HTML gerados na pasta dist.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

// Função principal
async function injectServiceWorkerRegistration() {
  console.log(chalk.blue('🔧 Injetando registro do Service Worker nos arquivos HTML...'));

  // Encontra todos os arquivos HTML na pasta dist
  const htmlFiles = await glob('dist/**/*.html');
  
  if (htmlFiles.length === 0) {
    console.warn(chalk.yellow('⚠️ Nenhum arquivo HTML encontrado na pasta dist.'));
    return;
  }
  
  console.log(chalk.blue(`Encontrados ${htmlFiles.length} arquivos HTML.`));
  
  // Tag de script para registrar o service worker
  const scriptTag = `
<!-- Service Worker Registration -->
<script type="module" src="/js/register-sw.js"></script>
`;
  
  let modifiedCount = 0;
  
  // Processa cada arquivo HTML
  for (const htmlFile of htmlFiles) {
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    // Verifica se o arquivo já contém o registro do service worker
    if (content.includes('register-sw.js')) {
      console.log(chalk.yellow(`Arquivo já contém o registro: ${htmlFile}`));
      continue;
    }
    
    // Insere a tag de script antes do fechamento do body
    if (content.includes('</body>')) {
      content = content.replace('</body>', `${scriptTag}</body>`);
      fs.writeFileSync(htmlFile, content);
      modifiedCount++;
      console.log(chalk.green(`✅ Registro injetado em: ${htmlFile}`));
    } else {
      console.warn(chalk.yellow(`⚠️ Não foi possível encontrar a tag </body> em: ${htmlFile}`));
    }
  }
  
  console.log(chalk.blue(`🔧 Registro do Service Worker injetado em ${modifiedCount} de ${htmlFiles.length} arquivos HTML.`));
}

// Executa a função principal
injectServiceWorkerRegistration().catch(error => {
  console.error(chalk.red('❌ Erro ao injetar o registro do Service Worker:'), error);
  process.exit(1);
}); 