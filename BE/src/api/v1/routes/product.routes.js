const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createProduct } = require('../validations/all.validation');

router.get('/', productController.getAll);
router.post('/', auth, validate(createProduct), productController.create);
router.put('/:id', auth, productController.update);
router.delete('/:id', auth, productController.delete);
router.delete('/upload-only', auth, productController.uploadOnly);


module.exports = router;