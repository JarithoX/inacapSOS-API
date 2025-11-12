const { Router } = require('express');
const ctrl = require('../controllers/usuario.controller');
const router = Router();

router.get('/', ctrl.getUsuarios); 


module.exports = router;