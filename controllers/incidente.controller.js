const { db,admin } = require('../config/firebase');

// GET /incidente 
async function getIncidentes(_req, res) {
  try {
    const snapshot = await db.collection('incidente').get(); // colección 'incidente'
    const incidentes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return res.status(200).json(incidentes);
  } catch (err) {
    console.error('Error al obtener incidentes:', err);
    return res.status(500).json({ error: 'Error al obtener incidentes' });
  }
}



module.exports = { getIncidentes };
