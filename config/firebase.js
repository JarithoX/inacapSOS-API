const admin = require('firebase-admin');

let appInitialized = false;

try {
  if (admin.apps.length === 0) {
    let useDefaultCredentials = false;
    let serviceAccount;

    try {
      // Intentamos cargar el JSON local (entorno de desarrollo)
      serviceAccount = require('./serviceAccountKey.json');
      console.log('serviceAccountKey.json cargado correctamente.');
    } catch (error) {
      console.warn(
        'No se pudo cargar serviceAccountKey.json, se intentarán credenciales por defecto del entorno (Cloud Run / GCP).',
        error.message
      );
      useDefaultCredentials = true;
    }

    if (useDefaultCredentials) {
      // Entorno GCP (Cloud Run): usa el service account por defecto del servicio
      admin.initializeApp();
      console.log('Firebase inicializado con credenciales por defecto de GCP.');
    } else {
      // Entorno local: usa el JSON de service account
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase inicializado con serviceAccountKey.json.');
    }

    appInitialized = true;
  }
} catch (error) {
  console.error(
    'ERROR CRÍTICO: Falló la inicialización de Firebase.',
    error.message
  );
  // ⚠️ NO hacemos process.exit(1); dejamos que Cloud Run loguee el error
}

// Instancias que usaremos en los services y middlewares.
const db = admin.firestore();        // Persistencia (usuarios, alertas, etc.)
const auth = admin.auth();           // Auth y custom claims
const messaging = admin.messaging(); // Notificaciones push

module.exports = { db, auth, messaging, admin };
