const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const db = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
}).promise();

const createDatabase = () => {
    const createDatabasesQuery = [
        {
            name: 'users',
            query: `
                CREATE TABLE IF NOT EXISTS users (
                    user_id varchar(50) PRIMARY KEY,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'private_chats',
            query: `
                CREATE TABLE IF NOT EXISTS private_chats (
                    private_chat_id varchar(50) PRIMARY KEY,
                    user_1_id varchar(50) NOT NULL,
                    user_2_id varchar(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_1_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    FOREIGN KEY (user_2_id) REFERENCES users(user_id) ON DELETE CASCADE                  
                )
            `
        },
        {
            name: 'private_chat_logs',
            query: `
                CREATE TABLE IF NOT EXISTS private_chat_logs (
                    private_chat_log_id INT PRIMARY KEY AUTO_INCREMENT,
                    private_chat_id varchar(50) NOT NULL,
                    sender_id varchar(50) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (private_chat_id) REFERENCES private_chats(private_chat_id) ON DELETE CASCADE,
                    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
                )
            `
        },
        {
            name: 'group_chats',
            query: `
                CREATE TABLE IF NOT EXISTS group_chats (
                    group_chat_id varchar(50) PRIMARY KEY,
                    group_chat_name VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'user_group_chats',
            query: `
                CREATE TABLE IF NOT EXISTS user_group_chats (
                    user_id varchar(50) NOT NULL,
                    group_chat_id varchar(50) NOT NULL,
                    primary key (user_id, group_chat_id),
                    user_role ENUM('admin', 'member') DEFAULT 'member' NOT NULL,
                    verified BOOLEAN NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    FOREIGN KEY (group_chat_id) REFERENCES group_chats(group_chat_id) ON DELETE CASCADE
                )
            `
        },
        {
            name: 'group_chat_logs',
            query: `
                CREATE TABLE IF NOT EXISTS group_chat_logs (
                    group_chat_log_id INT PRIMARY KEY AUTO_INCREMENT,
                    group_chat_id varchar(50) NOT NULL,
                    sender_id varchar(50) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (group_chat_id) REFERENCES group_chats(group_chat_id) ON DELETE CASCADE,
                    FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE
                )
            `
        }
    ]

    createDatabasesQuery.forEach(async (table) => {
        try {
            await db.query(table.query)
            console.log(`Table ${table.name} ready`)
        } catch (error) {
            console.log(error)
        }
    })
}

createDatabase();

module.exports = db;