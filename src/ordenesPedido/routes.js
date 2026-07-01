import express from "express";
import controller from "./controller.js";

const router = express.Router();


router.post("/ordenesPedido", controller.handleInsertOrdenRequest);
router.get("/ordenesPedido", controller.handleGetOrdenesRequest);
router.get("/ordenesPedido/:id", controller.handleGetOrdenByIdRequest);
router.get("/ordenesPedido/usuarios/:usuarioId", controller.handleGetOrdenesByUsuarioRequest);
router.put("/ordenesPedido/:id", controller.handleUpdateOrdenRequest);
router.delete("/ordenesPedido/:id", controller.handleDeleteOrdenRequest);



export default router;