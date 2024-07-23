let socket;
let userEmail;
//let localMessageIds = new Set();

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
      messages.forEach(msg => displayMessage(msg, false));
    });

    socket.on('chatMessage', msg => displayMessage(msg, false));

    socket.on('chatCleared', () => {
      document.getElementById('chat-messages').innerHTML = '';
    });
  }
}

function sendMessage() {
  const messageInput = document.getElementById('chat-message');
  const message = messageInput.value.trim();
  if (message && socket && userEmail) {
    const msg = { userEmail, text: message, isAdmin: false };
    
    // Display message immediately on client side
    displayMessage({ message: msg.text, is_admin: msg.isAdmin }, true);
   
    socket.emit('chatMessage', msg, (response) => {
       if (response && response.status === 'ok') {
	  console.log('Message sent successfully');
       } else {
	 console.error('Failed to send message:', response ? response.message : 'No response');
	 // Optionally, remove the message from the chat if failed to send
       }
    });

    messageInput.value = '';
  }
}

function clearChat() {
  if (socket && userEmail) {
    socket.emit('clearChat', userEmail);
  }
}

function displayMessage(msg, isLocal = false) {
  const chatMessages = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  
  // For local messages, use the structure we know
  if (isLocal) {
    messageElement.textContent = msg.is_admin ? 'Admin: ' + msg.message : 'You: ' + msg.message;
  } else {
    // For server messages, check the structure
    messageElement.textContent = msg.is_admin ? 'Admin: ' + msg.message : 'You: ' + (msg.message || msg.text);
  }
  
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
