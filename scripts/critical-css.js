/**
 * Script para extração de CSS crítico
 * 
 * Este script extrai o CSS crítico para renderização acima da dobra
 * e o injeta diretamente no HTML para melhorar o LCP.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import { generate } from 'critical';
import chalk from 'chalk';

// Configuração
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');

// Função principal
async function extractCriticalCSS() {
  try {
    console.log(chalk.blue('🎨 Iniciando extração de CSS crítico...'));
    
    // Encontrar todos os arquivos HTML
    const htmlFiles = await glob('**/*.html', { cwd: distDir });
    
    console.log(chalk.green(`Encontrados ${htmlFiles.length} arquivos HTML para processar`));
    
    // Processar cada arquivo HTML
    for (const file of htmlFiles) {
      const filePath = path.join(distDir, file);
      console.log(chalk.cyan(`Processando: ${file}`));
      
      // Extrair CSS crítico
      const options = {
        base: distDir,
        src: file,
        target: file,
        dimensions: [
          {
            width: 375,
            height: 667
          },
          {
            width: 1024,
            height: 768
          },
          {
            width: 1920,
            height: 1080
          }
        ],
        ignore: {
          atrule: ['@font-face']
        },
        penthouse: {
          timeout: 120000, // 2 minutos
          puppeteer: {
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--disable-gpu',
              '--window-size=1920,1080',
              '--disable-web-security',
              '--disable-features=IsolateOrigins,site-per-process',
              '--disable-site-isolation-trials'
            ],
            headless: 'new',
            defaultViewport: {
              width: 1920,
              height: 1080
            },
            timeout: 120000
          }
        }
      };
      
      const result = await generate(options);
      
      // Salvar o resultado
      await fs.writeFile(filePath, result.html);
      
      console.log(chalk.green(`✅ CSS crítico extraído para: ${file}`));
    }
    
    console.log(chalk.green('✅ Extração de CSS crítico concluída com sucesso!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Erro durante a extração de CSS crítico:'));
    console.error(error);
    process.exit(1);
  }
}

// Executar o script
extractCriticalCSS(); 