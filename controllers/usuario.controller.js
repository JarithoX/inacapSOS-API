const { db } = require('../config/firebase');

// GET /usuarios
async function getUsuarios(req, res) {
    try {
        // CORRECCIÓN 1: Usar la colección 'usuario' (singular)
        const snapshot = await db.collection('usuario').get();        const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(usuarios);
        return res.status(200).json(usuarios);
    } catch (err) {
        console.error('Error al obtener usuarios', err);
        return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
}

// POST /usuarios/login
async function loginUsuario(req, res) {
    try {
        const { email, contrasena } = req.body;

        if (!email || !contrasena) {
            return res.status(400).json({ error: 'El email y la contraseña son requeridos.' });
        }

        // CORRECCIÓN 1: Usar la colección 'usuario' (singular)
        const usuariosRef = db.collection('usuario');
        const snapshot = await usuariosRef.where('email', '==', email).limit(1).get();

        if (snapshot.empty) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        const usuarioDoc = snapshot.docs[0];
        const usuarioData = usuarioDoc.data();

        // CORRECIÓN 2: Comparar con el campo 'password' de la base de datos
        if (usuarioData.password !== contrasena) {
            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        // Si las credenciales son correctas, devolvemos los datos del usuario.
        const datosUsuario = {
            id: usuarioDoc.id,
            nombre: usuarioData.nombre,
            email: usuarioData.email,
            rol: usuarioData.rol
            // No incluyas la contraseña en la respuesta
        };

        return res.status(200).json({ message: 'Inicio de sesión exitoso', usuario: datosUsuario });

    } catch (err) {
        console.error('Error en el inicio de sesión', err);
        return res.status(500).json({ error: 'Error en el servidor al intentar iniciar sesión.' });
    }
}

module.exports = {
    getUsuarios,
    loginUsuario
};
