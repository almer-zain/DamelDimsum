const express = require('express');
const router = express.Router();

const productController = require('../controllers/product.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProduct } = require('../validations/all.validation');

router.get('/', productController.getAll);

// Express-fileupload (in app.js) has already processed the files before it hits this route!
router.post('/', auth, validate(createProduct), productController.create);
router.put('/:id', auth, productController.update);
router.post('/upload-only', auth, productController.uploadOnly);
router.delete('/:id', auth, productController.delete);

module.exports = router;