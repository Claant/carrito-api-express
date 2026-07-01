import express from "express";
import controller from "./controller.js";

const routerPago = express.Router();

routerPago.post("/", controller.handleInsertPagoRequest);   // Crear un nuevo pago
routerPago.get("/", controller.handleGetPagosRequest);      // Obtener todos los pagos
routerPago.get("/:id", controller.handleGetPagoByIdRequest);// Obtener pago por ID
routerPago.delete("/:id", controller.handleDeletePagoRequest);// Eliminar pago por ID

export default routerPago;
