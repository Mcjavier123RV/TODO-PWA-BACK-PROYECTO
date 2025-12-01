import Visitante from "../models/Visitante.js";

// Crear solicitud de visitante (usuario y admin)
export async function createVisitante(req, res) {
    try {
        const { nombreVisitante, fechaVisita, horaLlegada, vehiculo, notas } = req.body;

        if (!nombreVisitante || !fechaVisita || !horaLlegada)
            return res.status(400).json({ message: 'Nombre, fecha y hora de llegada son requeridos' });

        const visitante = new Visitante({
            solicitadoPor: req.userId,
            nombreVisitante,
            fechaVisita,
            horaLlegada,
            vehiculo: vehiculo || {},
            notas: notas || ''
        });

        await visitante.save();
        await visitante.populate('solicitadoPor', 'name email unidad');

        res.status(201).json({ message: 'Visitante registrado', visitante });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener todos los visitantes (solo admin)
export async function getAllVisitantes(req, res) {
    try {
        const { estado } = req.query;
        const filtro = {};

        if (estado) filtro.estado = estado;

        const visitantes = await Visitante.find(filtro)
            .populate('solicitadoPor', 'name email unidad')
            .sort({ fechaVisita: -1 });

        res.json({ visitantes });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener mis visitantes (usuario)
export async function getMyVisitantes(req, res) {
    try {
        const visitantes = await Visitante.find({ solicitadoPor: req.userId })
            .sort({ fechaVisita: -1 });

        res.json({ visitantes });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener un visitante por ID
export async function getVisitanteById(req, res) {
    try {
        const { id } = req.params;
        const visitante = await Visitante.findById(id).populate('solicitadoPor', 'name email unidad');

        if (!visitante)
            return res.status(404).json({ message: 'Visitante no encontrado' });

        // Verificar que sea el dueño o admin
        if (visitante.solicitadoPor._id.toString() !== req.userId && req.userRole !== 'admin')
            return res.status(403).json({ message: 'No tienes permiso para ver este visitante' });

        res.json({ visitante });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Actualizar visitante
export async function updateVisitante(req, res) {
    try {
        const { id } = req.params;
        const { nombreVisitante, fechaVisita, horaLlegada, vehiculo, estado, notas } = req.body;

        const visitante = await Visitante.findById(id);

        if (!visitante)
            return res.status(404).json({ message: 'Visitante no encontrado' });

        // Usuario solo puede modificar sus propias solicitudes pendientes
        if (req.userRole !== 'admin') {
            if (visitante.solicitadoPor.toString() !== req.userId)
                return res.status(403).json({ message: 'No tienes permiso para modificar esta solicitud' });

            if (visitante.estado !== 'Pendiente')
                return res.status(403).json({ message: 'Solo puedes modificar solicitudes pendientes' });
        }

        if (nombreVisitante) visitante.nombreVisitante = nombreVisitante;
        if (fechaVisita) visitante.fechaVisita = fechaVisita;
        if (horaLlegada) visitante.horaLlegada = horaLlegada;
        if (vehiculo) visitante.vehiculo = vehiculo;
        if (estado && req.userRole === 'admin') visitante.estado = estado;
        if (notas !== undefined) visitante.notas = notas;

        await visitante.save();
        await visitante.populate('solicitadoPor', 'name email unidad');

        res.json({ message: 'Visitante actualizado', visitante });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Eliminar/cancelar visitante
export async function deleteVisitante(req, res) {
    try {
        const { id } = req.params;

        const visitante = await Visitante.findById(id);

        if (!visitante)
            return res.status(404).json({ message: 'Visitante no encontrado' });

        // Usuario solo puede cancelar sus propias solicitudes
        if (req.userRole !== 'admin' && visitante.solicitadoPor.toString() !== req.userId)
            return res.status(403).json({ message: 'No tienes permiso para cancelar esta solicitud' });

        await Visitante.findByIdAndDelete(id);

        res.json({ message: 'Visitante eliminado' });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Registrar entrada del visitante (solo admin)
export async function registrarEntrada(req, res) {
    try {
        const { id } = req.params;

        const visitante = await Visitante.findByIdAndUpdate(
            id,
            { 
                estado: 'Aprobada',
                horaEntrada: new Date()
            },
            { new: true }
        ).populate('solicitadoPor', 'name email unidad');

        if (!visitante)
            return res.status(404).json({ message: 'Visitante no encontrado' });

        res.json({ message: 'Entrada registrada', visitante });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Registrar salida del visitante (solo admin)
export async function registrarSalida(req, res) {
    try {
        const { id } = req.params;

        const visitante = await Visitante.findByIdAndUpdate(
            id,
            { 
                estado: 'Finalizada',
                horaSalida: new Date()
            },
            { new: true }
        ).populate('solicitadoPor', 'name email unidad');

        if (!visitante)
            return res.status(404).json({ message: 'Visitante no encontrado' });

        res.json({ message: 'Salida registrada', visitante });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}