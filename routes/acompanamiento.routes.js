const { Router } = require('express');
const ctrl = require('../controllers/acompanamiento.controller');
const router = Router();

router.get('/', ctrl.getAcompanamiento); 


module.exports = router;