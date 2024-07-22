const express = require('express');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { isAuthenticated, isAdmin } = require('./middleware/auth');
const methodOverride = require('method-override');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Import the database
const db = require('./database');

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(session({
  secret: '346bdc2807207b7d90d6b5df9d1554d8561233c1ba0fef1cdb00052ef5da5ab700ce8c1a743126dbd7f37725dfb62002e5a0ba02955a421c99ec47325ae9f9c7',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const userRoutes = require('./routes/user');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');

app.use('/user', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', isAuthenticated, orderRoutes);

app.get('/', (req, res) => {
  res.redirect('/products');
});

app.get('/orders/admin', isAuthenticated, isAdmin, (req, res) => {
   // Render admin view for orders
});

// Example query to test SQLite connection
app.get('/testdb', (req, res) => {
  db.get("SELECT datetime('now') as now", (err, row) => {
    if (err) {
      console.error(err);
      res.send("Error " + err);
    } else {
      res.render('testdb', { results: [row] });
    }
  });
});

app.get('/api/user-id', (req, res) => {
  res.json({ userId: req.session.userId || 'guest' });
});

const connectedUsers = new Set();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (userId) => {
    console.log('User joined:', userId);
    socket.userId = userId;
    socket.join(userId);
    //connectedUsers.add(userId);
    //io.to('admin').emit('newUser', userId);
    db.all('SELECT * FROM chat_messages WHERE user_id = ? AND is_read = 0', [userId], (err, messages) => {
       if (err) console.error(err);
       else socket.emit('chat_history', messages);
    });
  });

  socket.on('adminJoin', () => {
    console.log('Admin joined');
    socket.join('admin');
    
    db.all('SELECT DISTINCT user_id FROM chat_messages', (err, users) => {
	if (err) console.error(err);
	else socket.emit('active_users', users.map(user => user.user_id));
    });
  });

  socket.on('chatMessage', (msg) => {
    console.log('Received message', msg);
    // Store message in database
    db.run('INSERT INTO chat_messages (user_id, message, is_admin) VALUES (?, ?, ?)',
      [msg.userId, msg.text, msg.isAdmin],
      (err) => {
        if (err) {
	  console.error('Error saving chat message:', err);
	} else {
	  io.to(msg.userId).to('admin').emit('chatMessage', msg);
	  // Send notification to admin if message is from user
          if (!msg.isAdmin) {
             io.to('admin').emit('newMessage', msg.userId);
	  }
	}
      }
    );
  });

  socket.on('fetchMessages', (userId) => {
     db.all('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp ASC', [userId], (err, messages) => {
	if (err) {
	   console.error('Error fetching messages:', err);
	} else {
	  socket.emit('existingMessages', userId, messages);
	}
     });
  });

  socket.on('clearChat', (userId) => {
     db.run('DELETE FROM chat_messages WHERE user_id = ?', [userId], (err) => {
	if (err) console.error('Error clearing chat:', err);
	else socket.emit('chatCleared');
     });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
       connectedUsers.delete(socket.userId);
    }
    console.log('Client disconnected');
  });
});

// Admin chat route
app.get('/admin-chat', isAuthenticated, isAdmin, (req, res) => {
  db.all('SELECT * FROM chat_messages ORDER BY timestamp DESC LIMIT 100', (err, messages) => {
    if (err) {
      console.error('Error retrieving chat history:', err);
      messages = [];
    }
    res.render('admin-chat', { chatHistory: messages });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
