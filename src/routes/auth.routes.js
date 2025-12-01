import { Router } from "express";
import { register, login, profile, getAllUsers, updateUser, deleteUser } from "../controllers/auth.controller.js";
import { auth, isAdmin } from "../middleware/auth.js";



const router = Router();

// Rutas públicas
router.post("/login", login);


// Rutas protegidas (requieren autenticación)
router.get("/profile", auth, profile);

// Rutas solo para admin
router.post("/register", auth, isAdmin, register); // Solo admin puede crear usuarios
router.get("/users", auth, isAdmin, getAllUsers); // Solo admin puede ver todos los usuarios
router.put("/users/:id", auth, updateUser); // Admin o el mismo usuario
router.delete("/users/:id", auth, isAdmin, deleteUser); // Solo admin puede desactivar

export default router;