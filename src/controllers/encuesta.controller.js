import Encuesta from "../models/Encuesta.js";
import RespuestaEncuesta from "../models/RespuestaEncuesta.js";

// Crear encuesta (solo admin)
export async function crearEncuesta(req, res) {
    try {
        const { titulo, descripcion, preguntas, fechaCierre, anonima } = req.body;

        if (!titulo || !preguntas || preguntas.length === 0) {
            return res.status(400).json({ message: "Título y al menos una pregunta son requeridos" });
        }

        const encuesta = new Encuesta({
            titulo,
            descripcion: descripcion || '',
            preguntas,
            creadoPor: req.userId,
            fechaCierre: fechaCierre || null,
            anonima: anonima || false
        });

        await encuesta.save();
        await encuesta.populate('creadoPor', 'name email');

        res.status(201).json({ message: "Encuesta creada exitosamente", encuesta });
    } catch (error) {
        console.error("Error creando encuesta:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Obtener todas las encuestas (admin ve todas, usuarios solo activas)
export async function obtenerEncuestas(req, res) {
    try {
        const userRole = req.userRole;
        const userId = req.userId;

        let filtro = {};
        
        if (userRole !== 'admin') {
            filtro.activa = true;
        }

        const encuestas = await Encuesta.find(filtro)
            .populate('creadoPor', 'name email')
            .sort({ createdAt: -1 });

        // Si es usuario, agregar info de si ya respondió
        if (userRole !== 'admin') {
            const encuestasConRespuesta = await Promise.all(
                encuestas.map(async (enc) => {
                    const yaRespondio = await RespuestaEncuesta.exists({ 
                        encuesta: enc._id, 
                        usuario: userId 
                    });
                    return {
                        ...enc.toObject(),
                        yaRespondio: !!yaRespondio
                    };
                })
            );
            return res.json({ encuestas: encuestasConRespuesta });
        }

        res.json({ encuestas });
    } catch (error) {
        console.error("Error obteniendo encuestas:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Obtener una encuesta por ID
export async function obtenerEncuestaPorId(req, res) {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.userRole;

        const encuesta = await Encuesta.findById(id).populate('creadoPor', 'name email');

        if (!encuesta) {
            return res.status(404).json({ message: "Encuesta no encontrada" });
        }

        // Verificar si el usuario ya respondió
        const yaRespondio = await RespuestaEncuesta.exists({ 
            encuesta: id, 
            usuario: userId 
        });

        res.json({ 
            encuesta: {
                ...encuesta.toObject(),
                yaRespondio: !!yaRespondio
            }
        });
    } catch (error) {
        console.error("Error obteniendo encuesta:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Responder encuesta (usuarios)
export async function responderEncuesta(req, res) {
    try {
        const { id } = req.params;
        const { respuestas } = req.body;
        const userId = req.userId;

        const encuesta = await Encuesta.findById(id);

        if (!encuesta) {
            return res.status(404).json({ message: "Encuesta no encontrada" });
        }

        if (!encuesta.activa) {
            return res.status(400).json({ message: "Esta encuesta ya está cerrada" });
        }

        // Verificar si ya respondió
        const yaRespondio = await RespuestaEncuesta.exists({ 
            encuesta: id, 
            usuario: userId 
        });

        if (yaRespondio) {
            return res.status(400).json({ message: "Ya has respondido esta encuesta" });
        }

        // Validar que respondió todas las preguntas
        if (respuestas.length !== encuesta.preguntas.length) {
            return res.status(400).json({ message: "Debes responder todas las preguntas" });
        }

        const respuestaEncuesta = new RespuestaEncuesta({
            encuesta: id,
            usuario: userId,
            respuestas
        });

        await respuestaEncuesta.save();

        res.status(201).json({ message: "Respuesta enviada exitosamente" });
    } catch (error) {
        console.error("Error respondiendo encuesta:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "Ya has respondido esta encuesta" });
        }
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Obtener resultados de una encuesta (solo admin)
export async function obtenerResultados(req, res) {
    try {
        const { id } = req.params;

        const encuesta = await Encuesta.findById(id);

        if (!encuesta) {
            return res.status(404).json({ message: "Encuesta no encontrada" });
        }

        const respuestas = await RespuestaEncuesta.find({ encuesta: id })
            .populate('usuario', 'name email unidad');

        // Contar respuestas totales
        const totalRespuestas = respuestas.length;

        // Procesar resultados por pregunta
        const resultados = encuesta.preguntas.map((pregunta, index) => {
            const respuestasPregunta = respuestas.map(r => r.respuestas[index]?.respuesta);

            let resumen;

            if (pregunta.tipoPregunta === 'opcion_multiple') {
                // Contar cada opción
                resumen = {};
                pregunta.opciones.forEach(opcion => {
                    resumen[opcion] = respuestasPregunta.filter(r => r === opcion).length;
                });
            } else if (pregunta.tipoPregunta === 'escala') {
                // Calcular promedio
                const valores = respuestasPregunta.filter(r => typeof r === 'number');
                const promedio = valores.length > 0 
                    ? valores.reduce((a, b) => a + b, 0) / valores.length 
                    : 0;
                resumen = { promedio: promedio.toFixed(2), total: valores.length };
            } else {
                // Texto libre - todas las respuestas
                resumen = respuestasPregunta.filter(r => r);
            }

            return {
                pregunta: pregunta.textoPregunta,
                tipo: pregunta.tipoPregunta,
                resumen
            };
        });

        res.json({
            encuesta: {
                titulo: encuesta.titulo,
                descripcion: encuesta.descripcion,
                totalRespuestas
            },
            resultados,
            respuestasDetalladas: encuesta.anonima ? null : respuestas
        });
    } catch (error) {
        console.error("Error obteniendo resultados:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Cerrar encuesta (solo admin)
export async function cerrarEncuesta(req, res) {
    try {
        const { id } = req.params;

        const encuesta = await Encuesta.findByIdAndUpdate(
            id,
            { activa: false },
            { new: true }
        );

        if (!encuesta) {
            return res.status(404).json({ message: "Encuesta no encontrada" });
        }

        res.json({ message: "Encuesta cerrada exitosamente", encuesta });
    } catch (error) {
        console.error("Error cerrando encuesta:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Eliminar encuesta (solo admin)
export async function eliminarEncuesta(req, res) {
    try {
        const { id } = req.params;

        // Eliminar la encuesta
        const encuesta = await Encuesta.findByIdAndDelete(id);

        if (!encuesta) {
            return res.status(404).json({ message: "Encuesta no encontrada" });
        }

        // Eliminar todas las respuestas asociadas
        await RespuestaEncuesta.deleteMany({ encuesta: id });

        res.json({ message: "Encuesta eliminada exitosamente" });
    } catch (error) {
        console.error("Error eliminando encuesta:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Exportar resultados para Power BI (solo admin)
export async function exportarResultados(req, res) {
    try {
        const { id } = req.params;

        const encuesta = await Encuesta.findById(id);
        if (!encuesta) {
            return res.status(404).json({ message: "Encuesta no encontrada" });
        }

        const respuestas = await RespuestaEncuesta.find({ encuesta: id })
            .populate('usuario', 'name email unidad role');

        // Formato para Power BI (tabla plana)
        const datosExportacion = [];

        respuestas.forEach(respuesta => {
            const fila = {
                encuesta_id: encuesta._id,
                encuesta_titulo: encuesta.titulo,
                usuario_id: respuesta.usuario._id,
                usuario_nombre: respuesta.usuario.name,
                usuario_email: respuesta.usuario.email,
                usuario_unidad: respuesta.usuario.unidad,
                fecha_respuesta: respuesta.createdAt
            };

            // Agregar cada respuesta como columna
            respuesta.respuestas.forEach((resp, index) => {
                const pregunta = encuesta.preguntas[index];
                fila[`pregunta_${index + 1}`] = pregunta.textoPregunta;
                fila[`respuesta_${index + 1}`] = resp.respuesta;
            });

            datosExportacion.push(fila);
        });

        res.json({ 
            datos: datosExportacion,
            total: datosExportacion.length 
        });
    } catch (error) {
        console.error("Error exportando resultados:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}