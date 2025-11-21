const { auth, db } = require('../config/firebase');
const bcrypt = require('bcryptjs');

/**
 * Registra el usuario en Firebase Authentication y asigna un rol inicial.
 * Maneja errores en cada paso y realiza rollback si es necesario para
 * evitar usuarios huérfanos en Auth cuando falla la escritura en Firestore.
 */
const registrarUsuario = async (userData) => {
  // extraemos todos los datos que vienen desde el controlador
  const {
    email,
    password,
    nombre,
    apellido,
    edad,
    sede,
    genero,
  } = userData;

  const rol = 'estudiante'; // rol por defecto
  let uid;
  let hashedPassword; // MOD: declaramos hashedPassword fuera del try para poder usarla después

  // 1. Crear el usuario en Firebase Auth (para obtener el UID)
  try {
    // MOD: hasheamos la contraseña y la guardamos en la variable externa
    hashedPassword = await bcrypt.hash(password, 10);

    const userRecord = await auth.createUser({
      email,
      password, // Firebase Auth guarda su propio hash
      displayName: `${nombre} ${apellido}`, // opcional, mostramos nombre completo
    });

    uid = userRecord.uid;
  } catch (err) {
    console.error('Error creando usuario en Firebase Auth:', err);
    throw new Error(`AuthCreateError: ${err.message || err}`);
  }

  // 2. Guardar el perfil detallado en Firestore
  try {
    await db.collection('usuario').doc(uid).set({
      nombre,
      apellido,
      email,
      password: hashedPassword,   
      rol,
      edad,
      sede,
      genero,
      fecha_registro: new Date(),
    });
  } catch (err) {
    console.error('Error escribiendo documento de usuario en Firestore:', err);

    try {
      if (uid) {
        await auth.deleteUser(uid);
        console.warn(
          `Usuario Auth (${uid}) eliminado por rollback tras fallo en Firestore.`
        );
      }
    } catch (deleteErr) {
      console.error('Error eliminando usuario en Auth durante rollback:', deleteErr);
    }

    throw new Error(`FirestoreWriteError: ${err.message || err}`);
  }

  // 3. Asignar rol (Custom Claim)
  try {
    await auth.setCustomUserClaims(uid, { rol });
  } catch (err) {
    console.error('Error asignando Custom Claims:', err);
    throw new Error(`CustomClaimsError: ${err.message || err}`);
  }

  return { uid, rol };
};

// Aquí irían otras funciones de login/logout/gestión de guardias...
// Por ahora, solo necesitamos registrar.

module.exports = {
    registrarUsuario,
};

