const { db } = require('../config/firebase');

// GET /incidente - Obtener todos los incidentes
async function getIncidentes(req, res) {
    try {
        const snapshot = await db.collection('incidente').get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        // Usamos Promise.all para esperar a que se verifiquen los comentarios de CADA incidente
        const incidentes = await Promise.all(snapshot.docs.map(async doc => {
            const data = doc.data();

            // Consulta ligera: Solo pedimos 1 documento de la subcolección 'comentarios'
            // para saber si existe actividad, sin gastar recursos contando todos.
            const commentsSnapshot = await db.collection('incidente')
                .doc(doc.id)
                .collection('comentarios')
                .limit(1) 
                .get();

            return {
                id: doc.id,
                ...data,
                // Si la consulta no está vacía (!empty), significa que hay comentarios (true)
                tieneComentarios: !commentsSnapshot.empty 
            };
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

async function addComentario(req, res) {
    try {
        const { id } = req.params; // ID del incidente
        const { texto, userId, nombreUsuario } = req.body; // Datos del comentario

        if (!texto || !userId) {
            return res.status(400).json({ error: 'El texto y el userId son obligatorios.' });
        }

        // Referencia a la subcolección 'comentarios' dentro del incidente
        const comentarioRef = db.collection('incidente').doc(id).collection('comentarios');

        const nuevoComentario = {
            texto,
            userId,
            nombreUsuario: nombreUsuario || 'Anónimo', // Guardamos el nombre para no buscarlo después
            timestamp: new Date()
        };

        const docRef = await comentarioRef.add(nuevoComentario);

        res.status(201).json({ id: docRef.id, ...nuevoComentario });

    } catch (error) {
        console.error("Error al agregar comentario:", error);
        res.status(500).json({ error: "Error al guardar el comentario." });
    }
}

// GET /incidente/:id/comentarios - Obtener lista de comentarios
async function getComentarios(req, res) {
    try {
        const { id } = req.params;
        
        // Obtenemos la subcolección ordenada por fecha
        const snapshot = await db.collection('incidente').doc(id)
            .collection('comentarios')
            .orderBy('timestamp', 'asc') // Los más viejos arriba (tipo chat)
            .get();

        if (snapshot.empty) {
            return res.status(200).json([]);
        }

        const comentarios = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(comentarios);

    } catch (error) {
        console.error("Error al obtener comentarios:", error);
        res.status(500).json({ error: "Error al cargar los comentarios." });
    }
}

module.exports = {
    getIncidentes,
    createIncidente,
    updateIncidente,
    addComentario,
    getComentarios
};
