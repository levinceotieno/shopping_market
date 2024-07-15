//order.js
const express = require('express');
const router = express.Router();
const db = require('../database'); // Import from database.js
const { isAuthenticated } = require('../middleware/auth');

// Add order
router.post('/', isAuthenticated, (req, res) => {
    const { products, totalPrice, address, pickupPoint } = req.body;
    const userId = req.session.userId;

    const isNairobi = address.toLowerCase().includes('nairobi');
    const deliveryDate = new Date();
    if (isNairobi) {
	deliveryDate.setHours(deliveryDate.getHours() + 6);
    } else {
	const day = deliveryDate.getDay();
	// If order is placed on Friday, add 5 days to skip the weekend
	if (day === 5) {
	   deliveryDate.setDate(deliveryDate.getDate() + 5);
	} else if (day === 6) {
	       // If order is placed on Saturday, add 4 days
	       deliveryDate.setDate(deliveryDate.getDate() + 4);
	} else {
	    deliveryDate.setDate(deliveryDate.getDate() + 3);
	}
    }

    db.run(`INSERT INTO orders (user_id, total_price, address, pickup_point, delivery_date) VALUES (?, ?, ?, ?, ?)`,
        [userId, totalPrice, address, pickupPoint, deliveryDate.toISOString()],
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
        SELECT o.id, o.total_price, o.address, o.pickup_point, o.status, o.delivery_date, op.product_id, op.quantity, p.name, p.image_url
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
                    status: row.status,
		    deliveryDate: row.delivery_date,
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

        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
            if (err) {
		console.error('SQL Error:', err);
                return res.status(500).send(err);
            }

            db.get('SELECT COUNT(*) as count FROM cart WHERE user_id = ?', [userId], (err, result) => {
                if (err) {
		    console.error('SQL Error:', err);
                    return res.status(500).send(err);
                }

                const cartItemCount = result.count;

                res.render('orders', {
                    user,
                    orders: Object.values(orders),
                    cartItemCount
                });
            });
        });
    });
});

// Get all orders for admin
router.get('/admin', isAuthenticated, (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(403).send('Access denied');
    }

    db.all(`
        SELECT o.id, o.user_id, u.username as userName, o.total_price, o.address, o.pickup_point, o.status, op.product_id, op.quantity, p.name
        FROM orders o
        JOIN order_products op ON o.id = op.order_id
        JOIN products p ON op.product_id = p.id
        JOIN users u ON o.user_id = u.id
    `, (err, rows) => {
        if (err) {
	    console.error('SQL Error:', err);
            return res.status(500).send(err);
        }

        const orders = {};
        rows.forEach(row => {
            if (!orders[row.id]) {
                orders[row.id] = {
                    id: row.id,
                    userId: row.user_id,
                    userName: row.userName,
                    totalPrice: row.total_price,
                    address: row.address,
                    pickupPoint: row.pickup_point,
                    status: row.status,
                    products: []
                };
            }
            orders[row.id].products.push({
                productId: row.product_id,
                name: row.name,
                quantity: row.quantity
            });
        });

        res.render('orderedProducts', { orders: Object.values(orders) });
    });
});

// Update order status
router.post('/update/:orderId', isAuthenticated, (req, res) => {
    if (!req.session.isAdmin) {
        return res.status(403).send('Access denied');
    }

    const { status } = req.body;
    const { orderId } = req.params;

    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, orderId], (err) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.redirect('/orders/admin');
    });
});

// Clear orders for the logged-in user
router.post('/clear', isAuthenticated, (req, res) => {
    const userId = req.session.userId;

    db.run(`DELETE FROM order_products WHERE order_id IN (SELECT id FROM orders WHERE user_id = ?)`, [userId], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to clear order products' });
        }

        db.run(`DELETE FROM orders WHERE user_id = ?`, [userId], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to clear orders' });
            }
            res.json({ message: 'Order history cleared successfully' });
        });
    });
});

module.exports = router;
