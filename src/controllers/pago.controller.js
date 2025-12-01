import Pago from "../models/Pago.js";

// Crear pago (solo admin)
export async function createPago(req, res) {
    try {
        const { usuario, concepto, monto, mes, fechaVencimiento, notas } = req.body;

        if (!usuario || !concepto || !monto || !fechaVencimiento)
            return res.status(400).json({ message: 'Usuario, concepto, monto y fecha de vencimiento son requeridos' });

        const pago = new Pago({
            usuario,
            concepto,
            monto,
            mes: mes || '',
            fechaVencimiento,
            notas: notas || '',
            registradoPor: req.userId
        });

        await pago.save();
        await pago.populate('usuario', 'name email unidad');
        await pago.populate('registradoPor', 'name email');

        res.status(201).json({ message: 'Pago registrado', pago });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener todos los pagos (solo admin)
export async function getAllPagos(req, res) {
    try {
        const { estado, concepto } = req.query;
        const filtro = {};

        if (estado) filtro.estado = estado;
        if (concepto) filtro.concepto = concepto;

        const pagos = await Pago.find(filtro)
            .populate('usuario', 'name email unidad')
            .populate('registradoPor', 'name email')
            .sort({ fechaVencimiento: 1 });

        res.json({ pagos });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener mis pagos (usuario)
export async function getMyPagos(req, res) {
    try {
        const { estado } = req.query;
        const filtro = { usuario: req.userId };

        if (estado) filtro.estado = estado;

        const pagos = await Pago.find(filtro)
            .populate('usuario', 'name email unidad')  // ⬅️ AGREGA ESTA LÍNEA
            .sort({ fechaVencimiento: 1 });

        res.json({ pagos });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Obtener un pago por ID
export async function getPagoById(req, res) {
    try {
        const { id } = req.params;
        const pago = await Pago.findById(id)
            .populate('usuario', 'name email unidad')
            .populate('registradoPor', 'name email');

        if (!pago)
            return res.status(404).json({ message: 'Pago no encontrado' });

        // Verificar que sea el dueño o admin
        if (pago.usuario._id.toString() !== req.userId && req.userRole !== 'admin')
            return res.status(403).json({ message: 'No tienes permiso para ver este pago' });

        res.json({ pago });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Actualizar pago (solo admin)
export async function updatePago(req, res) {
    try {
        const { id } = req.params;
        const { concepto, monto, mes, fechaVencimiento, estado, metodoPago, notas } = req.body;

        const pago = await Pago.findByIdAndUpdate(
            id,
            { concepto, monto, mes, fechaVencimiento, estado, metodoPago, notas },
            { new: true, runValidators: true }
        ).populate('usuario', 'name email unidad')
         .populate('registradoPor', 'name email');

        if (!pago)
            return res.status(404).json({ message: 'Pago no encontrado' });

        res.json({ message: 'Pago actualizado', pago });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Marcar como pagado (solo admin)
export async function marcarComoPagado(req, res) {
    try {
        const { id } = req.params;
        const { metodoPago, fechaPago } = req.body;

        const pago = await Pago.findByIdAndUpdate(
            id,
            { 
                estado: 'Pagado',
                fechaPago: fechaPago || new Date(),
                metodoPago: metodoPago || 'No especificado'
            },
            { new: true }
        ).populate('usuario', 'name email unidad');

        if (!pago)
            return res.status(404).json({ message: 'Pago no encontrado' });

        res.json({ message: 'Pago registrado como pagado', pago });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}

// Eliminar pago (solo admin)
export async function deletePago(req, res) {
    try {
        const { id } = req.params;

        const pago = await Pago.findByIdAndDelete(id);

        if (!pago)
            return res.status(404).json({ message: 'Pago no encontrado' });

        res.json({ message: 'Pago eliminado' });
    } catch (e) {
        res.status(500).json({ message: 'Error del servidor' });
    }
}