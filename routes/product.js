const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../database'); // Import from database.js
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/images'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Appends the extension of the original file
  }
});

const upload = multer({ storage: storage });

// Get all products
router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/user/login');
  }

  db.all('SELECT * FROM products', (err, products) => {
    if (err) {
      return res.status(500).send(err);
    }

    db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
      if (err) {
        return res.status(500).send(err);
      }

      res.render('products', { products, user });
    });
  });
});

// Render add product page
router.get('/add', isAdmin, (req, res) => {
  res.render('addProduct');
});

// Add a new product
router.post('/add', isAdmin, upload.single('image'), (req, res) => {
  const { name, price, description, productStatus } = req.body;
  const imageUrl = `/images/${req.file.filename}`;

  db.run(`INSERT INTO products (name, price, description, image_url, status) VALUES (?, ?, ?, ?, ?)`,
    [name, price, description, imageUrl, productStatus],
    (err) => {
      if (err) {
        return res.status(400).send(err);
      }
      res.redirect('/products');
    }
  );
});

module.exports = router;
