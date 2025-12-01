import mongoose from "mongoose";

const visitanteSchema = new mongoose.Schema({
    solicitadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    nombreVisitante: { type: String, required: true, trim: true },
    fechaVisita: { type: Date, required: true },
    horaLlegada: { type: String, required: true }, // Ej: "15:00"
    vehiculo: { 
        placas: { type: String, trim: true, default: '' },
        marca: { type: String, trim: true, default: '' },
        color: { type: String, trim: true, default: '' }
    },
    estado: { 
        type: String, 
        enum: ['Pendiente', 'Aprobada', 'Rechazada', 'Finalizada'], 
        default: 'Pendiente' 
    },
    notas: { type: String, trim: true, default: '' },
    horaEntrada: { type: Date, default: null }, // Cuando realmente entró
    horaSalida: { type: Date, default: null } // Cuando salió
}, 
{ timestamps: true });

visitanteSchema.index({ solicitadoPor: 1, fechaVisita: -1 });
visitanteSchema.index({ estado: 1, fechaVisita: 1 });

export default mongoose.model('Visitante', visitanteSchema);