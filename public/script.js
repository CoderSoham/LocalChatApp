document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const messageInput = document.getElementById('messageInput');
    const sendMessageButton = document.getElementById('sendMessage');
    const clearChatButton = document.getElementById('clearChat');
    const messagesDiv = document.getElementById('messages');
    const changeUserButton = document.getElementById('changeUser');
    const userList = document.getElementById('userList');
    const usernameForm = document.getElementById('usernameForm');
    const usernameInput = document.getElementById('usernameInput');
    const usernameFormContainer = document.getElementById('usernameFormContainer');
    const chatContainer = document.getElementById('chatContainer');

    let username;
    let isAdmin = false;

    // Handle username form submission
    usernameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        username = usernameInput.value.trim();

        if (username.toLowerCase() === 'admin') {
            isAdmin = true;
            socket.emit('adminJoin');
        } else {
            socket.emit('join', username);
        }

        // Hide the username form and show the chat container
        usernameFormContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
    });

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

    socket.on('message', (user, text) => {
        addMessage(user, text);
    });

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
        usernameFormContainer.style.display = 'flex';
        chatContainer.style.display = 'none';
    });

    const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    storedMessages.forEach(({ user, text }) => addMessage(user, text));

    socket.on('message', (user, text) => {
        const messages = JSON.parse(localStorage.getItem('messages')) || [];
        messages.push({ user, text });
        localStorage.setItem('messages', JSON.stringify(messages));
        addMessage(user, text);
    });
});
