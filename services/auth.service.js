const { auth, db } = require('../config/firebase');

/**
 * Registra el usuario en Firebase Authentication y asigna un rol inicial.
 * Maneja errores en cada paso y realiza rollback si es necesario para
 * evitar usuarios huérfanos en Auth cuando falla la escritura en Firestore.
 */
const registrarUsuario = async (email, password, nombre) => {
    const rol = 'user'; // Rol por defecto (Estudiante/Colaborador)
    let uid;

    // 1. Crear el usuario en Firebase Auth (para obtener el UID)
    try {
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: nombre,
        });
        uid = userRecord.uid;
    } catch (err) {
        console.error('Error creando usuario en Firebase Auth:', err);
        // Re-lanzar con prefijo para identificar el paso que falló
        throw new Error(`AuthCreateError: ${err.message || err}`);
    }

    // 2. Guardar el perfil detallado en Firestore
    try {
        await db.collection('usuario').doc(uid).set({
            nombre: nombre,
            email: email,
            rol: rol,
            fecha_registro: new Date(),
        });
    } catch (err) {
        console.error('Error escribiendo documento de usuario en Firestore:', err);
        // Intentar borrar el usuario creado en Auth para no dejar huérfanos
        try {
            if (uid) await auth.deleteUser(uid);
            console.warn(`Usuario Auth (${uid}) eliminado por rollback tras fallo en Firestore.`);
        } catch (deleteErr) {
            console.error('Error eliminando usuario en Auth durante rollback:', deleteErr);
        }
        throw new Error(`FirestoreWriteError: ${err.message || err}`);
    }

    // 3. Asignar rol (Custom Claim)
    try {
        await auth.setCustomUserClaims(uid, { rol: rol });
    } catch (err) {
        console.error('Error asignando Custom Claims:', err);
        // No es crítico respecto a la existencia del perfil; se informa y se devuelve el uid
        throw new Error(`CustomClaimsError: ${err.message || err}`);
    }

    return { uid, rol };
};

// Aquí irían otras funciones de login/logout/gestión de guardias...
// Por ahora, solo necesitamos registrar.

module.exports = {
    registrarUsuario,
};

