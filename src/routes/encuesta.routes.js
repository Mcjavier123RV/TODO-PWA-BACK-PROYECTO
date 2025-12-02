import { Router } from "express";
import {
    crearEncuesta,
    obtenerEncuestas,
    obtenerEncuestaPorId,
    responderEncuesta,
    obtenerResultados,
    cerrarEncuesta,
    eliminarEncuesta,
    exportarResultados
} from "../controllers/encuesta.controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = Router();

// Rutas para todos los usuarios autenticados
router.get("/", auth, obtenerEncuestas); // Ver encuestas
router.get("/:id", auth, obtenerEncuestaPorId); // Ver detalle de encuesta
router.post("/:id/responder", auth, responderEncuesta); // Responder encuesta

// Rutas solo para admin
router.post("/", auth, isAdmin, crearEncuesta); // Crear encuesta
router.get("/:id/resultados", auth, isAdmin, obtenerResultados); // Ver resultados
router.get("/:id/exportar", auth, isAdmin, exportarResultados); // Exportar para Power BI
router.patch("/:id/cerrar", auth, isAdmin, cerrarEncuesta); // Cerrar encuesta
router.delete("/:id", auth, isAdmin, eliminarEncuesta); // Eliminar encuesta

export default router;