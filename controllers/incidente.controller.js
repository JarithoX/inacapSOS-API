const { db } = require('../config/firebase');

// GET /incidente - Obtener todos los incidentes
async function getIncidentes(req, res) {
    try {
        const snapshot = await db.collection('incidente').get();
        const incidentes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
        return res.status(200).json(incidentes);
    } catch (err) {
        console.error('Error al obtener incidentes', err);
        return res.status(500).json({ error: 'Error al obtener incidentes' });
    }
}

// POST /incidente - Crear un nuevo incidente
async function createIncidente(req, res) {
    try {
        // Extraemos los datos del cuerpo de la petición
        const { titulo, descripcion, latitud, longitud, userId, estado, evidencia_url } = req.body;

        // Validación simple para asegurarnos de que los datos necesarios están presentes
        if (!titulo || !descripcion || !latitud || !longitud || !userId) {
            return res.status(400).json({ error: 'Faltan campos requeridos en la solicitud.' });
        }

        const nuevoIncidente = {
            titulo,
            descripcion,
            latitud,
            longitud,
            userId,
            estado: estado || 'activa',
            evidencia_url: evidencia_url || '',
            timestamp: new Date() // Agregamos una marca de tiempo
        };

        // Añadimos el nuevo incidente a la colección 'incidente' en Firestore
        const docRef = await db.collection('incidente').add(nuevoIncidente);

        // Devolvemos una respuesta exitosa (201 Created) con los datos guardados
        res.status(201).json({ id: docRef.id, ...nuevoIncidente });

    } catch (error) {
        console.error("Error al crear el incidente:", error);
        res.status(500).json({ error: "Ocurrió un error al guardar el incidente." });
    }
}

// PUT /incidente/:id - Actualizar un incidente existente
async function updateIncidente(req, res) {
    try {
        const { id } = req.params;
        const datosAActualizar = req.body; 
        if (!id) {
            return res.status(400).json({ error: "El ID del incidente es obligatorio" });
        }

        const incidenteRef = db.collection('incidente').doc(id);
        const doc = await incidenteRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Incidente no encontrado" });
        }

        // Actualizamos en Firestore
        await incidenteRef.update(datosAActualizar);

        return res.status(200).json({
            message: "Incidente actualizado correctamente",
            id: id,
            datosActualizados: datosAActualizar
        });

    } catch (error) {
        console.error("Error al actualizar incidente:", error);
        return res.status(500).json({ error: "Error interno del servidor al actualizar el incidente" });
    }
}

module.exports = {
    getIncidentes,
    createIncidente,
    updateIncidente
};
