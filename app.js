const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();

// Import the database
const db = require('./database');

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
app.use('/orders', orderRoutes);

app.get('/', (req, res) => {
  res.redirect('/products');
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
