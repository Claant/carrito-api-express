import express from "express";
import controller from "./controller.js";

const carroRoutes = express.Router();

carroRoutes.post("/carro", controller.handleInsertCarroRequest);
carroRoutes.get("/carro", controller.handleGetCarrosRequest);

// 👇 más específico primero
carroRoutes.get("/carro/usuario/:usuarioId", controller.handleGetCarroByUsuarioIdRequest);

// 👇 genérico después
carroRoutes.get("/carro/:id", controller.handleGetCarroByIdRequest);

carroRoutes.put("/carro/:id", controller.handleUpdateCarroRequest);
carroRoutes.delete("/carro/producto/:productoId", controller.handleDeleteProductoDelCarroRequest);

carroRoutes.get("/productos", controller.handleGetProductosRequest);
carroRoutes.get("/productos/categoria/:categoria", controller.handleGetProductosPorCategoria);

carroRoutes.put("/carro/producto/:productoId/cantidad", controller.handleUpdateCantidadProductoRequest);

export default carroRoutes;


