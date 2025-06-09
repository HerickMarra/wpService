const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode')
const { Boom } = require('@hapi/boom')
const FileHelper = require('../helper/fileHelper')
const whatsappServices = require('../services/WhatsappServices')
const WhatsappSessionService = require('../services/WhatsappSessionService')
const openRouterClient = require('../providers/openRouterClient')
const memoria = {};

const patchSession = "storage/auth";
async function connectToWhatsApp(sessionName, res, reconect, callback, runtime) {
    console.log(runtime);
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

             if(runtime){
                    console.log('\n\n\n📩 Runtime Ativado\n\n\n');
                    
                sock.ev.on('messages.upsert', async (msgUpdate) => {
                    
                    let resp = await whatsappServices.formatMessage(msgUpdate);

                    let updtateMessages = await WhatsappSessionService.updateMessages(sessionName,resp);
                    if(resp.acao != "enviado"){
                        let response = await openRouterClient.startChat(updtateMessages);

                            if(isValidJSON(response.data.choices[0].message.content)){
                                let pedido = gerarNumeroAleatorio9Digitos();
                                const data = JSON.parse(response.data.choices[0].message.content);
                                whatsappServices.runTimesendMessage(sock,`PEDIDO CONFIRMADO || COD: ${pedido}\nValor Total: ${data.valor_total}\npara acompanhar seu pedido acesse:\nhttps://wpservice.onrender.com/`,resp.chat_id);
                                memoria[pedido] = data;
                                await axios.post(
                                        'http://wpservice.onrender.com/api/whatsapp/savepedido',
                                        {
                                            pedido: pedido,
                                            json: data
                                        },
                                {
                                    headers: {
                                    'Authorization': `Bearer ${api_key}`,
                                    'Content-Type': 'application/json'
                                    }
                                }
                                );
                            }else{
                                whatsappServices.runTimesendMessage(sock,response.data.choices[0].message.content,resp.chat_id);
                            }
                            
                    }
                    
                });
                return res.status(200).json({
                        status: true,
                        message: 'Sessão iniciada: '+sessionName
                });
            }
            
            if(reconect){
                callback(sock);
                WhatsappSessionService.updateLastAccess(sessionName)
            }else{
                // Atualizar config Session

            }

            
            // setTimeout(() => {
            //         console.log(`⏳ Encerrando sessão ${sessionName} após 30 segundos. \n\n\n\n\n\n\n\n\n\n`);
            //         sock.ev.removeAllListeners('connection.update')
            // }, 30 * 1000); 
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

 function isValidJSON(str) {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
  } catch (e) {
    return false;
  }
}

function gerarNumeroAleatorio9Digitos() {
  const num = Math.floor(Math.random() * 1_000_000_000); // 0 até 999999999
  return num.toString().padStart(9, '0'); // Preenche com zeros à esquerda até ter 9 dígitos
}


async function defaultConfig(session_id) {
    let config = {
        created_at: new Date(),
        last_connection: null,
        start_connected : false,
        session_id: session_id,
        groups: [],
        messages:[]
    }

    return config;
}


module.exports = {
    async runWithSocket(req, res, func) {
        const sessionName = req.query.sessionName || req.body.sessionName 
        let sock = await connectToWhatsApp(sessionName, res, true, async (sock) =>{
            func(req,res,sock)
        },false);
    },

    async getPedido(req, res){
        const pedido = req.query.pedido || req.body.pedido 
         return res.status(200).json(memoria[pedido] || {});
    },  

    async savePedido(req, res){
        const pedido = req.query.pedido || req.body.pedido 
        const json = req.query.json || req.body.json 
        memoria[pedido] = json;
        return res.status(200).json({
            status: true,
            message: "Pedido Salvo"
        });
    },  

    async getQrCodeRuntime(req, res) {
        const sessionName = req.query.sessionName || req.body.sessionName 
        let sock = await connectToWhatsApp(sessionName, res, false, async (sock) =>{
        },true);
    },

    getQrCode(req, res) {
        const sessionName = req.query.sessionName || 'default'; // Cada sessão tem um nome único
        connectToWhatsApp(sessionName, res, false, () => {}, false);
    }
}
