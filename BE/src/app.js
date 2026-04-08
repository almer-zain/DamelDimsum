// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

const v1Routes = require('./api/v1/routes');
const errorHandler = require('./api/v1/middlewares/error.middleware');

const app = express();

// ---------------------
// 1. DYNAMIC CORS CONFIG
// ---------------------
const allowedOrigins = [
  'http://localhost:5173',
  'https://localhost:5173',
  'http://127.0.0.1:5173',
  'https://dameldimsum.my.id', // ADDED YOUR PRODUCTION DOMAIN
  'https://randolph-jawbreaking-myung.ngrok-free.dev'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','ngrok-skip-browser-warning']
}));

// Catch-all preflight
app.options(/.*/, cors()); 

// ---------------------
// 2. HELMET (SECURITY)
// ---------------------
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'",
                     "https://app.sandbox.midtrans.com",
                     "https://api.sandbox.midtrans.com",
                     "https://snap-assets.al-pc-id-b.cdn.gtflabs.io"],
      "connect-src": ["'self'", 
                     "https://randolph-jawbreaking-myung.ngrok-free.dev",
                     "https://app.sandbox.midtrans.com", // ADDED MIDTRANS
                     "https://api.sandbox.midtrans.com"], // ADDED MIDTRANS
      "frame-src": ["'self'", "https://app.sandbox.midtrans.com"], // ADDED FOR MIDTRANS POPUP
      "img-src": ["'self'", "data:", "blob:", "http:", "https:", "http://localhost:5173"]
    }
  }
}));

// ---------------------
// 3. PARSERS
// ---------------------
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ createParentPath: true }));

// ---------------------
// 4. STATIC FILES (UPLOADS)
// ---------------------
const uploadsPath = path.resolve(__dirname, '../public/uploads');
app.use('/uploads', express.static(uploadsPath));

// ---------------------
// 5. API ROUTES
// ---------------------
app.use('/api/v1', v1Routes);

// ---------------------
// 6. SERVE VUE FRONTEND
// ---------------------
// FIXED PATH: Since this file is in 'src/', we only go up ONE level to reach 'FE'
const frontendDistPath = path.join(__dirname, '../FE/dist'); 
app.use(express.static(frontendDistPath));

// ---------------------
// 7. ERROR HANDLING (Must stay before the catch-all)
// ---------------------
app.use(errorHandler);

// ---------------------
// 8. SPA CATCH-ALL (CRITICAL)
// ---------------------
// This ensures that if a user refreshes the page on /about, 
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

module.exports = app;