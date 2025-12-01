import { Router } from "express";
import { 
    createVisitante, 
    getAllVisitantes, 
    getVisitanteById,
    getMyVisitantes,
    updateVisitante, 
    deleteVisitante,
    registrarEntrada,
    registrarSalida
} from "../controllers/visitante.controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = Router();

// Rutas para usuarios - Ver y crear sus propias visitas
router.get("/mis-visitas", auth, getMyVisitantes);
router.post("/", auth, createVisitante);

// Admin puede ver todas y gestionar
router.get("/", auth, isAdmin, getAllVisitantes);
router.get("/:id", auth, getVisitanteById);
router.put("/:id", auth, updateVisitante); // Usuario puede editar la suya, admin cualquiera
router.delete("/:id", auth, deleteVisitante); // Usuario puede cancelar la suya, admin cualquiera

// Admin registra entrada/salida del visitante
router.patch("/:id/entrada", auth, isAdmin, registrarEntrada);
router.patch("/:id/salida", auth, isAdmin, registrarSalida);

export default router;