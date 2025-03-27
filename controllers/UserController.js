const db = require("../configs/db-mysql.config.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { randomUUID } = require("crypto");
require('dotenv').config();


const getAllUsers = async (req, res) => {
    const [users] = await db.query('SELECT * FROM users');
    return res.status(200).json(users);
}

const getByUsername = async (req, res) => {
    const {username} = req.params;
    const user = req.user;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE username LIKE ?', [`%${username}%`]);
        let filteredUsers = users.filter(u => u.username != user.username);
        if(filteredUsers.length == 0){
            return res.status(404).json({message: 'User not found'});
        }
        return res.status(200).json(filteredUsers);
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

// ============================ Authectication ============================
const generateToken = (user) => {
    return jwt.sign({user_id: user.user_id, username: user.username}, process.env.JWT_SECRET, {
        expiresIn: '1h'
    })
}

const register = async (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(15));
    const user_id = Date.now().toString()+'-'+randomUUID();

    try {
        // Check if username already exists
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if(users.length > 0){
            return res.status(400).json({err_id: 1, message: 'Username already exists'});
        }

        await db.query('INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)', [user_id, username, hashedPassword]);
        return res.status(201).json({message: 'User created successfully'});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

const login = async (req, res) => {
    const {username, password} = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = users[0];
        
        if(users.length == 0 || !bcrypt.compareSync(password, user.password)){
            return res.status(400).json({message : 'Username or password is incorrect'});
        }
        
        const token = generateToken(user);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Only send over https
            sameSite: 'Strict',
            maxAge: 1000 * 60 * 60
        })

        return res.status(200).json({message: 'Login Successful'})
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'})
    }
}

const logout = async (req, res) => {
    res.clearCookie('jwt');
    return res.status(200).json({message: 'Logout Successful'})
}

// Example protected route
const getProfile = async (req, res) => {
    const token = req.cookies.jwt;
    if(!token){
        return res.status(401).json({message: 'Unauthorized'})
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET);
        return res.status(200).json({user_id: user.user_id, username: user.username});
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized'})
    }
}

module.exports = {
    getAllUsers,
    getByUsername,
    register,
    login,
    logout,
    getProfile
}
