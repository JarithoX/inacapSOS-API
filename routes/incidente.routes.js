const { Router } = require('express');
// Importamos la nueva función del controlador
const { getIncidentes, createIncidente, updateIncidente } = require('../controllers/incidente.controller');

const router = Router();

// Ruta para obtener todos los incidentes
router.get('/', getIncidentes);

// Ruta para crear un nuevo incidente
router.post('/', createIncidente);

// Ruta para actualizar un incidente existente
router.put('/:id', updateIncidente);

module.exports = router;
