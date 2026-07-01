import express from "express";
import productosController from "./controller.js";

const productosRoutes = express.Router();

// Buscar productos
productosRoutes.get("/productos/buscar", productosController.buscarProductos);
productosRoutes.post("/productos", productosController.handleInsertProductoRequest);
productosRoutes.get("/productos", productosController.handleGetProductosRequest);
productosRoutes.get("/productos/:id", productosController.handleGetProductoByIdRequest);
productosRoutes.put("/productos/:id", productosController.handleUpdateProductoByIdRequest);
productosRoutes.delete("/productos/:id", productosController.handleDeleteProductoByIdRequest);

// Nueva ruta: productos por categoría
productosRoutes.get(
  "/productos/categoria/:nombre",
  productosController.handleGetProductosByCategoriaRequest
);


export default productosRoutes;
