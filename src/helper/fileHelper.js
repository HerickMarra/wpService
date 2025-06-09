const fs = require('fs').promises;
const path = require('path');

/**
 * Resolve o caminho absoluto do arquivo
 */
function resolvePath(filePath) {
  return path.resolve(filePath);
}

/**
 * Lê qualquer arquivo como string
 */
async function readFile(filePath) {
  const fullPath = resolvePath(filePath);
  return fs.readFile(fullPath, 'utf-8');
}

/**
 * deleta uma pasta ou arquivo
 */
async function deleteFile(filePath) {
  const fullPath = resolvePath(filePath);
  return await fs.rm(fullPath, { recursive: true, force: true });
}


/**
 * deleta uma pasta ou arquivo
 */
async function existsFile(filePath) {
  const fullPath = resolvePath(filePath);
  return fs.existsSync(fullPath);
}


/**
 * Escreve uma string em um arquivo (sobrescreve)
 */
async function writeFile(filePath, content) {
  const fullPath = resolvePath(filePath);
  await fs.writeFile(fullPath, content, 'utf-8');
}

/**
 * Lê e parseia um arquivo JSON
 */
async function readJson(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erro ao ler ou parsear o arquivo JSON:', error);
  }
}

/**
 * Escreve um objeto como JSON no arquivo
 */
async function writeJson(filePath, data) {
  const jsonString = JSON.stringify(data, null, 2);
  await writeFile(filePath, jsonString);
}

/**
 * Atualiza um JSON (lê, modifica com callback e salva)
 */
async function updateJson(filePath, updateFn) {
  const data = await readJson(filePath);
  const updated = updateFn(data);
  await writeJson(filePath, updated);
}

/**
 * Verifica se um arquivo existe
 */
async function fileExists(filePath) {
  try {
    await fs.access(resolvePath(filePath));
    return true;
  } catch {
    return false;
  }
}

async function createFile(filePath, content = '') {
  const fullPath = resolvePath(filePath);
  const exists = await fileExists(fullPath);
  await writeFile(fullPath, content);
}

module.exports = {
  readFile,
  writeFile,
  readJson,
  writeJson,
  updateJson,
  fileExists,
  createFile,
  deleteFile,
  existsFile,
};
