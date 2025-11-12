const admin = require('../config/firebase');
const db = require('../config/firebase');
const authService = require('../services/auth.service');


// GET /usuarios
async function getUsuarios(_req, res) {
  try {
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

        // 1. Llama al Servicio para registrar y asignar el rol 'user'
        const newUser = await authService.registrarUsuario(email, password, nombre);

        // 2. Éxito: 201 Created
        res.status(201).send({ 
            mensaje: 'Usuario registrado. Use el token de Firebase Auth para las demás rutas.',
            uid: newUser.uid 
        });

    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        // Manejo de errores de Firebase (ej: email ya en uso)
        res.status(400).send({ error: error.message });
    }
};

module.exports = {
  getUsuarios,
  register,
};