const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { logger, morganMiddleware } = require('./logger');
const { exec } = require('child_process');
const xml2js = require('xml2js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: ['*/xml', 'text/xml', 'application/xml'] }));
app.use(morganMiddleware);

// Serve /uploads from public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Ensure public/uploads directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// XXE resolver function helper
function resolveEntities(xmlString) {
  const entityRegex = /<!ENTITY\s+(\w+)\s+SYSTEM\s+["']([^"']+)["']>/g;
  let resolvedXml = xmlString;
  let match;
  const entities = {};
  
  while ((match = entityRegex.exec(xmlString)) !== null) {
    const entityName = match[1];
    const fileUri = match[2];
    let filePath = fileUri;
    
    if (filePath.startsWith('file://')) {
      filePath = filePath.slice(7);
    }
    if (process.platform === 'win32' && filePath.startsWith('/') && filePath.charAt(2) === ':') {
      filePath = filePath.slice(1);
    }
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      entities[entityName] = fileContent;
    } catch (e) {
      entities[entityName] = `Error reading file ${filePath}: ${e.message}`;
    }
  }
  
  for (const [name, content] of Object.entries(entities)) {
    const refRegex = new RegExp(`&${name};`, 'g');
    resolvedXml = resolvedXml.replace(refRegex, content);
  }
  
  return resolvedXml;
}

// API Routes

// a) POST /api/login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  db.query(query, (err, results) => {
    if (err) {
      logger.error('Login error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }
    if (!results || results.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = results[0];
    const token = jwt.sign(
      { id: user.id, username: user.username, role_id: user.role_id },
      'SecretKey123!',
      { expiresIn: '24h' }
    );
    res.json({ token, username: user.username, role_id: user.role_id });
  });
});

// b) GET /api/products/search
app.get('/api/products/search', (req, res) => {
  const q = req.query.q || '';
  const query = "SELECT * FROM products WHERE name LIKE '%" + q + "%'";
  db.query(query, (err, results) => {
    if (err) {
      logger.error('Search error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// c) POST /api/products/:id/reviews
app.post('/api/products/:id/reviews', (req, res) => {
  const productId = req.params.id;
  const { content, user_id } = req.body;
  const query = `INSERT INTO reviews (product_id, user_id, content) VALUES ('${productId}', '${user_id}', '${content}')`;
  db.query(query, (err, result) => {
    if (err) {
      logger.error('Review insert error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Review added successfully', reviewId: result.insertId });
  });
});

// c.2) GET /api/products/:id/reviews
app.get('/api/products/:id/reviews', (req, res) => {
  const productId = req.params.id;
  const query = `SELECT r.*, u.username FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = '${productId}'`;
  db.query(query, (err, results) => {
    if (err) {
      logger.error('Fetch reviews error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


// d) POST /api/users/avatar
app.post('/api/users/avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ filepath: `/uploads/${req.file.filename}` });
});

// e) GET /api/files
app.get('/api/files', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ error: 'Path parameter is required' });
  }
  try {
    const data = fs.readFileSync(filePath);
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// f) POST /api/orders/export
app.post('/api/orders/export', (req, res) => {
  const orderId = req.body.order_id;
  const cmd = "echo Exporting order " + orderId + " > /tmp/order.txt";
  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      logger.error('Export error', { error: err.message });
      return res.status(500).json({ error: err.message, stderr });
    }
    res.json({ message: 'Order exported successfully', stdout });
  });
});

// g) GET /api/orders/:id
app.get('/api/orders/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, 'SecretKey123!');
    const orderId = req.params.id;
    const query = `SELECT * FROM orders WHERE id = '${orderId}'`;
    db.query(query, (err, results) => {
      if (err) {
        logger.error('Fetch order error', { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(results[0]);
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// h) POST /admin/products/import
app.post('/admin/products/import', (req, res) => {
  let xmlData = '';
  if (typeof req.body === 'string') {
    xmlData = req.body;
  } else if (req.body && req.body.xml) {
    xmlData = req.body.xml;
  } else {
    return res.status(400).json({ error: 'XML content is required' });
  }

  try {
    const resolvedXml = resolveEntities(xmlData);
    xml2js.parseString(resolvedXml, { explicitArray: false }, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'XML parsing error: ' + err.message });
      }
      
      const product = result.product || result;
      const name = product.name || 'Imported Product';
      const price = product.price || 0.00;
      const stock = product.stock || 0;
      const description = product.description || '';
      const metadata_xml = xmlData;

      const query = `INSERT INTO products (name, price, stock, metadata_xml, description) VALUES (?, ?, ?, ?, ?)`;
      db.query(query, [name, price, stock, metadata_xml, description], (dbErr, dbResult) => {
        if (dbErr) {
          logger.error('Product import DB error', { error: dbErr.message });
          return res.status(500).json({ error: dbErr.message });
        }
        res.json({
          message: 'Product imported successfully',
          productId: dbResult.insertId,
          product: { name, price, stock, description }
        });
      });
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// i) GET /api/notify
app.get('/api/notify', (req, res) => {
  const template = req.query.template;
  if (!template) {
    return res.status(400).json({ error: 'Template parameter is required' });
  }
  try {
    const rendered = ejs.render(template, {});
    res.send(rendered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// j) GET /api/users
app.get('/api/users', (req, res) => {
  const query = "SELECT id, username, role_id, avatar_path FROM users";
  db.query(query, (err, results) => {
    if (err) {
      logger.error('Fetch users error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// k) GET /api/orders
app.get('/api/orders', (req, res) => {
  const query = "SELECT o.*, u.username FROM orders o LEFT JOIN users u ON o.user_id = u.id";
  db.query(query, (err, results) => {
    if (err) {
      logger.error('Fetch orders error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// POST /api/auth/register (Mass Assignment Vulnerability)
app.post('/api/auth/register', (req, res) => {
  const { username, password, email, displayName, phone, role_id } = req.body;
  const query = "INSERT INTO users (username, password, email, displayName, phone, role_id) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(query, [username, password, email, displayName, phone, role_id || 2], (err, result) => {
    if (err) {
      logger.error('Registration error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User registered successfully', userId: result.insertId });
  });
});

// GET /api/users/profile
app.get('/api/users/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'SecretKey123!');
    const query = `SELECT * FROM users WHERE id = ${decoded.id}`;
    db.query(query, (err, results) => {
      if (err) {
        logger.error('Profile fetch error', { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(results[0]);
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// PUT /api/users/profile (Mass Assignment Vulnerability)
app.put('/api/users/profile', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'SecretKey123!');
    let updates = [];
    for (const [key, val] of Object.entries(req.body)) {
      if (key === 'id') continue;
      updates.push(`\`${key}\` = '${val}'`);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ${decoded.id}`;
    db.query(query, (err, result) => {
      if (err) {
        logger.error('Profile update error', { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Profile updated successfully' });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /api/products (SQL Injection Vulnerability)
app.get('/api/products', (req, res) => {
  let query = "SELECT * FROM products WHERE 1=1";
  if (req.query.brand) {
    query += " AND brand = '" + req.query.brand + "'";
  }
  if (req.query.minPrice) {
    query += " AND price >= " + req.query.minPrice;
  }
  if (req.query.maxPrice) {
    query += " AND price <= " + req.query.maxPrice;
  }
  if (req.query.category) {
    if (Array.isArray(req.query.category)) {
      const categories = req.query.category.map(c => `'${c}'`).join(',');
      query += " AND category IN (" + categories + ")";
    } else {
      query += " AND category = '" + req.query.category + "'";
    }
  }
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  db.query(query, (err, results) => {
    if (err) {
      logger.error('Products fetch error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// GET /api/products/:id
app.get('/api/products/:id', (req, res) => {
  const productId = req.params.id;
  const query = `SELECT * FROM products WHERE id = ?`;
  db.query(query, [productId], (err, results) => {
    if (err) {
      logger.error('Fetch product error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(results[0]);
  });
});



// POST /api/products (Create Game)
app.post('/api/products', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'SecretKey123!');
    if (decoded.role_id != 1) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    const { name, description, price, stock, brand, category, metadata_xml, image_path } = req.body;
    const query = 'INSERT INTO products (name, description, price, stock, brand, category, metadata_xml, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, description, price, stock, brand, category, metadata_xml, image_path], (err, result) => {
      if (err) {
        logger.error('Product creation error', { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Product created successfully", productId: result.insertId });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// PUT /api/products/:id (Update Game)
app.put('/api/products/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'SecretKey123!');
    if (decoded.role_id != 1) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    const productId = req.params.id;
    // Extract update fields, allow partial updates by fetching current values first
    db.query('SELECT * FROM products WHERE id = ?', [productId], (selectErr, selectResults) => {
      if (selectErr) {
        logger.error('Product fetch error before update', { error: selectErr.message });
        return res.status(500).json({ error: selectErr.message });
      }
      if (!selectResults || selectResults.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const existing = selectResults[0];
      const name = req.body.name !== undefined ? req.body.name : existing.name;
      const description = req.body.description !== undefined ? req.body.description : existing.description;
      const price = req.body.price !== undefined ? req.body.price : existing.price;
      const stock = req.body.stock !== undefined ? req.body.stock : existing.stock;
      const brand = req.body.brand !== undefined ? req.body.brand : existing.brand;
      const category = req.body.category !== undefined ? req.body.category : existing.category;
      const metadata_xml = req.body.metadata_xml !== undefined ? req.body.metadata_xml : existing.metadata_xml;
      const image_path = req.body.image_path !== undefined ? req.body.image_path : existing.image_path;

      const query = 'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, brand = ?, category = ?, metadata_xml = ?, image_path = ? WHERE id = ?';
      db.query(query, [name, description, price, stock, brand, category, metadata_xml, image_path, productId], (updateErr, updateResult) => {
        if (updateErr) {
          logger.error('Product update error', { error: updateErr.message });
          return res.status(500).json({ error: updateErr.message });
        }
        res.status(200).json({ message: "Product updated successfully" });
      });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// DELETE /api/products/:id (Delete Game)
app.delete('/api/products/:id', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'SecretKey123!');
    if (decoded.role_id != 1) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    const productId = req.params.id;
    const query = 'DELETE FROM products WHERE id = ?';
    db.query(query, [productId], (err, result) => {
      if (err) {
        logger.error('Product deletion error', { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

// GET /api/coupons/validate (SQL Injection Vulnerability)
app.get('/api/coupons/validate', (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'Code parameter is required' });
  }
  const query = "SELECT * FROM products WHERE name = '" + code + "'";
  db.query(query, (err, results) => {
    if (err) {
      logger.error('Coupon validation DB error', { error: err.message });
      return res.status(500).json({ error: err.message });
    }
    res.json({ valid: true, discount: 10, message: "Applied code " + code });
  });
});

// POST /api/orders (Insecure Price Validation Vulnerability)
app.post('/api/orders', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'SecretKey123!');
    const { items, total } = req.body;
    
    const query = "INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, 'pending')";
    db.query(query, [decoded.id, total], (err, result) => {
      if (err) {
        logger.error('Order creation error', { error: err.message });
        return res.status(500).json({ error: err.message });
      }
      logger.info('Order placed successfully (Insecure Price Validation)', { items, total });
      res.json({ message: 'Order created successfully', orderId: result.insertId, total });
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/', (req, res) => {
  res.send('Ecommerce API - Phase 2 Backend Online');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
