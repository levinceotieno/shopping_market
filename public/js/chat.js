let socket;
let userId = localStorage.getItem('chatUserId') || generateUniqueId();
localStorage.setItem('chatUserId', userId);

function initializeChat() {
    if (!socket) {
       socket = io();

       if (!userId) {
	  userId = 'user_' + Math.random().toString(36).substr(2, 9);
	  localStorage.setItem('chatUserId', userId);
       }

       socket.emit('join', userId);

       socket.on('chat_history', (messages) => {
	   const chatMessages = document.getElementById('chat-messages');
	   chatMessages.innerHTML = '';
	   messages.forEach(msg => {
	      const messageElement = document.createElement('div');
	      messageElement.textContent = msg.is_admin ? 'Admin: ' + msg.message : 'You: ' + msg.message;
	      messageElement.className = msg.is_admin ? 'admin-message' : 'user-message';
	      chatMessages.appendChild(messageElement);
	   });
	   chatMessages.scrollTop = chatMessages.scrollHeight;
       });

       socket.on('chatMessage', displayMessage);

       socket.on('chatCleared', () => {
	  document.getElementById('chat-messages').innerHTML = '';
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
    const message = messageInput.value.trim();
    if (message && socket) {
        socket.emit('chatMessage', { userId, text: message, isAdmin: false });
        messageInput.value = '';
        // doesnt immediately display the sent message here
    }
}

function clearChat() {
   socket.emit('clearChat', userId);
}

function displayMessage(msg) {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = msg.isAdmin ? 'Admin: ' + msg.text : 'You: ' + msg.text;
    messageElement.className = msg.isAdmin ? 'admin-message' : 'user-message';
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function generateUniqueId() {
   return 'user_' + Math.random().toString(36).substr(2, 9);
}

socket.on('notification', (userId) => {
   if (document.getElementById('chat-widget').style.display === 'none') {
      document.getElementById('chat-notification').style.display = 'block';
   }
});

document.addEventListener('DOMContentLoaded', initializeChat);
