/**
 * Script para verificar a performance do site
 * 
 * Este script utiliza o Lighthouse para gerar relatórios de performance
 * e identificar oportunidades de melhoria.
 * 
 * Uso: node scripts/performance-check.js
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configurações
const URL_TO_TEST = 'http://localhost:3000'; // URL para testar (servidor local)
const OUTPUT_DIR = path.join(__dirname, '../performance-reports');
const DATE_STRING = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const REPORT_PATH = path.join(OUTPUT_DIR, `performance-report-${DATE_STRING}.html`);
const JSON_REPORT_PATH = path.join(OUTPUT_DIR, `performance-report-${DATE_STRING}.json`);

// Criar diretório de saída se não existir
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Função para iniciar o servidor de preview
function startPreviewServer() {
  return new Promise((resolve, reject) => {
    console.log('Iniciando servidor de preview...');
    
    const server = exec('npm run preview', (error) => {
      if (error) {
        console.error('Erro ao iniciar o servidor:', error);
        reject(error);
      }
    });
    
    // Aguardar o servidor iniciar
    setTimeout(() => {
      console.log('Servidor de preview iniciado!');
      resolve(server);
    }, 5000);
  });
}

// Função para executar o Lighthouse
async function runLighthouse() {
  console.log(`Executando Lighthouse para ${URL_TO_TEST}...`);
  
  // Iniciar Chrome
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
  });
  
  // Configurar opções do Lighthouse
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port
  };
  
  // Executar Lighthouse
  const runnerResult = await lighthouse(URL_TO_TEST, options);
  
  // Salvar relatório HTML
  fs.writeFileSync(REPORT_PATH, runnerResult.report);
  
  // Salvar relatório JSON
  fs.writeFileSync(JSON_REPORT_PATH, JSON.stringify(runnerResult.lhr, null, 2));
  
  // Fechar Chrome
  await chrome.kill();
  
  return runnerResult.lhr;
}

// Função para analisar e exibir resultados
function analyzeResults(results) {
  console.log('\n===== RELATÓRIO DE PERFORMANCE =====\n');
  
  // Exibir pontuações
  console.log('PONTUAÇÕES:');
  console.log(`Performance: ${Math.round(results.categories.performance.score * 100)}/100`);
  console.log(`Acessibilidade: ${Math.round(results.categories.accessibility.score * 100)}/100`);
  console.log(`Melhores Práticas: ${Math.round(results.categories['best-practices'].score * 100)}/100`);
  console.log(`SEO: ${Math.round(results.categories.seo.score * 100)}/100`);
  console.log(`PWA: ${Math.round(results.categories.pwa.score * 100)}/100`);
  
  // Exibir métricas principais
  console.log('\nMÉTRICAS PRINCIPAIS:');
  console.log(`First Contentful Paint: ${results.audits['first-contentful-paint'].displayValue}`);
  console.log(`Largest Contentful Paint: ${results.audits['largest-contentful-paint'].displayValue}`);
  console.log(`Total Blocking Time: ${results.audits['total-blocking-time'].displayValue}`);
  console.log(`Cumulative Layout Shift: ${results.audits['cumulative-layout-shift'].displayValue}`);
  console.log(`Speed Index: ${results.audits['speed-index'].displayValue}`);
  
  // Exibir oportunidades de melhoria
  console.log('\nOPORTUNIDADES DE MELHORIA:');
  const opportunities = Object.values(results.audits)
    .filter(audit => audit.details && audit.details.type === 'opportunity' && !audit.score);
  
  if (opportunities.length === 0) {
    console.log('Nenhuma oportunidade de melhoria encontrada!');
  } else {
    opportunities.forEach(opportunity => {
      console.log(`- ${opportunity.title}: ${opportunity.displayValue || 'Verificar'}`);
    });
  }
  
  // Exibir caminho do relatório
  console.log(`\nRelatório completo salvo em: ${REPORT_PATH}`);
  console.log(`Relatório JSON salvo em: ${JSON_REPORT_PATH}`);
}

// Função principal
async function main() {
  let server;
  
  try {
    // Iniciar servidor de preview
    server = await startPreviewServer();
    
    // Executar Lighthouse
    const results = await runLighthouse();
    
    // Analisar e exibir resultados
    analyzeResults(results);
    
  } catch (error) {
    console.error('Erro ao executar o teste de performance:', error);
  } finally {
    // Encerrar servidor
    if (server) {
      server.kill();
      console.log('Servidor de preview encerrado.');
    }
  }
}

// Executar função principal
main(); 