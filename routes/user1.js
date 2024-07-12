const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const multer = require('multer');
const path = require('path');

// Configure multer for images & profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${path.basename(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Render registration page
router.get('/register', (req, res) => {
  res.render('register');
});

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`,
      [username, email, hashedPassword],
      (err) => {
        if (err) {
          return res.status(400).send(err);
        }
        res.redirect('/user/login');
      }
    );
  } catch (error) {
    res.status(400).send(error);
  }
});

// Render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Log in a user
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(400).send(err);
    }
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.userId = user.id;
      req.session.isAdmin = user.is_admin === 1;
      res.redirect('/products');
    } else {
      res.status(400).send('Invalid credentials');
    }
  });
});

// Log out a user
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/user/login');
  });
});

// Render profile page
router.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/user/login');
  }
  db.get('SELECT * FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.render('profile', { user });
  });
});

// Update profile
router.post('/profile', upload.single('profilePhoto'), (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/user/login');
  }
  const { username, email, address, phone, gender } = req.body;
  const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;

  const query = `
    UPDATE users
    SET username = ?, email = ?, address = ?, phone = ?, gender = ?, profile_photo = COALESCE(?, profile_photo)
    WHERE id = ?
  `;
  const params = [username, email, address, phone, gender, profilePhoto, req.session.userId];

  db.run(query, params, (err) => {
    if (err) {
      return res.status(400).send(err);
    }
    res.redirect('/user/profile');
  });
});

// Change password
router.post('/change-password', async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/user/login');
  }
  const { currentPassword, newPassword } = req.body;
  db.get('SELECT password FROM users WHERE id = ?', [req.session.userId], async (err, user) => {
    if (err) {
      return res.status(400).send(err);
    }
    if (user && await bcrypt.compare(currentPassword, user.password)) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.session.userId], (err) => {
        if (err) {
          return res.status(400).send(err);
        }
        res.redirect('/user/profile');
      });
    } else {
      res.status(400).send('Current password is incorrect');
    }
  });
});

module.exports = router;
