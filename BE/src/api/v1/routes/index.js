const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const resellerRoutes = require('./reseller.routes');
const settingsController = require('../controllers/settings.controller');
const auth = require('../middlewares/auth.middleware');

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/resellers', resellerRoutes);

module.exports = router;

    router.get('/settings', settingsController.getSettings);
    router.patch('/settings', auth, settingsController.updateSettings); 
    router.post('/settings/upload-icon', auth, settingsController.uploadIcon); 
