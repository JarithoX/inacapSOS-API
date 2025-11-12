const { db } = require('../config/firebase');

// GET /notificacion  
async function getNotificaciones(_req, res) {
  try {
    const snapshot = await db.collection('notificacion').get();
    const notificaciones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(notificaciones);
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
    return res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
}

module.exports = { getNotificaciones };