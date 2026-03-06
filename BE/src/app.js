const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser'); // 1. ADD THIS
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

const v1Routes = require('./api/v1/routes');
const errorHandler = require('./api/v1/middlewares/error.middleware');

const app = express();

// 2. ENABLE COOKIE PARSER (MUST be before routes)
app.use(cookieParser());

// 3. REFINED CORS CONFIG
const allowedOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error('CORS Policy violation'), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true // MANDATORY for cookies
}));

// 5. HELMET FIX
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false, 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 3. Static Folders (To access uploaded images)
const uploadsPath = path.resolve(__dirname, '../public/uploads');
app.use('/uploads', express.static(uploadsPath));

// 4. API Routes
app.use('/api/v1', v1Routes);

// 5. Health Check
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Dimsum UMKM API is running' });
});


console.log("-----------------------------------------");
console.log("SERVER CHECK:");
console.log("Images folder path:", uploadsPath);
const fs = require('fs');
if (fs.existsSync(uploadsPath)) {
    console.log("✔ Uploads folder FOUND");
} else {
    console.log("❌ Uploads folder NOT FOUND - Please create public/uploads at root");
}
console.log("-----------------------------------------");
// 6. Centralized Error Handling (Must be last)
app.use(errorHandler);

module.exports = app;