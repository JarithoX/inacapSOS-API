const { Router } = require('express');
const ctrl = require('../controllers/usuario.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = Router();

router.get('/', ctrl.getUsuarios); 
router.post('/login', ctrl.loginUsuario);
router.post('/register', ctrl.register);
router.get('/', authenticate, ctrl.getUsuarios); 

module.exports = router;