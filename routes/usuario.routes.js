const { Router } = require('express');
const ctrl = require('../controllers/usuario.controller');
const { authenticate } = require('../middleware/auth.middleware');
const router = Router();

// Rutas públicas (no requieren autenticación)
router.post('/login', ctrl.loginUsuario);
router.post('/register', ctrl.register);
router.post('/create-guard', ctrl.createGuard);

// Rutas protegidas (requieren autenticación)
router.get('/', authenticate, ctrl.getUsuarios);
router.get('/:id', ctrl.getUsuarioById);
router.put('/:id', ctrl.updateUsuario);

module.exports = router;