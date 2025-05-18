function auth(req, res, next) {
    // console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    res.status(401).json({ error: 'Não autorizado' });
    next(); // Continua para o próximo middleware ou rota
}

module.exports = auth;