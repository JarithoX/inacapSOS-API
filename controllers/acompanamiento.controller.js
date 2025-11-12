const { db, admin } = require('../config/firebase');

const COLL = 'acompanamiento';


// GET /acompanamineto
async function getAcompanamiento(_req, res) {
  try {
    const snapshot = await db.collection(COLL).get();
    const acompanamiento = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(acompanamiento);
    return res.status(200).json(acompanamiento);
  } catch (err) {
    console.error('Error al obtener los acompañamientos:', err);
    return res.status(500).json({ error: 'Error al obtener acompañamientos' });
  }
}

module.exports = {
  getAcompanamiento
};