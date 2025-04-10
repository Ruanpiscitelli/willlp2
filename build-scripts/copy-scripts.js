/**
 * Script para copiar arquivos JavaScript personalizados para a pasta pública
 * durante o processo de build.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual do módulo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretórios de origem e destino
const sourceDir = path.join(__dirname, '..', 'src', 'scripts');
const targetDir = path.join(__dirname, '..', 'public', 'scripts');

// Criar diretório de destino se não existir
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`✅ Diretório criado: ${targetDir}`);
}

// Copiar arquivos
try {
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    if (file.endsWith('.js')) {
      const sourcePath = path.join(sourceDir, file);
      const targetPath = path.join(targetDir, file);
      
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Arquivo copiado: ${file}`);
    }
  });
  
  console.log('✅ Todos os scripts foram copiados com sucesso!');
} catch (error) {
  console.error('❌ Erro ao copiar scripts:', error);
  process.exit(1);
} 