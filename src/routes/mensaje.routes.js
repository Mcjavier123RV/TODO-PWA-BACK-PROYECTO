import { Router } from "express";
import {
    enviarMensaje,
    obtenerConversacion,
    marcarComoLeido,
    listarConversaciones,
    obtenerNoLeidos
} from "../controllers/mensaje.controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = Router();

// Rutas para todos los usuarios autenticados
router.post("/", auth, enviarMensaje); // Enviar mensaje
router.get("/conversacion", auth, obtenerConversacion); // Ver conversación
router.put("/marcar-leido", auth, marcarComoLeido); // Marcar como leído
router.get("/no-leidos", auth, obtenerNoLeidos); // Cantidad de no leídos

// Rutas solo para admin
router.get("/conversaciones", auth, isAdmin, listarConversaciones); // Lista de todas las conversaciones

export default router;