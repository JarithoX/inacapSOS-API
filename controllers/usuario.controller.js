// controllers/usuario.controller.js

// 💡 ¡CORREGIDO! Usamos "destructuring" para obtener solo lo que necesitamos
const { db } = require('../config/firebase'); 
const authService = require('../services/auth.service');


// GET /usuarios
async function getUsuarios(_req, res) {
  try {
    // 'db' ahora SÍ es la instancia de Firestore
    const snapshot = await db.collection('usuario').get(); 
    const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(usuarios);
    return res.status(200).json(usuarios);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    return res.status(500).json({ error: 'Error al obtener usuarios' });
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
  register,
};