const express = require('express')
const router = express.Router()
const WhatsappController = require('../controllers/WhatsappController')

router.get('/qrcode', WhatsappController.getQrCode)



//get
router.get('/get/group', WhatsappController.getMetaGroup)

// send
router.get('/send/message', WhatsappController.sendMessage)

// create
router.post('/create/group', WhatsappController.createGroup)

// delete
router.delete('/delete/session', WhatsappController.deleteSession)



module.exports = router
