const FileHelper = require('../helper/fileHelper')
const patchSession = "storage/auth";


async function  updateLastAccess(sessionName) {
    let configAtualizar = await FileHelper.readJson(`${patchSession}/${sessionName}/config.json`);
    configAtualizar.last_connection = new Date();
    FileHelper.createFile(`${patchSession}/${sessionName}/config.json`, JSON.stringify(configAtualizar, null, 2));
  }

  async function updateMessages(sessionName, message) {
    console.log(message.text, message);

    let configAtualizar = await FileHelper.readJson(`${patchSession}/${sessionName}/config.json`);

    // Garante que messages existe
    configAtualizar.messages = configAtualizar.messages || {};

    // Garante que a chave chat_id existe como array
    configAtualizar.messages[message.chat_id] = configAtualizar.messages[message.chat_id] || [];

    // Adiciona nova mensagem
    configAtualizar.messages[message.chat_id].push({
      role: message.acao === "recebido" ? "user" : "assistant",
      content: message.text,
      date: new Date(),
    });

    // Salva o arquivo atualizado
    FileHelper.createFile(`${patchSession}/${sessionName}/config.json`, JSON.stringify(configAtualizar, null, 2));

    return configAtualizar.messages[message.chat_id];
  }
module.exports = {
    updateLastAccess,
    updateMessages
};
