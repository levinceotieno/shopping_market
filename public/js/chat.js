let socket;
let userEmail;

function initializeChat() {
  if (!socket) {
    socket = io();

    fetch('/api/user-email')
      .then(response => response.json())
      .then(data => {
        userEmail = data.email;
        if (userEmail) {
          socket.emit('join', userEmail);
        }
      });

    socket.on('chat_history', (messages) => {
      const chatMessages = document.getElementById('chat-messages');
      chatMessages.innerHTML = '';
      messages.forEach(displayMessage);
    });

    socket.on('chatMessage', displayMessage);

    socket.on('chatCleared', () => {
      document.getElementById('chat-messages').innerHTML = '';
    });
  }
}

function sendMessage() {
  const messageInput = document.getElementById('chat-message');
  const message = messageInput.value.trim();
  if (message && socket && userEmail) {
    socket.emit('chatMessage', { userEmail, text: message, isAdmin: false });
    messageInput.value = '';
  }
}

function clearChat() {
  if (socket && userEmail) {
    socket.emit('clearChat', userEmail);
  }
}

function displayMessage(msg) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.textContent = msg.is_admin ? 'Admin: ' + msg.message : 'You: ' + msg.message;
  messageElement.className = msg.is_admin ? 'admin-message' : 'user-message';
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function toggleChat() {
  const chatWidget = document.getElementById('chat-widget');
  chatWidget.style.display = chatWidget.style.display === 'none' ? 'block' : 'none';
  if (chatWidget.style.display === 'block') {
    document.getElementById('chat-notification').style.display = 'none';
  }
  initializeChat();
}

document.addEventListener('DOMContentLoaded', initializeChat);