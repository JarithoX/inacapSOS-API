const { auth } = require('../config/firebase');

/**
 * 1. Verifica el Token JWT enviado por la App Móvil.
 * 2. Adjunta la información decodificada del 
 *    usuario (incluyendo el rol) a la request (req.user).
 */
const authenticate = async (req, res, next) => {
    // Intenta obtener el token del encabezado 'Authorization'
    const idToken = req.headers.authorization ? req.headers.authorization.split('Bearer ')[1] : null;

    if (!idToken) return res.status(401).send({ error: 'Token de sesión no proporcionado. Acceso denegado.' });

    try {
        // Usa el Admin SDK para verificar el token de forma segura
        const decodedToken = await auth.verifyIdToken(idToken);
        
        // El rol del usuario se guarda aquí (Viene de los Custom Claims)
        req.user = decodedToken; 
        next(); // El token es válido, continúa al controlador.
    } catch (error) {
        // 401: No Autorizado (Token inválido o expirado)
        return res.status(401).send({ error: 'Token de sesión inválido o expirado.' });
    }
};

/**
 * 3. Middleware de Autorización basado en Roles (RBAC)
 * Verifica si el rol del usuario (obtenido del token) está permitido para la ruta.
 */
const authorize = (allowedRoles) => (req, res, next) => {
    // req.user fue establecido por el middleware 'authenticate'
    const userRole = req.user.rol; 
    
    // Comprueba si el rol del usuario está en la lista de roles permitidos
    if (userRole && allowedRoles.includes(userRole)) {
        next(); // Rol permitido, permite acceso.
    } else {
        // 403: Prohibido (El usuario está autenticado, pero no tiene el rol necesario)
        res.status(403).send({ error: `Acceso denegado. Rol '${userRole}' no autorizado para esta acción.` });
    }
};

module.exports = {
    authenticate,
    authorize
};