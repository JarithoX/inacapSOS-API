const { db, admin } = require('../config/firebase');

const COLL = 'alerta_sos';


// Helper para convertir datos de Firestore
const toHabitoPublic = (data) => {
    // Si la fecha es un Timestamp de Firestore, convertirla a string ISO para Django
    const fecha = data.fecha && data.fecha.toDate ? data.fecha.toDate().toISOString() : data.fecha;

    return {
        fecha: fecha,
        estado: data.estado,
        tipo: data.tipo || 'Sin tipo',
        ubicacion: data.ubicacion,
        id: data.id,
    };
};


// GET /alertas
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

module.exports = {
  getAlertasSos
};