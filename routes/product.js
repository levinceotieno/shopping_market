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

      // Get the cart item count for the user
      db.get('SELECT COUNT(*) as count FROM cart WHERE user_id = ?', [req.session.userId], (err, result) => {
        if (err) {
          return res.status(500).send(err);
        }

        const cartItemCount = result.count;
        res.render('products', { products, user, cartItemCount });
      });
    });
  });
});

// Render add product page
router.get('/add', isAdmin, (req, res) => {
  db.all('SELECT * FROM products', [], (err, products) => {
    if (err) {
       console.error(err);
       res.status(500).send('Error retrieving products');
    } else {
       res.render('addProduct', { products });
    }
  });
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

/**
// Render addProduct.ejs with products
router.get('/add', (req, res) => {
  db.all('SELECT * FROM products', [], (err, products) => {
    if (err) {
	console.error(err);
	res.status(500).send('Error retrieving products');
    } else {
	res.render('addProduct', { products });
    }
  });
});
**/

// Remove product route
router.delete('/remove/:id', (req, res) => {
  const productId = req.params.id;

  db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
    if (err) {
	return res.status(500).json({ success: false, message: 'Failed to remove product' });
    }
    res.json({ success: true, message: 'Product removed successfully' });
  });
});

module.exports = router;
