let socket;
let userId;

function initializeChat() {
    if (!socket) {
        socket = io({
            transports: ['websocket'],
            upgrade: false
        });

        fetch('/api/user-id')
            .then(response => response.json())
            .then(data => {
                userId = data.userId;
                socket.emit('join', userId);
            });

        socket.on('chatMessage', (msg) => {
            displayMessage(msg);
        });

        socket.on('notification', () => {
            if (document.getElementById('chat-widget').style.display === 'none') {
                document.getElementById('chat-notification').style.display = 'block';
            }
        });
    }
}

function toggleChat() {
    const chatWidget = document.getElementById('chat-widget');
    chatWidget.style.display = chatWidget.style.display === 'none' ? 'block' : 'none';
    if (chatWidget.style.display === 'block') {
        document.getElementById('chat-notification').style.display = 'none';
    }
    initializeChat();
}

function sendMessage() {
    const messageInput = document.getElementById('chat-message');
    const message = messageInput.value;
    if (message.trim() && socket) {
        socket.emit('chatMessage', { userId, text: message, isAdmin: false });
        messageInput.value = '';
        // We no longer immediately display the sent message here
    }
}

function displayMessage(msg) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = msg.isAdmin ? 'Admin: ' + msg.text : 'You: ' + msg.text;
    messageElement.className = msg.isAdmin ? 'admin-message' : 'user-message';
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener('DOMContentLoaded', initializeChat);
