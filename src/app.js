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

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONT_ORIGIN || ""
    ].filter(Boolean),
    credentials: true
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Conexión a Mongo cacheada por request (seguro en serverless)
app.use(async (_req, _res, next) => {
  try { await connectToDB(); next(); } catch (e) { next(e); }
});

app.get("/", (_req, res) => res.json({ ok: true, name: "condominios-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/anuncios", anuncioRoutes);
app.use("/api/reservaciones", reservacionRoutes);
app.use("/api/pagos", pagoRoutes);
app.use("/api/visitantes", visitanteRoutes);
app.use("/api/mensajes", mensajeRoutes);

export default app;