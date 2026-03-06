const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');

const validate = require('../middlewares/validate.middleware'); // The police officer
const { category: categorySchema } = require('../validations/all.validation'); // The rules


router.get('/', categoryController.getAll);

router.post('/', auth, validate(categorySchema), categoryController.create);
router.put('/:id', auth, validate(categorySchema), categoryController.update);
router.delete('/:id', auth, categoryController.delete);

module.exports = router;