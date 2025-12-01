import mongoose from "mongoose";

const mensajeSchema = new mongoose.Schema(
    {
        de: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        para: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            default: null // null = mensaje para admin
        },
        mensaje: { 
            type: String, 
            required: true, 
            trim: true 
        },
        leido: { 
            type: Boolean, 
            default: false 
        },
        esDelAdmin: { 
            type: Boolean, 
            default: false 
        }
    },
    { timestamps: true }
);

// Índices para búsquedas rápidas
mensajeSchema.index({ de: 1, para: 1, createdAt: -1 });
mensajeSchema.index({ leido: 1 });

export default mongoose.model('Mensaje', mensajeSchema);