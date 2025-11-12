const express = require('express');
const cors = require('cors');

const usuariosRoutes = require('./routes/usuario.routes');
const incidenteRoutes = require('./routes/incidente.routes');
const alertaSosRoutes = require('./routes/alerta_sos.routes');
const acompanamientoRoutes = require('./routes/acompanamiento.routes');
const notificacionRoutes = require('./routes/notificacion.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ['http://localhost:8000'], credentials: true }));
app.use(express.json());

// Rutas de la API
app.use('/usuarios', usuariosRoutes);
app.use('/incidente', incidenteRoutes);
app.use('/alertas', alertaSosRoutes);
app.use('/acompanamiento', acompanamientoRoutes);
app.use('/notificacion', notificacionRoutes);

// ping opcional
app.get('/', (_req, res) => res.status(200).send('API InacapSOS funcionando.'));

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server corriendo en http://localhost:${PORT}`);
    console.log('Rutas disponibles:');
    console.log(`- http://localhost:${PORT}/usuarios`);
    console.log(`- http://localhost:${PORT}/incidente`);
    console.log(`- http://localhost:${PORT}/alertas`);
    console.log(`- http://localhost:${PORT}/acompanamiento`);
    console.log(`- http://localhost:${PORT}/notificacion`);
});