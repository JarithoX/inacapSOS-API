const { db,admin } = require('../config/firebase');

// GET /usuarios
async function getUsuarios(_req, res) {
  try {
    const snapshot = await db.collection('usuarios').get();
    const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(usuarios);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

module.exports = {
  getUsuarios
};