const { db } = require('../config/firebase'); 
const authService = require('../services/auth.service');

// GET /usuarios
async function getUsuarios(req, res) {
    try {
        const snapshot = await db.collection('usuario').get();
        const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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


// controlador para que la App Android pueda registrarse.
// Función que maneja la petición POST de registro
const register = async (req, res) => {
    try {
        const { email, password, nombre } = req.body;
        
        // Validación básica
        if (!email || !password || !nombre) {
             return res.status(400).send({ error: 'Faltan campos (email, password, nombre) requeridos.' });
        }

    // 1. Llama al Servicio (que ahora registra en Auth y Firestore)
    const newUser = await authService.registrarUsuario(email, password, nombre);

    // 2. Éxito: 201 Created
    res.status(201).send({
      mensaje: 'Usuario registrado. Use el token de Firebase Auth para las demás rutas.',
      uid: newUser.uid,
      rol: newUser.rol || 'user'
    });

    } catch (error) {
    // Mostrar todo el objeto error en consola para diagnóstico
    console.error('Error al registrar usuario (detalle):', error);

    // Clasificar tipos de error por prefijo creado en el servicio
    const message = error.message || String(error);
    if (message.startsWith('AuthCreateError:')) {
      return res.status(400).send({ error: 'Error creando usuario en Auth: ' + message.replace('AuthCreateError:','').trim() });
    }
    if (message.startsWith('FirestoreWriteError:')) {
      return res.status(500).send({ error: 'Error guardando perfil de usuario en base de datos: ' + message.replace('FirestoreWriteError:','').trim() });
    }
    if (message.startsWith('CustomClaimsError:')) {
      return res.status(500).send({ error: 'Error asignando roles al usuario, contacte al administrador: ' + message.replace('CustomClaimsError:','').trim() });
    }

    // Error genérico
    res.status(500).send({ error: message });
    }
};

module.exports = {
    getUsuarios,
    loginUsuario,
    register
};