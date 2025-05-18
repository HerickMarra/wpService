const express = require('express')
const cors = require('cors')
const whatsappRoutes = require('./routes/whatsapp.routes')
const auth = require('./middlewares/auth');

const app = express()
app.use(cors())
app.use(express.json())
// app.use(auth)

app.use('/api/whatsapp', whatsappRoutes)

module.exports = app
