const { Router } = require('express');
const ctrl = require('../controllers/usuario.controller');
const router = Router();

router.get('/', ctrl.getUsuarios);

router.post('/login', ctrl.loginUsuario);

module.exports = router;