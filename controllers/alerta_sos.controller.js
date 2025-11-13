const { db, admin } = require('../config/firebase');

const COLL = 'alerta_sos';//MODIFICAR a /service
const alertaService = require('../services/alerta.service');

// GET /alertas  //MODIFICAR
async function getAlertasSos(_req, res) {
  try {
    const snapshot = await db.collection(COLL).get();
    const alertaSos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(alertaSos);
    return res.status(200).json(alertaSos);
  } catch (err) {
    console.error('Error al obtener Alertas SOS:', err);
    return res.status(500).json({ error: 'Error al obtener Alertas SOS' });
  }
}


const crearAlerta = async (req, res) => {
    try {
        // Obtenemos el UID del usuario del token (gracias al middleware 'authenticate')
        const usuarioId = req.user.uid; 
        const { latitud, longitud } = req.body; 

        if (typeof latitud !== 'number' || typeof longitud !== 'number') {
             return res.status(400).send({ error: 'Latitud y longitud deben ser números.' });
        }

        // 1. Llamar al servicio que hace la lógica
        const resultado = await alertaService.crearAlertaSOS(usuarioId, latitud, longitud);

        // 2. Respuesta exitosa (tiempo crítico < 2 segundos)
        res.status(201).send({ 
            mensaje: 'Alerta SOS registrada y notificación enviada a guardias.', 
            alertaId: resultado.id 
        });

    } catch (error) {
        console.error('Error al procesar SOS:', error.message);
        // Devolvemos 500 para un fallo en el servidor/FCM
        res.status(500).send({ error: 'Fallo interno al enviar la alerta.' });
    }
};

module.exports = {
  getAlertasSos,
  crearAlerta
};