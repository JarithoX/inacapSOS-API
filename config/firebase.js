const admin = require('firebase-admin');

const serviceAccount = require('../path/to/your/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log("Conexión a Firebase establecida correctamente.");

module.exports = { db, admin };