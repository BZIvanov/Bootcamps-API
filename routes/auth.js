const router = require('express').Router();
const { register, login, getMe, protect } = require('../controllers/auth');

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/me').post(protect, getMe);

module.exports = router;
