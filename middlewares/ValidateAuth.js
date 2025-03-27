const db = require('../configs/db-mysql.config.js');
const jwt = require('jsonwebtoken');

// Validate Auth
const validateAuth = async (req, res, next) => {
    const token = req.cookies.jwt;
    if(!token){
        return res.status(401).json({message: 'Unauthorized'})
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized'})
    }
}

module.exports = validateAuth;