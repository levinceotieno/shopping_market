const express = require('express');
const router = express.Router();
const db = require('../database'); // Import from database.js
const { isAuthenticated } = require('../middleware/auth');

// Add order
router.post('/', isAuthenticated, (req, res) => {
  const { products, totalPrice, address, pickupPoint } = req.body;
  const userId = req.session.userId;

  db.run(`INSERT INTO orders (user_id, total_price, address, pickup_point) VALUES (?, ?, ?, ?)`,
    [userId, totalPrice, address, pickupPoint],
    function(err) {
      if (err) {
        return res.status(400).send(err);
      }
      const orderId = this.lastID;

      let insertPromises = products.map(product => {
        return new Promise((resolve, reject) => {
          db.run(`INSERT INTO order_products (order_id, product_id, quantity) VALUES (?, ?, ?)`,
            [orderId, product.product, product.quantity],
            (err) => {
              if (err) reject(err);
              else resolve();
            });
        });
      });

      Promise.all(insertPromises)
        .then(() => res.status(201).send({ orderId }))
        .catch(err => res.status(400).send(err));
    }
  );
});

// Get orders for user
router.get('/', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  db.all(`
    SELECT o.id, o.total_price, o.address, o.pickup_point, op.product_id, op.quantity, p.name, p.image_url
    FROM orders o
    JOIN order_products op ON o.id = op.order_id
    JOIN products p ON op.product_id = p.id
    WHERE o.user_id = ?
  `, [userId], (err, rows) => {
    if (err) {
      return res.status(500).send(err);
    }

    const orders = {};
    rows.forEach(row => {
      if (!orders[row.id]) {
        orders[row.id] = {
          id: row.id,
          totalPrice: row.total_price,
          address: row.address,
          pickupPoint: row.pickup_point,
          products: []
        };
      }
      orders[row.id].products.push({
        productId: row.product_id,
	name: row.name,
	imageUrl: row.image_url,
        quantity: row.quantity
      });
    });

    res.render('orders', { orders: Object.values(orders) });
  });
});

router.post('/clear', (req, res) => {
   // Clear the order history logic here
   // Example using a database call
   Order.deleteMany({ userId: req.user.id }, (err) => {
     if (err) {
       return res.status(500).json({ error: 'Failed to clear order history' });
     }
     res.json({ message: 'Order history cleared successfully' });
   });
});

module.exports = router;
