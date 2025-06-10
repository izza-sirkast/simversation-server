const db = require("../configs/db-mysql.config.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { randomUUID } = require("crypto");
require('dotenv').config();

const getByUserId = async (req, res) => {
    const {user_1_id, user_2_id} = req.body;

    try {
        // Check if room already exist
        const [privateChats] = await db.query(`
                SELECT * FROM private_chats
                WHERE (user_1_id = ? AND user_2_id = ?) OR (user_1_id = ? AND user_2_id = ?)
            `, [user_1_id, user_2_id, user_2_id, user_1_id]);
        
        if(privateChats.length > 0){
            return res.status(200).json({message: 'Room exists', ...privateChats[0]});
        }

        // Else create new room
        const private_chat_id = Date.now().toString()+'-'+randomUUID();
        await db.query(`
            INSERT INTO private_chats (private_chat_id, user_1_id, user_2_id) VALUES (?, ?, ?)
        `, [private_chat_id, user_1_id, user_2_id]);
        return res.status(201).json({message: 'Room created', private_chat_id});
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

// Get all friends of a user: friends are other users that already have a chat room and have chatted with the user
const getFriends = async (req, res) => {
    const {userId} = req.params;
    try {
        const [friends] = await db.query(`
            SELECT pc.*
            FROM private_chats pc
            JOIN private_chat_logs pcl USING(private_chat_id)
            WHERE (user_1_id = ?) OR (user_2_id = ?)
            GROUP BY pc.private_chat_id;
        `, [userId, userId]);

        // Get the user details of the friends
        for(let i = 0; i < friends.length; i++){
            const friendId = friends[i].user_1_id == userId ? friends[i].user_2_id : friends[i].user_1_id;
            const [users] = await db.query(`
                SELECT u.user_id, u.username FROM users u WHERE user_id = ?
            `, [friendId]);
            friends[i].friend = users[0];
        }

        return res.status(200).json({message: 'Friends retrieved', friends});
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
} 

const createChatLog = async (req, res) => {
    const {
        private_chat_id,
        sender_id,
        message,
        created_at,
        updated_at
    } = req.body;

    try {
        const result = await db.query(`
            INSERT INTO private_chat_logs (private_chat_id, sender_id, message, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
        `, [private_chat_id, sender_id, message, created_at, updated_at]);

        // Get that newly created chat log
        const [chatLogs] = await db.query(`
            SELECT * FROM private_chat_logs WHERE private_chat_log_id = ?
        `, [result[0].insertId]);

        // Return new chatlog
        const chatLog = chatLogs[0]
        return res.status(201).json({message: 'Chat log created', ...chatLog});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

const getChatLogsByPrivateChatId = async (req, res) => {
    const {privateChatId} = req.params;

    try {
        const [chatLogs] = await db.query(`
            SELECT * FROM private_chat_logs 
            WHERE private_chat_id = ?
            ORDER BY created_at ASC
        `, [privateChatId]);

        return res.status(200).json({message: 'Chat logs retrieved', chatLogs});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports = {
    getByUserId,
    getFriends,
    createChatLog,
    getChatLogsByPrivateChatId
}
