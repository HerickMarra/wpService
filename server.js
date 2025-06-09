require('dotenv').config()
const app = require('./src/app')

const PORT = process.env.PORT || 3000

process.on('uncaughtException', (err) => {
  console.error('❌ Erro não tratado:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promessa rejeitada:', reason)
})

try {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`)
  })
} catch (err) {
  console.error('Erro ao iniciar o servidor:', err)
}
