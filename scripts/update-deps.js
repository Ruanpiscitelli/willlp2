/**
 * Script para verificar e atualizar dependências
 * 
 * Este script verifica as versões das dependências do projeto
 * e sugere atualizações quando disponíveis.
 * 
 * Uso: node scripts/update-deps.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configurações
const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');
const IGNORE_PACKAGES = ['astro']; // Pacotes para ignorar na atualização automática

// Função para ler o package.json
function readPackageJson() {
  try {
    const packageJsonContent = fs.readFileSync(PACKAGE_JSON_PATH, 'utf8');
    return JSON.parse(packageJsonContent);
  } catch (error) {
    console.error('Erro ao ler package.json:', error.message);
    process.exit(1);
  }
}

// Função para verificar atualizações disponíveis
function checkUpdates() {
  console.log(chalk.blue('Verificando atualizações disponíveis...\n'));
  
  try {
    // Executar npm outdated e capturar a saída
    const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
    
    // Se não houver saída, não há atualizações
    if (!outdatedOutput || outdatedOutput.trim() === '') {
      console.log(chalk.green('✓ Todas as dependências estão atualizadas!'));
      return null;
    }
    
    // Converter a saída JSON em objeto
    const outdatedPackages = JSON.parse(outdatedOutput);
    
    // Formatar e exibir as atualizações disponíveis
    console.log(chalk.yellow('Atualizações disponíveis:\n'));
    
    const updates = {
      dependencies: {},
      devDependencies: {}
    };
    
    Object.keys(outdatedPackages).forEach(packageName => {
      const pkg = outdatedPackages[packageName];
      
      // Ignorar pacotes na lista de ignorados
      if (IGNORE_PACKAGES.includes(packageName)) {
        console.log(chalk.gray(`${packageName}: ${pkg.current} → ${pkg.latest} (ignorado)`));
        return;
      }
      
      // Determinar o tipo de dependência
      const packageJson = readPackageJson();
      let dependencyType = 'dependencies';
      
      if (packageJson.devDependencies && packageJson.devDependencies[packageName]) {
        dependencyType = 'devDependencies';
      }
      
      // Adicionar à lista de atualizações
      updates[dependencyType][packageName] = pkg.latest;
      
      // Exibir informações de atualização
      console.log(
        `${chalk.cyan(packageName)}: ${chalk.red(pkg.current)} → ${chalk.green(pkg.latest)} ` +
        `(${dependencyType})`
      );
    });
    
    return updates;
  } catch (error) {
    if (error.stdout && error.stdout.toString().trim() === '') {
      console.log(chalk.green('✓ Todas as dependências estão atualizadas!'));
      return null;
    }
    
    console.error('Erro ao verificar atualizações:', error.message);
    return null;
  }
}

// Função para atualizar dependências
function updateDependencies(updates) {
  if (!updates) return;
  
  console.log(chalk.blue('\nAtualizando dependências...\n'));
  
  const packageJson = readPackageJson();
  let updated = false;
  
  // Atualizar dependências regulares
  if (Object.keys(updates.dependencies).length > 0) {
    Object.keys(updates.dependencies).forEach(packageName => {
      if (packageJson.dependencies && packageJson.dependencies[packageName]) {
        packageJson.dependencies[packageName] = `^${updates.dependencies[packageName]}`;
        updated = true;
      }
    });
  }
  
  // Atualizar devDependencies
  if (Object.keys(updates.devDependencies).length > 0) {
    Object.keys(updates.devDependencies).forEach(packageName => {
      if (packageJson.devDependencies && packageJson.devDependencies[packageName]) {
        packageJson.devDependencies[packageName] = `^${updates.devDependencies[packageName]}`;
        updated = true;
      }
    });
  }
  
  // Salvar o package.json atualizado
  if (updated) {
    fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(chalk.green('✓ package.json atualizado com sucesso!'));
    console.log(chalk.yellow('\nExecute npm install para aplicar as atualizações.'));
  } else {
    console.log(chalk.yellow('Nenhuma dependência foi atualizada.'));
  }
}

// Função para verificar vulnerabilidades
function checkVulnerabilities() {
  console.log(chalk.blue('\nVerificando vulnerabilidades...\n'));
  
  try {
    const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
    const auditResult = JSON.parse(auditOutput);
    
    if (auditResult.metadata.vulnerabilities.total === 0) {
      console.log(chalk.green('✓ Nenhuma vulnerabilidade encontrada!'));
      return;
    }
    
    console.log(chalk.red(`Vulnerabilidades encontradas: ${auditResult.metadata.vulnerabilities.total}`));
    console.log(chalk.yellow('Execute npm audit fix para tentar corrigir automaticamente.'));
    
    // Exibir detalhes das vulnerabilidades
    if (auditResult.vulnerabilities) {
      console.log(chalk.yellow('\nDetalhes das vulnerabilidades:'));
      
      Object.keys(auditResult.vulnerabilities).forEach(vulnName => {
        const vuln = auditResult.vulnerabilities[vulnName];
        console.log(
          `\n${chalk.red(vulnName)} - Severidade: ${chalk.red(vuln.severity)}\n` +
          `Via: ${vuln.via.map(v => typeof v === 'string' ? v : v.name).join(', ')}\n` +
          `Descrição: ${vuln.title || 'Não disponível'}`
        );
      });
    }
  } catch (error) {
    if (error.stdout) {
      try {
        const auditResult = JSON.parse(error.stdout.toString());
        
        if (auditResult.metadata.vulnerabilities.total === 0) {
          console.log(chalk.green('✓ Nenhuma vulnerabilidade encontrada!'));
          return;
        }
        
        console.log(chalk.red(`Vulnerabilidades encontradas: ${auditResult.metadata.vulnerabilities.total}`));
        console.log(chalk.yellow('Execute npm audit fix para tentar corrigir automaticamente.'));
      } catch (e) {
        console.error('Erro ao analisar resultado do audit:', e.message);
      }
    } else {
      console.error('Erro ao verificar vulnerabilidades:', error.message);
    }
  }
}

// Função principal
function main() {
  console.log(chalk.blue.bold('=== Verificador de Dependências ===\n'));
  
  // Verificar atualizações
  const updates = checkUpdates();
  
  // Perguntar se deseja atualizar
  if (updates && (Object.keys(updates.dependencies).length > 0 || Object.keys(updates.devDependencies).length > 0)) {
    console.log(chalk.yellow('\nDeseja atualizar o package.json com estas versões? (s/n)'));
    
    // Simular uma resposta afirmativa para este exemplo
    const answer = 's';
    
    if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
      updateDependencies(updates);
    } else {
      console.log(chalk.yellow('Atualização cancelada pelo usuário.'));
    }
  }
  
  // Verificar vulnerabilidades
  checkVulnerabilities();
  
  console.log(chalk.blue.bold('\n=== Verificação concluída ==='));
}

// Executar função principal
main(); 