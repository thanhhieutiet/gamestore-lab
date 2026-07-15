const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'db',
  user: 'dbuser',
  password: 'dbpassword',
  database: 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
