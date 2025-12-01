// src/app.js
import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import anuncioRoutes from "./routes/anuncio.routes.js";
import reservacionRoutes from "./routes/reservacion.routes.js";
import pagoRoutes from "./routes/pago.routes.js";
import visitanteRoutes from "./routes/visitante.routes.js";
import mensajeRoutes from "./routes/mensaje.routes.js";
import { connectToDB } from "./db/connect.js";

const app = express();

// 👉 Conectar solo una vez al iniciar
connectToDB()
  .then(() => console.log("MongoDB conectado"))
  .catch(err => console.error("Error al conectar MongoDB", err));

// 👉 CORS correcto (solo una vez)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://todo-pwa-front-proyecto.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(express.json());
app.use(morgan("dev"));

// Rutas
app.get("/", (_req, res) => res.json({ ok: true, name: "condominios-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/anuncios", anuncioRoutes);
app.use("/api/reservaciones", reservacionRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/visitantes", visitanteRoutes);
app.use("/api/mensajes", mensajeRoutes);

export default app;
