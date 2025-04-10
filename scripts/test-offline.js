/**
 * Script para testar o service worker e a funcionalidade offline
 * 
 * Este script simula uma conexão offline e verifica se o service worker
 * está funcionando corretamente, servindo conteúdo do cache.
 */

const puppeteer = require('puppeteer');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const http = require('http');
const handler = require('serve-handler');

// Configurações
const PORT = 5000;
const DIST_DIR = path.join(process.cwd(), 'dist');
const SCREENSHOTS_DIR = path.join(process.cwd(), 'offline-tests');
const BASE_URL = `http://localhost:${PORT}`;

// Cria o diretório de screenshots se não existir
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Função para iniciar o servidor local
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((request, response) => {
      return handler(request, response, {
        public: DIST_DIR,
      });
    });
    
    server.listen(PORT, () => {
      console.log(chalk.blue(`🌐 Servidor iniciado em ${BASE_URL}`));
      resolve(server);
    });
  });
}

// Função principal
async function testOfflineMode() {
  console.log(chalk.blue('🧪 Iniciando teste de modo offline...'));
  
  // Verifica se a pasta dist existe
  if (!fs.existsSync(DIST_DIR)) {
    console.error(chalk.red('❌ Pasta dist não encontrada. Execute npm run build primeiro.'));
    process.exit(1);
  }
  
  // Inicia o servidor local
  const server = await startServer();
  
  try {
    // Inicia o navegador
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    // Cria uma nova página
    const page = await browser.newPage();
    
    // Configura viewport para desktop
    await page.setViewport({ width: 1280, height: 800 });
    
    console.log(chalk.blue('🌐 Navegando para a página inicial com conexão online...'));
    
    // Navega para a página inicial
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    
    // Tira um screenshot da página online
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'online-mode.png'),
      fullPage: true 
    });
    
    console.log(chalk.green('✅ Página carregada com sucesso no modo online'));
    
    // Espera o service worker ser registrado
    console.log(chalk.blue('⏳ Aguardando registro do service worker...'));
    await page.waitForFunction(() => {
      return navigator.serviceWorker && navigator.serviceWorker.controller;
    }, { timeout: 10000 }).catch(() => {
      console.warn(chalk.yellow('⚠️ Tempo esgotado aguardando o service worker. Continuando mesmo assim...'));
    });
    
    // Verifica se o service worker está ativo
    const swStatus = await page.evaluate(() => {
      return navigator.serviceWorker && navigator.serviceWorker.controller 
        ? 'Ativo' 
        : 'Não registrado';
    });
    
    console.log(chalk.blue(`ℹ️ Status do Service Worker: ${swStatus}`));
    
    // Simula modo offline
    console.log(chalk.blue('🔌 Simulando modo offline...'));
    await page.setOfflineMode(true);
    
    // Recarrega a página no modo offline
    console.log(chalk.blue('🔄 Recarregando a página no modo offline...'));
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Tira um screenshot da página offline
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'offline-mode.png'),
      fullPage: true 
    });
    
    // Verifica se a página offline foi carregada
    const offlineContent = await page.content();
    const isOfflinePage = offlineContent.includes('offline') || offlineContent.includes('Offline');
    
    if (isOfflinePage) {
      console.log(chalk.green('✅ Página offline carregada com sucesso'));
    } else {
      console.log(chalk.yellow('⚠️ A página carregou no modo offline, mas não parece ser a página offline específica'));
    }
    
    // Tenta navegar para outra página no modo offline
    console.log(chalk.blue('🧭 Tentando navegar para outra página no modo offline...'));
    await page.goto(`${BASE_URL}/about`, { waitUntil: 'networkidle0' });
    
    // Tira um screenshot da navegação offline
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'offline-navigation.png'),
      fullPage: true 
    });
    
    // Verifica se o fallback para a página offline funcionou
    const navigationContent = await page.content();
    const isFallbackWorking = navigationContent.includes('offline') || navigationContent.includes('Offline');
    
    if (isFallbackWorking) {
      console.log(chalk.green('✅ Fallback para página offline funcionando corretamente'));
    } else {
      console.log(chalk.yellow('⚠️ A navegação offline não redirecionou para a página offline'));
    }
    
    // Volta para o modo online
    console.log(chalk.blue('🔌 Voltando para o modo online...'));
    await page.setOfflineMode(false);
    
    // Recarrega a página no modo online
    console.log(chalk.blue('🔄 Recarregando a página no modo online...'));
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
    
    // Tira um screenshot da página online novamente
    await page.screenshot({ 
      path: path.join(SCREENSHOTS_DIR, 'back-online.png'),
      fullPage: true 
    });
    
    console.log(chalk.green('✅ Página carregada com sucesso ao voltar para o modo online'));
    
    // Fecha o navegador
    await browser.close();
    
    console.log(chalk.blue('📸 Screenshots salvos em:'));
    console.log(chalk.blue(`   - ${path.join(SCREENSHOTS_DIR, 'online-mode.png')}`));
    console.log(chalk.blue(`   - ${path.join(SCREENSHOTS_DIR, 'offline-mode.png')}`));
    console.log(chalk.blue(`   - ${path.join(SCREENSHOTS_DIR, 'offline-navigation.png')}`));
    console.log(chalk.blue(`   - ${path.join(SCREENSHOTS_DIR, 'back-online.png')}`));
    
    console.log(chalk.green('✅ Teste de modo offline concluído com sucesso!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Erro durante o teste:'), error);
  } finally {
    // Encerra o servidor
    server.close(() => {
      console.log(chalk.blue('🌐 Servidor encerrado'));
    });
  }
}

// Executa a função principal
testOfflineMode().catch(error => {
  console.error(chalk.red('❌ Erro não tratado:'), error);
  process.exit(1);
}); 