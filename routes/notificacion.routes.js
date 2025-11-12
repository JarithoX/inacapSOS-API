const { Router } = require('express');
const { getNotificaciones, getNotificacionById } = require('../controllers/notificacion.controller');

const router = Router();

router.get('/', getNotificaciones);

module.exports = router;
