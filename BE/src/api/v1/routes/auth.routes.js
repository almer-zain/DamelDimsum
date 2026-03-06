const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { login } = require('../validations/all.validation');
const auth = require('../middlewares/auth.middleware');

router.post('/login', validate(login), authController.login);
router.post('/logout', auth, authController.logout);
router.patch('/change-password', auth, authController.changePassword);
router.get('/me', auth, authController.getMe);
router.patch('/me', auth, authController.updateMe);
router.post('/logout', auth, authController.logout);
module.exports = router;