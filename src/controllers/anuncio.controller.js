import Anuncio from "../models/Anuncio.js";

// Crear anuncio (solo admin)
export async function createAnuncio(req, res) {
    try {
        const { titulo, descripcion, tipo, prioridad } = req.body;

        if (!titulo || !descripcion)
            return res.status(400).json({ message: 'Título y descripción son requeridos' });

        const anuncio = new Anuncio({
            titulo,
            descripcion,
            tipo: tipo || 'Anuncio',
            prioridad: prioridad || 'Media',
            creadoPor: req.userId
        });

        await anuncio.save();
        await anuncio.populate('creadoPor', 'name email');

        res.status(201).json({ message: 'Anuncio creado', anuncio });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener todos los anuncios (usuarios y admin)
export async function getAllAnuncios(req, res) {
    try {
        const { tipo } = req.query; // Filtrar por tipo si se pasa como query
        const filtro = { activo: true };
        
        if (tipo) filtro.tipo = tipo;

        const anuncios = await Anuncio.find(filtro)
            .populate('creadoPor', 'name email')
            .sort({ createdAt: -1 });

        res.json({ anuncios });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener un anuncio por ID
export async function getAnuncioById(req, res) {
    try {
        const { id } = req.params;
        const anuncio = await Anuncio.findById(id).populate('creadoPor', 'name email');

        if (!anuncio)
            return res.status(404).json({ message: 'Anuncio no encontrado' });

        res.json({ anuncio });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Actualizar anuncio (solo admin)
export async function updateAnuncio(req, res) {
    try {
        const { id } = req.params;
        const { titulo, descripcion, tipo, prioridad, activo } = req.body;

        const anuncio = await Anuncio.findByIdAndUpdate(
            id,
            { titulo, descripcion, tipo, prioridad, activo },
            { new: true, runValidators: true }
        ).populate('creadoPor', 'name email');

        if (!anuncio)
            return res.status(404).json({ message: 'Anuncio no encontrado' });

        res.json({ message: 'Anuncio actualizado', anuncio });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Eliminar anuncio (solo admin - desactivar)
export async function deleteAnuncio(req, res) {
    try {
        const { id } = req.params;

        const anuncio = await Anuncio.findByIdAndUpdate(
            id,
            { activo: false },
            { new: true }
        );

        if (!anuncio)
            return res.status(404).json({ message: 'Anuncio no encontrado' });

        res.json({ message: 'Anuncio desactivado', anuncio });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}