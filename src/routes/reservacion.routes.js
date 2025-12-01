import { Router } from "express";
import { 
    createReservacion, 
    getAllReservaciones, 
    getReservacionById,
    getMyReservaciones,
    updateReservacion, 
    deleteReservacion 
} from "../controllers/reservacion.controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = Router();

// Rutas para usuarios - Ver sus propias reservaciones y crear
router.get("/mis-reservaciones", auth, getMyReservaciones);
router.post("/", auth, createReservacion);

// Admin puede ver todas y modificar cualquiera
router.get("/", auth, isAdmin, getAllReservaciones);
router.get("/:id", auth, getReservacionById);
router.put("/:id", auth, updateReservacion); // Usuario puede cancelar la suya, admin cualquiera
router.delete("/:id", auth, isAdmin, deleteReservacion);

export default router;