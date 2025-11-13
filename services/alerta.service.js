const { db, messaging, admin } = require('../config/firebase');

// Función simple para generar un ID único de trazabilidad (ej: ALR-20251112-X)
const generateTrazabilidadId = () => {
    return 'ALR-' + Date.now().toString(); 
};

/**
 * Crea la alerta SOS, la registra en Firestore y notifica a los guardias.
 * @param {string} usuarioId - UID del usuario que envía la alerta (obtenido del token).
 * @param {number} lat - Latitud de la ubicación.
 * @param {number} lng - Longitud de la ubicación.
 */
const crearAlertaSOS = async (usuarioId, lat, lng) => {
    // 1. Crear el objeto de alerta con datos de trazabilidad
    const nuevaAlerta = {
        usuario_id: usuarioId, // El UID del emisor
        estado: 'Nuevo', // Estado inicial
        fecha_creacion: admin.firestore.FieldValue.serverTimestamp(), // Timestamp de Firebase
        tipo: 'Pánico SOS',
        // Usamos el tipo GeoPoint para consultas geográficas
        ubicacion: new admin.firestore.GeoPoint(lat, lng), 
        trazabilidad_id: generateTrazabilidadId(), 
    };

    // 2. Registrar en Firestore (Persistencia)
    const ref = await db.collection('alerta_sos').add(nuevaAlerta);

    // 3. Enviar Notificación Inmediata a Guardias (FCM)
    const message = {
        notification: {
            title: '🚨 ¡NUEVA ALERTA SOS!',
            body: `Se ha generado una alerta de pánico en la sede. ID: ${ref.id}`,
            sound: 'default' 
        },
        data: {
            alertaId: ref.id,
            latitud: lat.toString(),
            longitud: lng.toString(),
            tipo: 'SOS_NUEVO',
        },
        // Targeteamos a todos los dispositivos suscritos al tópico 'guardias_activos'
        topic: 'guardias_activos' 
    };

    // Esto dispara la notificación a todos los guardias simultáneamente.
    await messaging.send(message); 
    
    return { id: ref.id, estado: 'Nuevo' };
};

module.exports = {
    crearAlertaSOS,
    // ...
};