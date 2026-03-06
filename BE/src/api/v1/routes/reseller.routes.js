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
router.patch('/admin/:id/verify', auth, resellerController.verify);

module.exports = router;