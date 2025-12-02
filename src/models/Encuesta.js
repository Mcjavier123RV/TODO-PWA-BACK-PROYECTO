import mongoose from "mongoose";

const preguntaSchema = new mongoose.Schema({
    textoPregunta: { type: String, required: true, trim: true },
    tipoPregunta: { 
        type: String, 
        enum: ['opcion_multiple', 'texto_libre', 'escala'], 
        required: true 
    },
    opciones: [{ type: String, trim: true }], // Para opción múltiple
    escalaMin: { type: Number, default: 1 }, // Para escala (ej: 1-5)
    escalaMax: { type: Number, default: 5 }
});

const encuestaSchema = new mongoose.Schema(
    {
        titulo: { type: String, required: true, trim: true },
        descripcion: { type: String, trim: true, default: '' },
        preguntas: [preguntaSchema],
        creadoPor: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        activa: { type: Boolean, default: true },
        fechaCierre: { type: Date, default: null },
        anonima: { type: Boolean, default: false }
    },
    { timestamps: true }
);

encuestaSchema.index({ activa: 1, createdAt: -1 });

export default mongoose.model('Encuesta', encuestaSchema);