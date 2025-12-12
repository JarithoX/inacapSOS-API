const { Router } = require('express');
// Importamos la nueva función del controlador
const { getIncidentes, createIncidente, updateIncidente, addComentario, getComentarios } = require('../controllers/incidente.controller');

const router = Router();

router.get('/', getIncidentes);
router.post('/', createIncidente);
router.put('/:id', updateIncidente);

router.post('/:id/comentarios', addComentario);
router.get('/:id/comentarios', getComentarios);

module.exports = router;
