const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode')
const { Boom } = require('@hapi/boom')
const FileHelper = require('../helper/fileHelper')
const whatsappServices = require('../services/WhatsappServices')

const patchSession = "storage/auth";
async function connectToWhatsApp(sessionName, res = null,reconect = false, act = null) {
    const { state, saveCreds } = await useMultiFileAuthState(`./${patchSession}/${sessionName}`) // Crie uma pasta para cada sessão
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update

        if (qr && res) {
            if(reconect){
                sock.ev.removeAllListeners('connection.update')
                return res.status(404).json({
                    status: false,
                    message: 'Sessão inexistente: '+sessionName
                });
            }
            // Se recebeu QR, envia imagem PNG como resposta

            let defaultConfigStr = await defaultConfig(sessionName);

            FileHelper.createFile(`${patchSession}/${sessionName}/config.json`, JSON.stringify(defaultConfigStr, null, 2));
            const qrImage = await qrcode.toDataURL(qr)
            const base64Data = qrImage.replace(/^data:image\/png;base64,/, '')
            const imgBuffer = Buffer.from(base64Data, 'base64')
            try {
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': imgBuffer.length
                })
                return res.end(imgBuffer)
            } catch (error) {
                
            }
        }

        if (connection === 'open') {
            let configAtualizar = await FileHelper.readJson(`${patchSession}/${sessionName}/config.json`);
            configAtualizar.last_connection = new Date();
            if(reconect){
                act(sock);
            }else{
                // Atualizar config Session
            configAtualizar.connected = true;
            }
            FileHelper.createFile(`${patchSession}/${sessionName}/config.json`, JSON.stringify(configAtualizar, null, 2));

            
            setTimeout(() => {
                    console.log(`⏳ Encerrando sessão ${sessionName} após 30 segundos. \n\n\n\n\n\n\n\n\n\n`);
                    sock.ev.removeAllListeners('connection.update')
            }, 30 * 1000); 
        }

        if (connection === 'close') {
            
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode
            const shouldReconnect = reason !== DisconnectReason.loggedOut

            console.log(`❌ Conexão encerrada na sessão ${sessionName}:`, reason)

            if (shouldReconnect) {
                if(reconect){
                    return res.status(500).json({
                        status: false,
                        message: "Erro ao conectar na sessão"
                    });
                }else{
                    connectToWhatsApp(sessionName) // Reconecta automaticamente
                    session_start = false;
                }
            } else {
                if(reconect){
                    return res.status(410).json({
                        status: false,
                        message: "Erro ao iniciar a sessão"
                    });
                }else{
                    console.log('🔒 Sessão encerrada permanentemente (logged out) na', sessionName)
                    sock.ev.removeAllListeners('connection.update')
                    return res.status(404).json({
                        status: false,
                        message: 'Sessão fez logout permanente'
                    });
                }
            }
        }
    })

    return sock
}


async function defaultConfig(session_id) {
    let config = {
        created_at: new Date(),
        last_connection: null,
        connected : false,
        session_id: session_id,
        groups: [],
    }

    return config;
}


module.exports = {
    async runWithSocket(req, res, func) {
        const sessionName = req.query.sessionName || req.body.sessionName 
        let sock = await connectToWhatsApp(sessionName, res, true, async (sock) =>{
            func(req,res,sock)
        });
    },

    getQrCode(req, res) {
        const sessionName = req.query.sessionName || 'default' // Cada sessão tem um nome único
        connectToWhatsApp(sessionName, res)
    }
}
