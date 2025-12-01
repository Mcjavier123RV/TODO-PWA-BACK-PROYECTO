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

connectToDB().catch(err => console.error("Error Mongo:", err));

const allowedOrigins = [
  "http://localhost:5173",
  "https://todo-pwa-front-proyecto.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => res.json({ ok: true, name: "condominios-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/anuncios", anuncioRoutes);
app.use("/api/reservaciones", reservacionRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/visitantes", visitanteRoutes);
app.use("/api/mensajes", mensajeRoutes);

export default app;
