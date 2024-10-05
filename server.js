const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = [];

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    socket.on('join', (username) => {
        if (users.find(user => user.name === username)) {
            socket.emit('message', 'admin', `Username ${username} is already taken. Please choose another.`);
        } else {
            users.push({ name: username, online: true });
            socket.username = username;
            io.emit('message', 'admin', `${username} has joined the chat.`);
            io.emit('updateUsers', users);
        }
    });

    socket.on('adminJoin', () => {
        if (!users.find(user => user.name === 'admin')) {
            users.push({ name: 'admin', online: true });
            socket.username = 'admin';
            io.emit('message', 'admin', 'Admin has joined the chat.');
            io.emit('updateUsers', users);
        } else {
            socket.emit('message', 'admin', 'Admin is already online.');
        }
    });

    socket.on('message', (user, text) => {
        io.emit('message', user, text);
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            users = users.filter(user => user.name !== socket.username);
            io.emit('updateUsers', users);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
