import mongoose from "mongoose";

const anuncioSchema = new mongoose.Schema({
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ['Anuncio', 'Reporte'], default: 'Anuncio' },
    prioridad: { type: String, enum: ['Baja', 'Media', 'Alta'], default: 'Media' },
    creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    activo: { type: Boolean, default: true }
}, 
{ timestamps: true });

anuncioSchema.index({ createdAt: -1 });

export default mongoose.model('Anuncio', anuncioSchema);