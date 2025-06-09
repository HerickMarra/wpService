const express = require('express')
const router = express.Router()
const WhatsappController = require('../controllers/WhatsappController')

router.get('/qrcode', WhatsappController.getQrCode)
router.get('/qrcode/runtime', WhatsappController.getQrCodeRuntime)



//get
router.get('/get/group', WhatsappController.getMetaGroup)

// send
router.get('/send/message', WhatsappController.sendMessage)
router.get('/send/message/caixa', WhatsappController.sendMessageCaixa)

// create
router.post('/create/group', WhatsappController.createGroup)

// delete
router.delete('/delete/session', WhatsappController.deleteSession)
router.delete('/leave/group', WhatsappController.leaveGroup)
router.post('/logout', WhatsappController.logout)



module.exports = router
