import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'deshimart.db');
const JSON_DB_PATH = path.join(__dirname, 'deshimart_fallback.json');

let db = null;
let useJsonFallback = false;

// Custom Promise wrapper for SQLite or JSON Fallback
const dbOperations = {
  run: null,
  get: null,
  all: null
};

// JSON Fallback Database implementation
const jsonDb = {
  data: {
    users: [],
    products: [],
    orders: [],
    order_items: []
  },
  load() {
    if (fs.existsSync(JSON_DB_PATH)) {
      try {
        this.data = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf8'));
      } catch (e) {
        console.error('Error loading JSON DB, resetting:', e);
        this.save();
      }
    } else {
      this.save();
    }
  },
  save() {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(this.data, null, 2), 'utf8');
  }
};

// Initialize database
export async function initDb() {
  try {
    const sqlite3Module = await import('sqlite3');
    const sqlite3 = sqlite3Module.default.verbose();
    
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('SQLite connection error, falling back to JSON storage:', err.message);
        setupJsonFallback();
      }
    });

    if (db) {
      dbOperations.run = (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
          });
        });
      };

      dbOperations.get = (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      };

      dbOperations.all = (sql, params = []) => {
        return new Promise((resolve, reject) => {
          db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      };

      // Create Tables
      await dbOperations.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('farmer', 'customer')),
          address TEXT,
          phone TEXT
        )
      `);

      await dbOperations.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          category TEXT NOT NULL,
          image_url TEXT,
          stock INTEGER DEFAULT 0,
          farmer_id INTEGER,
          farmer_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(farmer_id) REFERENCES users(id)
        )
      `);

      await dbOperations.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          customer_name TEXT,
          total_amount REAL NOT NULL,
          payment_status TEXT DEFAULT 'pending',
          upi_txn_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(customer_id) REFERENCES users(id)
        )
      `);

      await dbOperations.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          product_id INTEGER,
          product_name TEXT,
          quantity INTEGER,
          price REAL,
          FOREIGN KEY(order_id) REFERENCES orders(id),
          FOREIGN KEY(product_id) REFERENCES products(id)
        )
      `);

      console.log('SQLite database initialized successfully.');
      await seedProducts();
    }
  } catch (err) {
    console.warn('Could not load sqlite3 module. Setting up JSON database fallback:', err.message);
    setupJsonFallback();
  }
}

function setupJsonFallback() {
  useJsonFallback = true;
  jsonDb.load();
  
  dbOperations.run = async (sql, params = []) => {
    // Basic mock parser for simple inserts/updates
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.startsWith('insert into users')) {
      const id = jsonDb.data.users.length + 1;
      const user = { id, name: params[0], email: params[1], password_hash: params[2], role: params[3], address: params[4], phone: params[5] };
      jsonDb.data.users.push(user);
      jsonDb.save();
      return { id };
    }
    
    if (sqlLower.startsWith('insert into products')) {
      const id = jsonDb.data.products.length + 1;
      const product = { 
        id, name: params[0], description: params[1], price: parseFloat(params[2]), 
        category: params[3], image_url: params[4], stock: parseInt(params[5]), 
        farmer_id: params[6], farmer_name: params[7], created_at: new Date().toISOString() 
      };
      jsonDb.data.products.push(product);
      jsonDb.save();
      return { id };
    }

    if (sqlLower.startsWith('update products set name')) {
      // SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ? WHERE id = ? AND farmer_id = ?
      const id = parseInt(params[6]);
      const prod = jsonDb.data.products.find(p => p.id === id);
      if (prod) {
        prod.name = params[0];
        prod.description = params[1];
        prod.price = parseFloat(params[2]);
        prod.category = params[3];
        prod.image_url = params[4];
        prod.stock = parseInt(params[5]);
        jsonDb.save();
      }
      return { changes: 1 };
    }

    if (sqlLower.startsWith('delete from products')) {
      const id = parseInt(params[0]);
      const farmerId = parseInt(params[1]);
      jsonDb.data.products = jsonDb.data.products.filter(p => !(p.id === id && p.farmer_id === farmerId));
      jsonDb.save();
      return { changes: 1 };
    }

    if (sqlLower.startsWith('insert into orders')) {
      const id = jsonDb.data.orders.length + 1;
      const order = {
        id, customer_id: params[0], customer_name: params[1], total_amount: parseFloat(params[2]),
        payment_status: params[3] || 'pending', upi_txn_id: params[4] || null, created_at: new Date().toISOString()
      };
      jsonDb.data.orders.push(order);
      jsonDb.save();
      return { id };
    }

    if (sqlLower.startsWith('insert into order_items')) {
      const id = jsonDb.data.order_items.length + 1;
      const item = {
        id, order_id: params[0], product_id: params[1], product_name: params[2], quantity: parseInt(params[3]), price: parseFloat(params[4])
      };
      jsonDb.data.order_items.push(item);
      jsonDb.save();
      return { id };
    }

    if (sqlLower.startsWith('update orders set payment_status')) {
      // SET payment_status = ?, upi_txn_id = ? WHERE id = ?
      const status = params[0];
      const txId = params[1];
      const id = parseInt(params[2]);
      const order = jsonDb.data.orders.find(o => o.id === id);
      if (order) {
        order.payment_status = status;
        order.upi_txn_id = txId;
        
        // If payment completed, deduct stock
        if (status === 'completed') {
          const items = jsonDb.data.order_items.filter(item => item.order_id === id);
          for (const item of items) {
            const prod = jsonDb.data.products.find(p => p.id === item.product_id);
            if (prod) {
              prod.stock = Math.max(0, prod.stock - item.quantity);
            }
          }
        }
        jsonDb.save();
      }
      return { changes: 1 };
    }

    return { id: 0, changes: 0 };
  };

  dbOperations.get = async (sql, params = []) => {
    const sqlLower = sql.toLowerCase().trim();
    if (sqlLower.includes('from users where email =')) {
      const email = params[0];
      return jsonDb.data.users.find(u => u.email === email) || null;
    }
    if (sqlLower.includes('from users where id =')) {
      const id = parseInt(params[0]);
      return jsonDb.data.users.find(u => u.id === id) || null;
    }
    if (sqlLower.includes('from products where id =')) {
      const id = parseInt(params[0]);
      return jsonDb.data.products.find(p => p.id === id) || null;
    }
    if (sqlLower.includes('from orders where id =')) {
      const id = parseInt(params[0]);
      return jsonDb.data.orders.find(o => o.id === id) || null;
    }
    return null;
  };

  dbOperations.all = async (sql, params = []) => {
    const sqlLower = sql.toLowerCase().trim();
    if (sqlLower.includes('from products')) {
      let prods = [...jsonDb.data.products];
      if (sqlLower.includes('where farmer_id =')) {
        const farmerId = parseInt(params[0]);
        prods = prods.filter(p => p.farmer_id === farmerId);
      } else if (sqlLower.includes('where category =')) {
        const cat = params[0];
        prods = prods.filter(p => p.category === cat);
      }
      // Sort by newest
      return prods.sort((a, b) => b.id - a.id);
    }
    
    if (sqlLower.includes('from orders')) {
      let ords = [...jsonDb.data.orders];
      if (sqlLower.includes('where customer_id =')) {
        const custId = parseInt(params[0]);
        ords = ords.filter(o => o.customer_id === custId);
      }
      return ords.sort((a, b) => b.id - a.id);
    }

    if (sqlLower.includes('from order_items where order_id =')) {
      const orderId = parseInt(params[0]);
      return jsonDb.data.order_items.filter(item => item.order_id === orderId);
    }

    return [];
  };

  console.log('JSON file-based database fallback initialized successfully.');
  seedProducts();
}

// Seed Initial Farming & Agricultural Products
async function seedProducts() {
  const products = await dbOperations.all('SELECT * FROM products');
  if (products && products.length > 0) return;

  const initialProducts = [
    {
      name: 'Organic Basmati Rice (Premium)',
      description: 'Aromatically rich, direct from the fields of Punjab. 100% organic and aged to perfection.',
      price: 95.0,
      category: 'crops',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
      stock: 500,
      farmer_id: 1,
      farmer_name: 'Harpreet Singh'
    },
    {
      name: 'Hybrid Tomato Seeds',
      description: 'High-yielding, disease-resistant tomato seeds. Perfect for local soil conditions.',
      price: 150.0,
      category: 'seeds',
      image_url: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400',
      stock: 200,
      farmer_id: 2,
      farmer_name: 'Ramesh Patel'
    },
    {
      name: 'Organic Neem Compost',
      description: 'Premium organic nitrogen-rich fertilizer made from neem cake. Repels pests naturally.',
      price: 250.0,
      category: 'fertilizers',
      image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=400',
      stock: 100,
      farmer_id: 2,
      farmer_name: 'Ramesh Patel'
    },
    {
      name: 'Farming Sickle & Pruning Shears',
      description: 'Ergonomic hand-forged steel sickle along with heavy-duty crop cutters.',
      price: 350.0,
      category: 'tools',
      image_url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=400',
      stock: 45,
      farmer_id: 1,
      farmer_name: 'Harpreet Singh'
    },
    {
      name: 'Fresh Golden Potatoes',
      description: 'Freshly harvested large potatoes, straight from farm soils. Unwashed for longer preservation.',
      price: 30.0,
      category: 'vegetables',
      image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400',
      stock: 1200,
      farmer_id: 1,
      farmer_name: 'Harpreet Singh'
    },
    {
      name: 'Bio-Fertilizer NPK Spray',
      description: 'Liquid bio-fertilizer containing nitrogen, phosphorus, and potassium fixing bacteria.',
      price: 450.0,
      category: 'fertilizers',
      image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
      stock: 80,
      farmer_id: 2,
      farmer_name: 'Ramesh Patel'
    }
  ];

  for (const p of initialProducts) {
    await dbOperations.run(
      `INSERT INTO products (name, description, price, category, image_url, stock, farmer_id, farmer_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.description, p.price, p.category, p.image_url, p.stock, p.farmer_id, p.farmer_name]
    );
  }
  console.log('Seeded initial farming products.');
}

// User Actions
export const dbUsers = {
  async register(name, email, passwordHash, role, address = '', phone = '') {
    return dbOperations.run(
      'INSERT INTO users (name, email, password_hash, role, address, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, role, address, phone]
    );
  },
  async findByEmail(email) {
    return dbOperations.get('SELECT * FROM users WHERE email = ?', [email]);
  },
  async findById(id) {
    return dbOperations.get('SELECT * FROM users WHERE id = ?', [id]);
  }
};

// Product Actions
export const dbProducts = {
  async getAll() {
    return dbOperations.all('SELECT * FROM products ORDER BY id DESC');
  },
  async getByCategory(category) {
    return dbOperations.all('SELECT * FROM products WHERE category = ? ORDER BY id DESC', [category]);
  },
  async getByFarmer(farmerId) {
    return dbOperations.all('SELECT * FROM products WHERE farmer_id = ? ORDER BY id DESC', [farmerId]);
  },
  async getById(id) {
    return dbOperations.get('SELECT * FROM products WHERE id = ?', [id]);
  },
  async create(name, description, price, category, imageUrl, stock, farmerId, farmerName) {
    return dbOperations.run(
      `INSERT INTO products (name, description, price, category, image_url, stock, farmer_id, farmer_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, price, category, imageUrl, stock, farmerId, farmerName]
    );
  },
  async update(id, name, description, price, category, imageUrl, stock, farmerId) {
    return dbOperations.run(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ? 
       WHERE id = ? AND farmer_id = ?`,
      [name, description, price, category, imageUrl, stock, id, farmerId]
    );
  },
  async delete(id, farmerId) {
    return dbOperations.run('DELETE FROM products WHERE id = ? AND farmer_id = ?', [id, farmerId]);
  }
};

// Order Actions
export const dbOrders = {
  async createOrder(customerId, customerName, totalAmount, items) {
    // Insert order (starts as pending)
    const result = await dbOperations.run(
      'INSERT INTO orders (customer_id, customer_name, total_amount, payment_status) VALUES (?, ?, ?, ?)',
      [customerId, customerName, totalAmount, 'pending']
    );
    const orderId = result.id;

    // Insert order items
    for (const item of items) {
      await dbOperations.run(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.product_name, item.quantity, item.price]
      );
    }

    return orderId;
  },

  async updatePayment(orderId, status, upiTxnId) {
    return dbOperations.run(
      'UPDATE orders SET payment_status = ?, upi_txn_id = ? WHERE id = ?',
      [status, upiTxnId, orderId]
    );
  },

  async getById(orderId) {
    const order = await dbOperations.get('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return null;
    const items = await dbOperations.all('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    order.items = items;
    return order;
  },

  async getByCustomer(customerId) {
    const orders = await dbOperations.all('SELECT * FROM orders WHERE customer_id = ? ORDER BY id DESC', [customerId]);
    for (const order of orders) {
      order.items = await dbOperations.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    }
    return orders;
  }
};
