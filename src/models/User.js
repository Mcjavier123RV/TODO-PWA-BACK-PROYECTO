import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'usuario'], default: 'usuario' },
    unidad: { type: String, trim: true }, // Número de departamento/casa
    telefono: { type: String, trim: true },
    activo: { type: Boolean, default: true }
}, 
{ timestamps: true });

export default mongoose.model('User', userSchema);