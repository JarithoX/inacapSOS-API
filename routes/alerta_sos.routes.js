const { Router } = require('express');
const ctrl = require('../controllers/alerta_sos.controller');
const router = Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');


router.get('/', 
    authenticate, authorize(['guardia', 'admin']), ctrl.getAlertasSos); 
// Solo los Guardias y Admins pueden ver la lista completa.

//router.post('/crear', 
//    authenticate, authorize(['user', 'admin']), ctrl.crearAlerta);

// authenticate: Verifica que el usuario haya iniciado sesión (tenga token).
// authorize(['user', 'admin']): Solo usuarios normales y administradores pueden crear SOS.

module.exports = router;