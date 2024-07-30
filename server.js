const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = []; // Array to keep track of online users
let adminOnline = false; // Flag to track if the admin is online

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Handle admin joining
    socket.on('adminJoin', () => {
        console.log('Admin has joined the chat');
        adminOnline = true;
        socket.username = 'admin';
        users.push({ name: 'admin', online: true });
        io.emit('updateUsers', users); // Update all clients with the new user list
        io.emit('message', 'System', 'Admin has joined the chat.');
    });

    // Handle user joining
    socket.on('join', (username) => {
        console.log(`${username} joined the chat`);
        socket.username = username;
        users.push({ name: username, online: true });
        io.emit('updateUsers', users); // Update all clients with the new user list
        io.emit('message', 'System', `${username} has joined the chat.`);
    });

    // Handle user sending a message
    socket.on('message', (user, text) => {
        io.emit('message', user, text); // Broadcast to all clients
    });

    // Handle username change
    socket.on('changeUsername', (newUsername) => {
        const user = users.find(u => u.name === socket.username);
        if (user) {
            user.name = newUsername;
            socket.username = newUsername;
            io.emit('updateUsers', users); // Update all clients with the new user list
            io.emit('message', 'System', `User has changed their username to ${newUsername}.`);
        }
    });

    // Handle user disconnecting
    socket.on('disconnect', () => {
        if (socket.username) {
            console.log(`${socket.username} left the chat`);
            users = users.filter(user => user.name !== socket.username);
            io.emit('updateUsers', users); // Update all clients with the new user list
            io.emit('message', 'System', `${socket.username} has left the chat.`);
        }
    });
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});
