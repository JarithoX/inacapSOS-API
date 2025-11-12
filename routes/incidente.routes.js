// routes/incidente.routes.js
const { Router } = require('express');
const { getIncidentes } = require('../controllers/incidente.controller');

const router = Router();

router.get('/', getIncidentes);      // GET /incidente

module.exports = router;
