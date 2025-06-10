const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const cookieParser = require('cookie-parser');


const userRouter = require('./routers/UserRouter');
const privateChatRouter = require('./routers/PrivateChatRouter');
const groupChatRouter = require('./routers/GroupChatRouter');

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))

app.use('/users', userRouter);
app.use('/private-chats', privateChatRouter);
app.use('/group-chats', groupChatRouter);
app.get('/', (req, res) => {
    res.send('Hello World');
})

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["GET", "POST", "PUT", "DELETE"],
    }
});


io.on('connection', (socket) => {
    // console.log('a user connected id:', socket.id);

    socket.on('send-message', (msg, room) => {
        if(room == '' || room == undefined){
            socket.broadcast.emit('receive-message', msg);
        }else{
            console.log(msg)
            socket.to(room).emit('receive-message', msg);
        }
    })

    socket.on('send-private-message', (msg, room) => {
        socket.to(room).emit('receive-message', msg);
    })

    socket.on('join-room', (room) => {
        socket.join(room);
    })

    socket.on('disconnect', () => {
        // console.log('a user disconnected')
    })
})

server.listen(3000, () => {
    console.log('Server run'); 
}) 
