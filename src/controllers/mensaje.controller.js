import Mensaje from "../models/Mensaje.js";
import User from "../models/User.js";

// Enviar mensaje
export async function enviarMensaje(req, res) {
    try {
        const { para, mensaje } = req.body;
        const userId = req.userId;
        const userRole = req.userRole;

        if (!mensaje || mensaje.trim() === "") {
            return res.status(400).json({ message: "El mensaje no puede estar vacío" });
        }

        // Si es admin, 'para' debe ser un usuario específico
        // Si es usuario, 'para' es null (mensaje al admin)
        const nuevoMensaje = new Mensaje({
            de: userId,
            para: userRole === 'admin' ? para : null,
            mensaje: mensaje.trim(),
            esDelAdmin: userRole === 'admin'
        });

        await nuevoMensaje.save();
        await nuevoMensaje.populate('de', 'name role');
        await nuevoMensaje.populate('para', 'name role');

        res.status(201).json({ message: "Mensaje enviado", mensaje: nuevoMensaje });
    } catch (error) {
        console.error("Error enviando mensaje:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Obtener conversación (admin con un usuario específico, o usuario con admin)
export async function obtenerConversacion(req, res) {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { conUsuarioId } = req.query; // Admin especifica con quién habla

        let filtro;

        if (userRole === 'admin') {
            // Admin ve conversación con un usuario específico
            if (!conUsuarioId) {
                return res.status(400).json({ message: "Debes especificar con qué usuario hablar" });
            }
            filtro = {
                $or: [
                    { de: userId, para: conUsuarioId },
                    { de: conUsuarioId, para: userId }
                ]
            };
        } else {
            // Usuario ve su conversación con admin
            filtro = {
                $or: [
                    { de: userId, para: null }, // Usuario envió al admin
                    { de: { $ne: userId }, para: userId } // Admin le respondió
                ]
            };
        }

        const mensajes = await Mensaje.find(filtro)
            .populate('de', 'name role')
            .populate('para', 'name role')
            .sort({ createdAt: 1 });

        res.json({ mensajes });
    } catch (error) {
        console.error("Error obteniendo conversación:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Marcar mensajes como leídos
export async function marcarComoLeido(req, res) {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        const { conUsuarioId } = req.body;

        let filtro;

        if (userRole === 'admin') {
            // Admin marca como leídos los mensajes de un usuario
            filtro = {
                de: conUsuarioId,
                para: userId,
                leido: false
            };
        } else {
            // Usuario marca como leídos los mensajes del admin
            filtro = {
                para: userId,
                leido: false
            };
        }

        await Mensaje.updateMany(filtro, { leido: true });

        res.json({ message: "Mensajes marcados como leídos" });
    } catch (error) {
        console.error("Error marcando mensajes como leídos:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Obtener lista de conversaciones (solo admin)
export async function listarConversaciones(req, res) {
    try {
        // Obtener todos los usuarios que han enviado mensajes
        const conversaciones = await Mensaje.aggregate([
            {
                $match: {
                    $or: [
                        { para: null }, // Mensajes de usuarios al admin
                        { esDelAdmin: true } // Mensajes del admin a usuarios
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$para", null] },
                            "$de", // Si para es null, agrupar por 'de'
                            "$para" // Si no, agrupar por 'para'
                        ]
                    },
                    ultimoMensaje: { $last: "$mensaje" },
                    ultimaFecha: { $last: "$createdAt" },
                    noLeidos: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$leido", false] }, { $eq: ["$esDelAdmin", false] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { ultimaFecha: -1 } }
        ]);

        // Poblar información de usuarios
        const usuariosIds = conversaciones.map(c => c._id);
        const usuarios = await User.find({ _id: { $in: usuariosIds } }).select('name email unidad role');

        const conversacionesConUsuario = conversaciones.map(conv => {
            const usuario = usuarios.find(u => u._id.toString() === conv._id.toString());
            return {
                usuario,
                ultimoMensaje: conv.ultimoMensaje,
                ultimaFecha: conv.ultimaFecha,
                noLeidos: conv.noLeidos
            };
        });

        res.json({ conversaciones: conversacionesConUsuario });
    } catch (error) {
        console.error("Error listando conversaciones:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}

// Obtener número de mensajes no leídos (para notificaciones)
export async function obtenerNoLeidos(req, res) {
    try {
        const userId = req.userId;
        const userRole = req.userRole;

        let filtro;

        if (userRole === 'admin') {
            // Admin: mensajes no leídos de cualquier usuario
            filtro = {
                para: userId,
                leido: false
            };
        } else {
            // Usuario: mensajes no leídos del admin
            filtro = {
                para: userId,
                leido: false
            };
        }

        const count = await Mensaje.countDocuments(filtro);

        res.json({ noLeidos: count });
    } catch (error) {
        console.error("Error obteniendo no leídos:", error);
        res.status(500).json({ message: "Error del servidor" });
    }
}