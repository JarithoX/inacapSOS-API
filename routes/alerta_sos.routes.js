const { Router } = require('express');
const ctrl = require('../controllers/alerta_sos.controller');
const router = Router();

router.get('/', ctrl.getAlertasSos); 


module.exports = router;