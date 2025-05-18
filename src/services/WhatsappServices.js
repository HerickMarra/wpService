
const FileHelper = require('../helper/fileHelper')

const patchSession = "storage/auth";

async function createGroup(req,res,sock){
    try {
        const group = await sock.groupCreate("Meu grup", [])
    
        await sock.updateProfilePicture(group.id, { url: './profile.jpg' })
        await sock.sendMessage(group.id, { text: 'Meu primeiro grupo' })
        await sock.ws.close();
        await sock.ev.removeAllListeners('connection.update')

        // Salvando grupo nas configs
        const sessionName = req.query.sessionName || req.body.sessionName 
        let configAtualizar = await FileHelper.readJson(`${patchSession}/${sessionName}/config.json`);
        
        if (!('groups' in configAtualizar)) {
            configAtualizar.groups = {};
        }

        configAtualizar.groups[group.id] = group;
        FileHelper.createFile(`${patchSession}/${sessionName}/config.json`, JSON.stringify(configAtualizar, null, 2));


        return res.json({
            status: true,
            message: "Grupo criado com suscesso",
            group_id: group.id,
        })

    } catch (error) {
         return res.status(500).json({
            status: false,
            message: "Erro na criação do grupo",
            err: error,
        });
    }
};

async function getMetaGroup(req,res,sock){
    const group_id = req.query.group_id || req.body.group_id 
    
    const metadata = await sock.groupMetadata(group_id);
    return res.json({
        status: true,
        message: "Mensagem Enviada",
        data: metadata
    })
};

async function sendMessage(req,res,sock){
    // Número de destino no formato internacional, SEM "+" e SEM espaços
    const number = '556196885273'; // Exemplo: Brasil (55) + São Paulo (11) + número

    // Converte para o formato JID do WhatsApp
    const jid = number + '@s.whatsapp.net';

    // Envia a mensagem
    await sock.sendMessage(jid, {
        text: 'Olá! Esta é uma mensagem automática enviada via Baileys.'
    });

    await sock.ws.close();
    await sock.ev.removeAllListeners('connection.update')

     return res.json({
        status: true,
        message: "Mensagem Enviada",
    })
}

module.exports = {
  createGroup,
  sendMessage,
  getMetaGroup
};
