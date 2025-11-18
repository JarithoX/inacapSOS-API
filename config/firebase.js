const admin = require('firebase-admin');

let serviceAccount;
try {
    // 💡 Paso A: Verificar si el archivo es leído correctamente
    serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
    console.error("ERROR CRÍTICO: No se pudo cargar serviceAccountKey.json. Revise la ruta.", error.message);
    // Podrías salir del proceso aquí si es fatal.
    process.exit(1); 
}

try {
    // 💡 Paso B: Intentar inicializar la app
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Conexión a Firebase establecida correctamente.");
} catch (error) {
    // Si falla aquí, el JSON es inválido o ya se inicializó
    if (!error.message.includes('already exists')) {
        console.error("ERROR CRÍTICO: Fallo la inicialización de Firebase. Revise el contenido del JSON.", error.message);
        process.exit(1);
    }
}

//instancias que usaremos en los services y middlewares.
const db = admin.firestore();       // Usado para persistencia de datos (Alertas, Usuarios)
const auth = admin.auth();         // Usado para crear/validar usuarios y gestionar roles (Custom Claims)
const messaging = admin.messaging(); // Usado para enviar notificaciones push a Guardias/Usuarios


module.exports = { db, auth, messaging, admin };