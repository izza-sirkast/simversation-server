const db = require("../configs/db-mysql.config.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { randomUUID } = require("crypto");
require('dotenv').config();

const createGroupChat = async (req, res) => {
    const {user_id} = req.user;
    const {group_chat_name, members} = req.body;

    try {
        const group_chat_id = Date.now().toString()+'-'+randomUUID();
        await db.query(`
            INSERT INTO GroupChats (group_chat_id, group_chat_name) VALUES (?, ?)
        `, [group_chat_id, group_chat_name]);
        
        // Invite members to the group chat
        for(let i = 0; i < members.length; i++){
            if(members[i] == user_id) {
                await db.query(`
                    INSERT INTO UserGroupChats (group_chat_id, user_id, user_role, verified) VALUES (?, ?, 'admin', 1)
                `, [group_chat_id, members[i]]);    
                continue;
            }
            await db.query(`
                INSERT INTO UserGroupChats (group_chat_id, user_id, user_role, verified) VALUES (?, ?, 'member', 0)
            `, [group_chat_id, members[i]]);
        }

        return res.status(201).json({message: 'Group chat created', group_chat_id});
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

const getGroupChatByGroupChatId = async (req, res) => {
    const {groupChatId} = req.params;

    try {
        const [groupChats] = await db.query(`
            SELECT gc.*
            FROM GroupChats gc
            WHERE group_chat_id = ?
        `, [groupChatId]);


        if(groupChats.length == 0){
            return res.status(404).json({message: 'Group chat not found'});
        }

        const groupChat = groupChats[0];
        return res.status(200).json({message: 'Group chats retrieved', groupChat });
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

const getGroupChatsByUserId = async (req, res) => {
    const {user_id} = req.user;

    try {
        const [groupChats] = await db.query(`
            SELECT gc.*
            FROM GroupChats gc
            JOIN UserGroupChats ugc USING(group_chat_id)
            WHERE user_id = ?
        `, [user_id]);

        return res.status(200).json({message: 'Group chats retrieved', groupChats});
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

const createChatLog = async (req, res) => {
    const {
        group_chat_id,
        sender_id,
        message,
        created_at,
        updated_at
    } = req.body;

    try {
        const result = await db.query(`
            INSERT INTO GroupChatLogs (group_chat_id, sender_id, message, created_at, updated_at) VALUES (?, ?, ?, ?, ?)
        `, [group_chat_id, sender_id, message, created_at, updated_at]);

        // Get that newly created chat log
        const [chatLogs] = await db.query(`
            SELECT *, u.username 
            FROM GroupChatLogs
            JOIN Users u ON GroupChatLogs.sender_id = u.user_id
            WHERE group_chat_log_id = ?
        `, [result[0].insertId]);

        // Return new chatlog
        const chatLog = chatLogs[0]
        return res.status(201).json({message: 'Chat log created', ...chatLog});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

const getChatLogsByGroupChatId = async (req, res) => {
    const {groupChatId} = req.params;

    try {
        const [chatLogs] = await db.query(`
            SELECT gcl.*, u.username
            FROM GroupChatLogs gcl 
            JOIN Users u ON gcl.sender_id = u.user_id
            WHERE group_chat_id = ?
            ORDER BY created_at ASC
        `, [groupChatId]);

        return res.status(200).json({message: 'Chat logs retrieved', chatLogs});
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports = {
    createGroupChat,
    getGroupChatsByUserId,
    createChatLog,
    getChatLogsByGroupChatId,
    getGroupChatByGroupChatId
}
