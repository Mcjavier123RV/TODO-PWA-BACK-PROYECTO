import Reservacion from "../models/Reservacion.js";

// Crear reservación (usuarios y admin)
export async function createReservacion(req, res) {
    try {
        const { area, fecha, horaInicio, horaFin, notas, costo } = req.body;

        if (!area || !fecha || !horaInicio || !horaFin)
            return res.status(400).json({ message: 'Área, fecha, hora inicio y hora fin son requeridos' });

        // Verificar si ya existe una reservación para esa área en ese horario
        const reservacionExistente = await Reservacion.findOne({
            area,
            fecha: new Date(fecha),
            estado: { $ne: 'Cancelada' },
            $or: [
                { horaInicio: { $lte: horaInicio }, horaFin: { $gt: horaInicio } },
                { horaInicio: { $lt: horaFin }, horaFin: { $gte: horaFin } },
                { horaInicio: { $gte: horaInicio }, horaFin: { $lte: horaFin } }
            ]
        });

        if (reservacionExistente)
            return res.status(409).json({ message: 'Ya existe una reservación en ese horario' });

        const reservacion = new Reservacion({
            usuario: req.userId,
            area,
            fecha,
            horaInicio,
            horaFin,
            notas: notas || '',
            costo: costo || 0
        });

        await reservacion.save();
        await reservacion.populate('usuario', 'name email unidad');

        res.status(201).json({ message: 'Reservación creada', reservacion });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener todas las reservaciones (solo admin)
export async function getAllReservaciones(req, res) {
    try {
        const { area, estado } = req.query;
        const filtro = {};

        if (area) filtro.area = area;
        if (estado) filtro.estado = estado;

        const reservaciones = await Reservacion.find(filtro)
            .populate('usuario', 'name email unidad')
            .sort({ fecha: -1 });

        res.json({ reservaciones });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener mis reservaciones (usuario)
export async function getMyReservaciones(req, res) {
    try {
        const reservaciones = await Reservacion.find({ usuario: req.userId })
            .sort({ fecha: -1 });

        res.json({ reservaciones });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener una reservación por ID
export async function getReservacionById(req, res) {
    try {
        const { id } = req.params;
        const reservacion = await Reservacion.findById(id).populate('usuario', 'name email unidad');

        if (!reservacion)
            return res.status(404).json({ message: 'Reservación no encontrada' });

        // Verificar que sea el dueño o admin
        if (reservacion.usuario._id.toString() !== req.userId && req.userRole !== 'admin')
            return res.status(403).json({ message: 'No tienes permiso para ver esta reservación' });

        res.json({ reservacion });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Actualizar reservación (dueño puede cancelar, admin puede modificar)
export async function updateReservacion(req, res) {
    try {
        const { id } = req.params;
        const { area, fecha, horaInicio, horaFin, estado, notas, costo } = req.body;

        const reservacion = await Reservacion.findById(id);

        if (!reservacion)
            return res.status(404).json({ message: 'Reservación no encontrada' });

        // Usuario solo puede cancelar su propia reservación
        if (req.userRole !== 'admin') {
            if (reservacion.usuario.toString() !== req.userId)
                return res.status(403).json({ message: 'No tienes permiso para modificar esta reservación' });

            // Usuario solo puede cancelar
            if (estado && estado !== 'Cancelada')
                return res.status(403).json({ message: 'Solo puedes cancelar tu reservación' });

            reservacion.estado = 'Cancelada';
        } else {
            // Admin puede modificar todo
            if (area) reservacion.area = area;
            if (fecha) reservacion.fecha = fecha;
            if (horaInicio) reservacion.horaInicio = horaInicio;
            if (horaFin) reservacion.horaFin = horaFin;
            if (estado) reservacion.estado = estado;
            if (notas !== undefined) reservacion.notas = notas;
            if (costo !== undefined) reservacion.costo = costo;
        }

        await reservacion.save();
        await reservacion.populate('usuario', 'name email unidad');

        res.json({ message: 'Reservación actualizada', reservacion });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Eliminar reservación (solo admin)
export async function deleteReservacion(req, res) {
    try {
        const { id } = req.params;

        const reservacion = await Reservacion.findByIdAndDelete(id);

        if (!reservacion)
            return res.status(404).json({ message: 'Reservación no encontrada' });

        res.json({ message: 'Reservación eliminada' });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}