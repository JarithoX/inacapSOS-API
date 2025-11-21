const { db } = require('../config/firebase'); 
const authService = require('../services/auth.service');
const bcrypt = require('bcryptjs');

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
    const { email } = req.body;
    const password = req.body.password ?? req.body.contrasena;    

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'El email y la contraseña son requeridos.' });
    }

    const usuariosRef = db.collection('usuario'); // colección correcta
    const snapshot = await usuariosRef.where('email', '==', email).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const usuarioDoc = snapshot.docs[0];
    const usuarioData = usuarioDoc.data();

    // ⚠️ Si no existe el campo password en Firestore, avisamos
    if (!usuarioData.password) {
      return res.status(500).json({
        error:
          'El usuario no tiene contraseña almacenada en la base de datos. Revisa el endpoint de registro para asegurarte de que se guarde el campo "password".',
      });
    }

    const coincide = await bcrypt.compare(password, usuarioData.password);

    if (!coincide) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    const datosUsuario = {
      id: usuarioDoc.id,
      nombre: usuarioData.nombre,
      email: usuarioData.email,
      rol: usuarioData.rol,
    };

    return res
      .status(200)
      .json({ message: 'Inicio de sesión exitoso', usuario: datosUsuario });
  } catch (err) {
    console.error('Error en el inicio de sesión', err);
    return res
      .status(500)
      .json({ error: 'Error en el servidor al intentar iniciar sesión.' });
  }
}

// controlador para que la App Android pueda registrarse.
// Función que maneja la petición POST de registro
const register = async (req, res) => {

  try {
    const {
      email,
      nombre,
      apellido,
      edad,
      sede,
      genero,
    } = req.body;

    const password = req.body.password ?? req.body.contrasena;

    if (!email || !password || !nombre || !apellido || !edad || !sede || !genero) {
      return res.status(400).send({
        error:
          'Faltan campos requeridos (email, password, nombre, apellido, edad, sede, genero).',
      });
    }

    // Validar edad numérica
    const edadNumber = Number(edad);
    if (Number.isNaN(edadNumber) || edadNumber <= 0) {
      return res
        .status(400)
        .send({ error: 'La edad debe ser un número mayor que 0.' });
    }

    const userData = {
      email,
      password,
      nombre,
      apellido,
      edad: edadNumber,
      sede,
      genero,
    };

    const newUser = await authService.registrarUsuario(userData);

    // Éxito: 201 Created
    res.status(201).send({
      mensaje:
        'Usuario registrado. Use el token de Firebase Auth para las demás rutas.',
      uid: newUser.uid,
      rol: newUser.rol || 'estudiante', 
    });
  } catch (error) {
    console.error('Error al registrar usuario (detalle):', error);

    const message = error.message || String(error);
    if (message.startsWith('AuthCreateError:')) {
      return res.status(400).send({
        error:
          'Error creando usuario en Auth: ' +
          message.replace('AuthCreateError:', '').trim(),
      });
    }
    if (message.startsWith('FirestoreWriteError:')) {
      return res.status(500).send({
        error:
          'Error guardando perfil de usuario en base de datos: ' +
          message.replace('FirestoreWriteError:', '').trim(),
      });
    }
    if (message.startsWith('CustomClaimsError:')) {
      return res.status(500).send({
        error:
          'Error asignando roles al usuario, contacte al administrador: ' +
          message.replace('CustomClaimsError:', '').trim(),
      });
    }

    res.status(500).send({ error: message });
  }
};

module.exports = {
    getUsuarios,
    loginUsuario,
    register
};