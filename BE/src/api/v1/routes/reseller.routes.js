const express = require('express');
const router = express.Router();
const resellerController = require('../controllers/reseller.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { resellerApply } = require('../validations/all.validation');

// Public
router.post('/apply', validate(resellerApply), resellerController.apply);
router.get('/search', resellerController.search);

// Admin
router.get('/admin', auth, resellerController.getAdminList);

// FIXED: Added getById
router.get('/admin/:id', auth, resellerController.getById); 

// NEW: Generic Update (Change name, whatsapp, city, etc)
router.patch('/admin/:id', auth, resellerController.update); 

// NEW: Delete Reseller
router.delete('/admin/:id', auth, resellerController.delete); 

// Keep verify if you want a separate route just for status changes
router.patch('/admin/:id/verify', auth, resellerController.verify);

module.exports = router;