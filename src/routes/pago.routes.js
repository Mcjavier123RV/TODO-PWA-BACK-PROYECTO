import { Router } from "express";
import { 
    createPago, 
    getAllPagos, 
    getPagoById,
    getMyPagos,
    updatePago, 
    deletePago,
    marcarComoPagado
} from "../controllers/pago.controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = Router();

// Rutas para usuarios - Ver sus propios pagos
router.get("/mis-pagos", auth, getMyPagos);
router.get("/:id", auth, getPagoById);

// Admin puede crear, ver todos y gestionar pagos
router.post("/", auth, isAdmin, createPago);
router.get("/", auth, isAdmin, getAllPagos);
router.put("/:id", auth, isAdmin, updatePago);
router.patch("/:id/pagar", auth, isAdmin, marcarComoPagado); // Registrar que se pagó
router.delete("/:id", auth, isAdmin, deletePago);

export default router;