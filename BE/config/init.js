// src/config/init.js
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initialize() {
  const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;

  // 1. Connect to MySQL without a database selected
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
  });

  // 2. Create the database if it doesn't exist
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  console.log(`✔ Database "${DB_NAME}" checked/created.`);
  
  await connection.end();
}

initialize().catch(err => {
  console.error('❌ Failed to initialize database:', err.message);
  process.exit(1);
});