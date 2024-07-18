//database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production'
  ? path.resolve('/tmp', 'shopping_market.db')
  : path.resolve(__dirname, 'shopping_market.db');
let db;

function connectDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
	if (err) {
	  console.error('Error connecting to SQLite database', err);
	  reject(err);
	} else {
	  console.log('Connected to SQLite database');
	  resolve(db);
	}
    });
  });
}

async function initializeDatabase() {
  try {
     await connectDatabase();

     // Initialize database tables
     await new Promise((resolve, reject) => {
       db.serialize(() => {
         db.run(`CREATE TABLE IF NOT EXISTS users (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           username TEXT UNIQUE,
           email TEXT UNIQUE,
           password TEXT,
           address TEXT,
           phone TEXT,
           gender TEXT,
           profile_photo TEXT,
           is_admin INTEGER DEFAULT 0
         )`);

         db.run(`CREATE TABLE IF NOT EXISTS products (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           name TEXT,
           price REAL,
           description TEXT,
           image_url TEXT,
           status TEXT
         )`);

         db.run(`CREATE TABLE IF NOT EXISTS orders (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           user_id INTEGER,
           total_price REAL,
           address TEXT,
           pickup_point TEXT,
           delivery_date TEXT,
           status TEXT DEFAULT 'pending',
           FOREIGN KEY(user_id) REFERENCES users(id)
         )`);

         db.run(`CREATE TABLE IF NOT EXISTS order_products (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           order_id INTEGER,
           product_id INTEGER,
           quantity INTEGER,
           FOREIGN KEY(order_id) REFERENCES orders(id),
           FOREIGN KEY(product_id) REFERENCES products(id)
         )`);

         db.run(`CREATE TABLE IF NOT EXISTS cart (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           user_id INTEGER NOT NULL,
           product_id INTEGER NOT NULL,
           quantity INTEGER NOT NULL DEFAULT 1,
           added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
           FOREIGN KEY(user_id) REFERENCES users(id),
           FOREIGN KEY(product_id) REFERENCES products(id)
         )`);
	 resolve();
       });
     });
     console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

module.exports = { initializeDatabase, getDb: () => db };
