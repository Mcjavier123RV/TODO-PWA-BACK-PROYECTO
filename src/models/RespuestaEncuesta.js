import mongoose from "mongoose";

const respuestaPreguntaSchema = new mongoose.Schema({
    preguntaId: { type: mongoose.Schema.Types.ObjectId, required: true },
    respuesta: { type: mongoose.Schema.Types.Mixed, required: true } // String, Number, o Array
});

const respuestaEncuestaSchema = new mongoose.Schema(
    {
        encuesta: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Encuesta', 
            required: true 
        },
        usuario: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },
        respuestas: [respuestaPreguntaSchema]
    },
    { timestamps: true }
);

// Índice único: un usuario solo puede responder una vez por encuesta
respuestaEncuestaSchema.index({ encuesta: 1, usuario: 1 }, { unique: true });

export default mongoose.model('RespuestaEncuesta', respuestaEncuestaSchema);