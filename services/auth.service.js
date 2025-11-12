const { auth, db } = require('../config/firebase');

/**
 * Registra el usuario en Firebase Authentication y asigna un rol inicial.
 */
const registrarUsuario = async (email, password, nombre) => {
    const rol = 'user'; // Rol por defecto (Estudiante/Colaborador)

    // 1. Crear el usuario en Firebase Auth (para obtener el UID)
    const userRecord = await auth.createUser({
        email,
        password,
        displayName: nombre,
    });
    const uid = userRecord.uid;

    // 2. Guardar el perfil detallado en Firestore
    await db.collection('usuario').doc(uid).set({
        nombre: nombre,
        email: email,
        rol: rol,
        fecha_registro: new Date(),
    });

    // 3. ¡CRÍTICO! Asignar el rol al token JWT (Custom Claim)
    // Esto hace que el middleware de seguridad pueda autorizar al usuario
    await auth.setCustomUserClaims(uid, { rol: rol });

    return { uid, rol };
};

// Aquí irían otras funciones de login/logout/gestión de guardias...
// Por ahora, solo necesitamos registrar.

module.exports = {
    registrarUsuario,
};

