import { Router } from "express";
import { 
    createAnuncio, 
    getAllAnuncios, 
    getAnuncioById, 
    updateAnuncio, 
    deleteAnuncio 
} from "../controllers/anuncio.controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = Router();

// Rutas protegidas - Todos los usuarios autenticados pueden ver
router.get("/", auth, getAllAnuncios);
router.get("/:id", auth, getAnuncioById);

// Solo admin puede crear, actualizar y eliminar
router.post("/", auth, isAdmin, createAnuncio);
router.put("/:id", auth, isAdmin, updateAnuncio);
router.delete("/:id", auth, isAdmin, deleteAnuncio);

export default router;