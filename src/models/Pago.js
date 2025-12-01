import mongoose from "mongoose";

const pagoSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    concepto: { 
        type: String, 
        required: true,
        enum: ['Mantenimiento', 'Renta', 'Reservación', 'Multa', 'Otro'],
        trim: true 
    },
    monto: { type: Number, required: true },
    mes: { type: String, trim: true }, // Ej: "Enero 2024"
    fechaVencimiento: { type: Date, required: true },
    fechaPago: { type: Date, default: null },
    estado: { 
        type: String, 
        enum: ['Pendiente', 'Pagado', 'Vencido'], 
        default: 'Pendiente' 
    },
    metodoPago: { type: String, trim: true, default: '' }, // Efectivo, transferencia, etc.
    notas: { type: String, trim: true, default: '' },
    registradoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin que lo registró
}, 
{ timestamps: true });

pagoSchema.index({ usuario: 1, estado: 1 });
pagoSchema.index({ fechaVencimiento: 1 });

export default mongoose.model('Pago', pagoSchema);