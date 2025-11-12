const { db, admin } = require('../config/firebase');
const bcrypt = require('bcryptjs');

const COLL = 'alerta_sos';


// Helper para convertir datos de Firestore
const toHabitoPublic = (data) => {
    // Si la fecha es un Timestamp de Firestore, convertirla a string ISO para Django
    const fecha = data.fecha && data.fecha.toDate ? data.fecha.toDate().toISOString() : data.fecha;

    return {
        fecha: fecha,
        estado: data.estado,
        tipo: data.tipo || 'Sin tipo',
        ubicacion: data.ubicacion,
        id: data.id,
    };
};