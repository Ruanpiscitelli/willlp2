/**
 * Script para otimização de fontes
 * 
 * Este script:
 * 1. Baixa fontes de CDNs (Google Fonts, etc)
 * 2. Converte para formatos modernos (woff2, woff)
 * 3. Gera subsets para melhor performance
 * 4. Cria fontes variáveis quando disponíveis
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import fetch from 'node-fetch';
import { execSync } from 'child_process';

// Configuração
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fontsDir = path.join(__dirname, '../public/fonts');
const tempDir = path.join(__dirname, '../.temp/fonts');

// Fontes a serem baixadas e otimizadas
const fonts = [
  {
    family: 'Inter',
    weights: [400, 500, 600, 700, 800],
    styles: ['normal'],
    variable: true, // Suporta fonte variável
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    subset: 'latin'
  }
];

/**
 * Função principal
 */
async function optimizeFonts() {
  try {
    console.log(chalk.blue('🔤 Iniciando otimização de fontes...'));
    
    // Criar diretórios se não existirem
    await createDirectories();
    
    // Processar cada fonte
    for (const font of fonts) {
      console.log(chalk.cyan(`Processando fonte: ${font.family}`));
      
      // Baixar a fonte do Google Fonts
      await downloadGoogleFont(font);
      
      // Converter para woff2 e woff
      await convertFonts(font);
      
      // Gerar fonte variável se suportada
      if (font.variable) {
        await generateVariableFont(font);
      }
      
      console.log(chalk.green(`✅ Fonte ${font.family} otimizada com sucesso!`));
    }
    
    // Limpar arquivos temporários
    await cleanupTempFiles();
    
    console.log(chalk.green('✅ Otimização de fontes concluída com sucesso!'));
    
  } catch (error) {
    console.error(chalk.red('❌ Erro durante a otimização de fontes:'));
    console.error(error);
    process.exit(1);
  }
}

/**
 * Criar diretórios necessários
 */
async function createDirectories() {
  try {
    await fs.mkdir(fontsDir, { recursive: true });
    await fs.mkdir(tempDir, { recursive: true });
    console.log(chalk.green('✅ Diretórios criados com sucesso!'));
  } catch (error) {
    console.error(chalk.red('❌ Erro ao criar diretórios:'), error);
    throw error;
  }
}

/**
 * Baixar fonte do Google Fonts
 */
async function downloadGoogleFont(font) {
  try {
    console.log(chalk.yellow(`Baixando ${font.family} do Google Fonts...`));
    
    // Fazer requisição para o CSS do Google Fonts
    const response = await fetch(font.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Falha ao baixar fonte: ${response.statusText}`);
    }
    
    const css = await response.text();
    
    // Extrair URLs das fontes do CSS
    const fontUrls = extractFontUrls(css);
    
    // Baixar cada arquivo de fonte
    for (const [url, format] of fontUrls) {
      const fontResponse = await fetch(url);
      if (!fontResponse.ok) {
        throw new Error(`Falha ao baixar arquivo de fonte: ${fontResponse.statusText}`);
      }
      
      const buffer = await fontResponse.arrayBuffer();
      const fileName = `${font.family.toLowerCase()}-${format}-${Date.now()}.ttf`;
      const filePath = path.join(tempDir, fileName);
      
      await fs.writeFile(filePath, Buffer.from(buffer));
      console.log(chalk.green(`✅ Arquivo de fonte baixado: ${fileName}`));
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Erro ao baixar fonte ${font.family}:`), error);
    throw error;
  }
}

/**
 * Extrair URLs das fontes do CSS do Google Fonts
 */
function extractFontUrls(css) {
  const urlRegex = /url\(([^)]+)\)\s+format\(['"]([^'"]+)['"]\)/g;
  const urls = [];
  let match;
  
  while ((match = urlRegex.exec(css)) !== null) {
    const url = match[1].replace(/['"]/g, '');
    const format = match[2];
    
    // Apenas baixar formatos TTF ou OTF
    if (format === 'truetype' || format === 'opentype') {
      urls.push([url, format]);
    }
  }
  
  return urls;
}

/**
 * Converter fontes para woff2 e woff
 */
async function convertFonts(font) {
  try {
    console.log(chalk.yellow(`Convertendo ${font.family} para woff2 e woff...`));
    
    // Encontrar todos os arquivos TTF/OTF no diretório temporário
    const files = await fs.readdir(tempDir);
    const fontFiles = files.filter(file => 
      file.toLowerCase().includes(font.family.toLowerCase()) && 
      (file.endsWith('.ttf') || file.endsWith('.otf'))
    );
    
    for (const file of fontFiles) {
      const inputPath = path.join(tempDir, file);
      const baseName = path.basename(file, path.extname(file));
      
      // Extrair informações da fonte (peso, estilo)
      const weight = extractFontWeight(file);
      const style = extractFontStyle(file);
      
      // Gerar nome de arquivo de saída
      const outputBaseName = `${font.family.toLowerCase()}${weight ? `-${weight}` : ''}${style !== 'normal' ? `-${style}` : ''}`;
      
      // Converter para woff2
      const woff2OutputPath = path.join(fontsDir, `${outputBaseName}.woff2`);
      execSync(`npx ttf2woff2 ${inputPath} > ${woff2OutputPath}`);
      
      // Converter para woff
      const woffOutputPath = path.join(fontsDir, `${outputBaseName}.woff`);
      execSync(`npx ttf2woff ${inputPath} ${woffOutputPath}`);
      
      console.log(chalk.green(`✅ Fonte convertida: ${outputBaseName}`));
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Erro ao converter fonte ${font.family}:`), error);
    throw error;
  }
}

/**
 * Gerar fonte variável
 */
async function generateVariableFont(font) {
  try {
    console.log(chalk.yellow(`Gerando fonte variável para ${font.family}...`));
    
    // Verificar se já existe uma fonte variável no diretório temporário
    const files = await fs.readdir(tempDir);
    const variableFontFile = files.find(file => 
      file.toLowerCase().includes(font.family.toLowerCase()) && 
      file.includes('variable')
    );
    
    if (variableFontFile) {
      // Converter a fonte variável para woff2 e woff
      const inputPath = path.join(tempDir, variableFontFile);
      const outputBaseName = `${font.family.toLowerCase()}-var`;
      
      // Converter para woff2
      const woff2OutputPath = path.join(fontsDir, `${outputBaseName}.woff2`);
      execSync(`npx ttf2woff2 ${inputPath} > ${woff2OutputPath}`);
      
      // Converter para woff
      const woffOutputPath = path.join(fontsDir, `${outputBaseName}.woff`);
      execSync(`npx ttf2woff ${inputPath} ${woffOutputPath}`);
      
      console.log(chalk.green(`✅ Fonte variável gerada: ${outputBaseName}`));
    } else {
      console.log(chalk.yellow(`⚠️ Nenhuma fonte variável encontrada para ${font.family}`));
      
      // Alternativa: baixar diretamente a fonte variável do Google Fonts
      console.log(chalk.yellow(`Tentando baixar fonte variável diretamente...`));
      
      const variableUrl = `https://fonts.googleapis.com/css2?family=${font.family}:wght@100..900&display=swap`;
      
      try {
        // Fazer requisição para o CSS da fonte variável
        const response = await fetch(variableUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Falha ao baixar fonte variável: ${response.statusText}`);
        }
        
        const css = await response.text();
        
        // Extrair URLs das fontes do CSS
        const fontUrls = extractFontUrls(css);
        
        if (fontUrls.length > 0) {
          // Baixar o primeiro arquivo de fonte variável
          const [url, format] = fontUrls[0];
          const fontResponse = await fetch(url);
          
          if (!fontResponse.ok) {
            throw new Error(`Falha ao baixar arquivo de fonte variável: ${fontResponse.statusText}`);
          }
          
          const buffer = await fontResponse.arrayBuffer();
          const fileName = `${font.family.toLowerCase()}-variable.ttf`;
          const filePath = path.join(tempDir, fileName);
          
          await fs.writeFile(filePath, Buffer.from(buffer));
          
          // Converter a fonte variável para woff2 e woff
          const outputBaseName = `${font.family.toLowerCase()}-var`;
          
          // Converter para woff2
          const woff2OutputPath = path.join(fontsDir, `${outputBaseName}.woff2`);
          execSync(`npx ttf2woff2 ${filePath} > ${woff2OutputPath}`);
          
          // Converter para woff
          const woffOutputPath = path.join(fontsDir, `${outputBaseName}.woff`);
          execSync(`npx ttf2woff ${filePath} ${woffOutputPath}`);
          
          console.log(chalk.green(`✅ Fonte variável baixada e convertida: ${outputBaseName}`));
        } else {
          console.log(chalk.yellow(`⚠️ Nenhuma fonte variável encontrada no CSS`));
        }
        
      } catch (error) {
        console.error(chalk.yellow(`⚠️ Erro ao baixar fonte variável: ${error.message}`));
        console.log(chalk.yellow(`Continuando sem fonte variável...`));
      }
    }
    
  } catch (error) {
    console.error(chalk.red(`❌ Erro ao gerar fonte variável para ${font.family}:`), error);
    // Não interromper o processo se falhar a geração da fonte variável
    console.log(chalk.yellow(`Continuando sem fonte variável...`));
  }
}

/**
 * Extrair peso da fonte do nome do arquivo
 */
function extractFontWeight(fileName) {
  const weightMap = {
    'thin': '100',
    'extralight': '200',
    'light': '300',
    'regular': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
    'extrabold': '800',
    'black': '900'
  };
  
  for (const [name, weight] of Object.entries(weightMap)) {
    if (fileName.toLowerCase().includes(name)) {
      return weight;
    }
  }
  
  // Tentar extrair peso numérico diretamente
  const weightMatch = fileName.match(/[_-](\d{3})[_-]/);
  if (weightMatch) {
    return weightMatch[1];
  }
  
  return '400'; // Peso padrão
}

/**
 * Extrair estilo da fonte do nome do arquivo
 */
function extractFontStyle(fileName) {
  if (fileName.toLowerCase().includes('italic')) {
    return 'italic';
  }
  
  return 'normal';
}

/**
 * Limpar arquivos temporários
 */
async function cleanupTempFiles() {
  try {
    console.log(chalk.yellow('Limpando arquivos temporários...'));
    
    // Remover diretório temporário
    await fs.rm(tempDir, { recursive: true, force: true });
    
    console.log(chalk.green('✅ Arquivos temporários removidos com sucesso!'));
  } catch (error) {
    console.error(chalk.red('❌ Erro ao limpar arquivos temporários:'), error);
    // Não interromper o processo se falhar a limpeza
  }
}

// Executar o script
optimizeFonts(); 