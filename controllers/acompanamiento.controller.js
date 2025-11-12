const { db, admin } = require('../config/firebase');

const COLL = 'acompanamiento';


// GET /acompanamineto
async function getAcompanamiento(_req, res) {
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
  getAcompanamiento
};