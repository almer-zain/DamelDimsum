const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { category: categorySchema } = require('../validations/all.validation');

router.get('/', categoryController.getAll);

// Create requires strict validation
router.post('/', auth, validate(categorySchema), categoryController.create);

// REMOVE strict validation for PUT unless you have a specific updateSchema, 
// because partial updates will fail the strict create rules.
router.put('/:id', auth, categoryController.update); 

router.delete('/:id', auth, categoryController.delete);

module.exports = router;