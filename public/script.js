document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const messageInput = document.getElementById('messageInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const clearChatButton = document.getElementById('clearChat');
    const messagesDiv = document.getElementById('messages');
    const changeUserButton = document.getElementById('changeUser');
    const userList = document.getElementById('userList');
    
    let username = prompt("Enter your username:");
    let isAdmin = false; // Flag to check if the user is an admin

    if (username.toLowerCase() === 'admin') {
        isAdmin = true;
        socket.emit('adminJoin'); // Notify server that an admin has joined
    } else {
        socket.emit('join', username);
    }

    function addMessage(user, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', user);
        messageDiv.textContent = `${user}: ${text} (${new Date().toLocaleTimeString()})`;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function updateUserList(users) {
        userList.innerHTML = '';
        users.forEach(user => {
            const userItem = document.createElement('li');
            const statusDot = document.createElement('span');
            statusDot.classList.add('status');
            statusDot.classList.add(user.online ? 'online' : 'offline');

            userItem.textContent = user.name;
            if (user.name === 'admin') {
                userItem.classList.add('admin');
            }
            userItem.prepend(statusDot);
            userList.appendChild(userItem);
        });
    }

    // Handle incoming messages
    socket.on('message', (user, text) => {
        addMessage(user, text);
    });

    // Handle list of online users
    socket.on('updateUsers', (users) => {
        updateUserList(users);
    });

    sendMessageButton.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text) {
            socket.emit('message', username, text);
            messageInput.value = '';
        }
    });

    clearChatButton.addEventListener('click', () => {
        localStorage.removeItem('messages');
        messagesDiv.innerHTML = '';
    });

    changeUserButton.addEventListener('click', () => {
        const newUsername = prompt("Enter your new username:");
        if (newUsername && newUsername !== username) {
            socket.emit('message', 'System', `${username} has changed their username to ${newUsername}.`);
            username = newUsername;
            socket.emit('changeUsername', username);
        }
    });

    // Load existing messages from local storage
    const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    storedMessages.forEach(({ user, text }) => addMessage(user, text));

    // Save messages to local storage
    socket.on('message', (user, text) => {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        messages.push({ user, text });
        localStorage.setItem('messages', JSON.stringify(messages));
    });

    // Notify server when user disconnects
    window.addEventListener('beforeunload', () => {
        socket.emit('disconnect');
    });
});
