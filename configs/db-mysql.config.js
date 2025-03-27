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
            name: 'Users',
            query: `
                CREATE TABLE IF NOT EXISTS Users (
                    user_id varchar(50) PRIMARY KEY,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'PrivateChats',
            query: `
                CREATE TABLE IF NOT EXISTS PrivateChats (
                    private_chat_id varchar(50) PRIMARY KEY,
                    user_1_id varchar(50) NOT NULL,
                    user_2_id varchar(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_1_id) REFERENCES Users(user_id),
                    FOREIGN KEY (user_2_id) REFERENCES Users(user_id)                  
                )
            `
        },
        {
            name: 'PrivateChatLogs',
            query: `
                CREATE TABLE IF NOT EXISTS PrivateChatLogs (
                    private_chat_log_id INT PRIMARY KEY AUTO_INCREMENT,
                    private_chat_id varchar(50) NOT NULL,
                    sender_id varchar(50) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (private_chat_id) REFERENCES PrivateChats(private_chat_id),
                    FOREIGN KEY (sender_id) REFERENCES Users(user_id)
                )
            `
        },
        {
            name: 'GroupChats',
            query: `
                CREATE TABLE IF NOT EXISTS GroupChats (
                    group_chat_id varchar(50) PRIMARY KEY,
                    group_chat_name VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `
        },
        {
            name: 'UserGroups',
            query: `
                CREATE TABLE IF NOT EXISTS UserGroupchats (
                    user_id varchar(50) NOT NULL,
                    group_chat_id varchar(50) NOT NULL,
                    primary key (user_id, group_chat_id),
                    user_role ENUM('admin', 'member') DEFAULT 'member' NOT NULL,
                    verified BOOLEAN NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES Users(user_id),
                    FOREIGN KEY (group_chat_id) REFERENCES GroupChats(group_chat_id)
                )
            `
        },
        {
            name: 'GroupChatLogs',
            query: `
                CREATE TABLE IF NOT EXISTS GroupChatLogs (
                    group_chat_log_id INT PRIMARY KEY AUTO_INCREMENT,
                    group_chat_id varchar(50) NOT NULL,
                    sender_id varchar(50) NOT NULL,
                    message TEXT NOT NULL,
                    created_at TIMESTAMP,
                    updated_at TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (group_chat_id) REFERENCES GroupChats(group_chat_id),
                    FOREIGN KEY (sender_id) REFERENCES Users(user_id)
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