const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const qrcode = require('qrcode')
const { Boom } = require('@hapi/boom')
const whatsappClient = require('../providers/whatsappClient')
const whatsappServices = require('../services/WhatsappServices');
const FileHelper = require('../helper/fileHelper')




module.exports = {
    status(req, res) {
        return res.json({ status: 'API WhatsApp Online' })
    },

    async createGroup(req, res) {
        whatsappClient.runWithSocket(req,res,(req, res, sock) => {
            whatsappServices.createGroup(req, res, sock);
        });
        
    },

    async sendMessage(req, res) {
        whatsappClient.runWithSocket(req,res,(req, res, sock) => {
            whatsappServices.sendMessage(req, res, sock);
        });
    },

    async sendMessageCaixa(req, res) {
        whatsappClient.runWithSocket(req,res,(req, res, sock) => {
            whatsappServices.primeiraMensagem(req, res, sock);
        });
    },
    
    async leaveGroup(req, res) {
        whatsappClient.runWithSocket(req,res,(req, res, sock) => {
            whatsappServices.leaveGroup(req, res, sock);
        });
    },

    async getMetaGroup(req, res){
        whatsappClient.runWithSocket(req,res,(req, res, sock) => {
            whatsappServices.getMetaGroup(req, res, sock);
        });
    },

    getQrCode(req, res) {
        whatsappClient.getQrCode(req, res);
    },

    getQrCodeRuntime(req, res) {
        whatsappClient.getQrCodeRuntime(req, res);
    },


    async logout(req, res) {
        whatsappClient.runWithSocket(req,res,(req, res, sock) => {
            whatsappServices.logout(req, res, sock);
        });
    },

    async deleteSession(req,res){
        const sessionName = req.query.sessionName || req.body.sessionName;
        const patchSession = "./storage/auth";
        
        await FileHelper.deleteFile(`${patchSession}/${sessionName}`);
        return res.json({
            status: true,
            message: "Sessão deletada",
        })
    }
}
