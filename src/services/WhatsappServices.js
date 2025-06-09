
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


async function primeiraMensagem(req, res, sock) {
    await sock.sendMessage(
    "556196885273@s.whatsapp.net",
    {
        text: "AQUII:",
    }
);
}


async function leaveGroup(req,res,sock){
    try {
        const group_id = req.query.group_id || req.body.group_id 

        await sock.groupLeave(group_id);
        await sock.ws.close();
        await sock.ev.removeAllListeners('connection.update');
        return res.json({
            status: true,
            message: "Saiu do grupo",
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Erro ao sair do grupo",
            err: error,
        });
    }
}

async function getMetaGroup(req,res,sock){
    try {
        const group_id = req.query.group_id || req.body.group_id 
    
        const metadata = await sock.groupMetadata(group_id);
        await sock.ws.close();
        await sock.ev.removeAllListeners('connection.update')
        return res.json({
            status: true,
            message: "Grupo Resgatado",
            data: metadata
        })
    } catch (error) {
        await sock.ws.close();
        await sock.ev.removeAllListeners('connection.update')
        return res.status(500).json({
            status: false,
            message: "Erro no resgate do grupo",
            err: error,
        });
    }
    
};


async function formatMessage(msgUpdate){
    const message = msgUpdate.messages[0];
    const type = msgUpdate.type;

    if (!message || !message.message) return;

    const from = message.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const sender = isGroup ? message.key.participant : message.key.remoteJid;

    console.log('📩 Nova mensagem recebida de:', sender);

    // Exemplo: Responder "Olá!" se a mensagem for "oi"
    const messageContent = message.message?.conversation || 
                        message.message?.extendedTextMessage?.text || 
                        message.message?.imageMessage?.caption || '';

    
    console.log('\n📩 Mensagem: '+messageContent.toLowerCase()+"\n\n");
    // console.log(message.key, message.message);

    console.log(message.message);

    
    const response = {
        message_id: message.key.id,
        chat_id: message.key.remoteJid,
        acao: message.key.fromMe ? "enviado" : "recebido",
        type: 'desconhecido',
    }  

    const typeMap = {
        extendedTextMessage: {
            type:"texto",
            },
        stickerMessage:{
            type:"figurinha",
            },
        imageMessage:{
            type: "imagem",
            },
        audioMessage:{
            type: "audio",
        },
        conversation:{
            type: "texto",
        },
    };

    for (const key in typeMap) {
    if (message?.message?.[key]) {
            response.type = typeMap[key].type;
            response.text = messageContent;
            break; // Para evitar múltiplas atribuições
        }
    }
    
    // console.log(response);

    return response

}


async function logout(req,res,sock){
    sock.logout();
    await sock.ws.close();
    await sock.ev.removeAllListeners('connection.update')
    return res.json({
            status: true,
            message: "Sessão deslogada",
    })
}

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

async function runTimesendMessage(sock,message,chatId){

    // Converte para o formato JID do WhatsApp
    const jid = chatId;

    // Envia a mensagem
    await sock.sendMessage(jid, {
        text: message,
    });
}

module.exports = {
  createGroup,
  sendMessage,
  runTimesendMessage,
  getMetaGroup,
  logout,
  leaveGroup,
  formatMessage,
  primeiraMensagem
};
