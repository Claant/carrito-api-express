import express from "express";
import cors from "cors";
import client from "./src/common/db.js";
import usuariosRoutes from "./src/usuarios/routes.js";
import carroRoutes from "./src/carro/routes.js";
import productosRoutes from "./src/productos/routes.js";
import ordenesRouter from "./src/ordenesPedido/routes.js";
import routerPago from "./src/pago/routes.js";
import dotenv from "dotenv";
import authRoutes from "./src/auth/routes.js";
import reportesRouter from "./src/reportes/reportes.js";
import compression from 'compression'

dotenv.config();

const PORT = process.env.PORT || 4001;
const app = express();

const whiteList = [process.env.ORIGIN1, process.env.ORIGIN2, process.env.ORIGIN3, process.env.ORIGIN4];
app.use(cors({
  origin: function(origin, callback){
    if (origin) console.log("Petición desde:", origin);
    else console.log("Petición sin header Origin (ej: Postman o misma API)");
    if(!origin || whiteList.includes(origin)) return callback(null, true);
    return callback("Error de CORS origin: " + origin + " NO autorizado!");
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 app.use(compression())

app.get("/health", (req, res) => res.send("OK"));
app.get("/", (req, res) => res.status(200).send("Bienvenido al carrito de compras"));
app.get("/api/ping", (req, res) => res.json({ ok: true }));

async function start() {
  try {
    if (client && typeof client.connect === "function") {
      await client.connect();
      console.log("Mongo conectado");
    } else {
      console.log("client ya conectado o exportado como db");
    }

    // Registrar routers después de conectar

    // Activa compresión en todas las respuestas
   
    app.use("/api/reportes", reportesRouter);
    app.use("/api", authRoutes);
    app.use("/api", usuariosRoutes);
    app.use("/api", carroRoutes);
    app.use("/api", productosRoutes);
    app.use("/api", ordenesRouter);
    app.use("/api/pagos", routerPago);

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Error iniciando servidor:", err);
    process.exit(1);
  }
}

start();
