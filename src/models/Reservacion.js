import mongoose from "mongoose";

const reservacionSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    area: { 
        type: String, 
        required: true, 
        enum: ['Salón de fiestas', 'Alberca', 'Gym', 'Cancha', 'Terraza', 'BBQ', 'Otro'],
        trim: true 
    },
    fecha: { type: Date, required: true },
    horaInicio: { type: String, required: true }, // Ej: "14:00"
    horaFin: { type: String, required: true }, // Ej: "18:00"
    estado: { 
        type: String, 
        enum: ['Pendiente', 'Confirmada', 'Cancelada'], 
        default: 'Confirmada' 
    },
    notas: { type: String, trim: true, default: '' },
    costo: { type: Number, default: 0 } // Por si cobra la reservación
}, 
{ timestamps: true });

reservacionSchema.index({ usuario: 1, fecha: -1 });
reservacionSchema.index({ fecha: 1, area: 1 }); // Para evitar duplicados

export default mongoose.model('Reservacion', reservacionSchema);