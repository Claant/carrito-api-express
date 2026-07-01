import { ObjectId } from "mongodb";
import client from "../common/db.js";

// Constantes globales de colecciones
const pagoCollection = client.db("carrito-compras-db").collection("pago");
const usuarioCollection = client.db("carrito-compras-db").collection("usuarios");
const ordenCollection = client.db("carrito-compras-db").collection("ordenesPedido");
const carroCollection = client.db("carrito-compras-db").collection("carro"); // 👈 faltaba

/**
 * POST → Crear un nuevo pago y actualizar la orden
 */
export async function handleInsertPagoRequest(req, res) {
  try {
    const { ordenId, metodoPago, estadoPago } = req.body;

    // Validar que la orden exista
    const orden = await ordenCollection.findOne({ _id: new ObjectId(ordenId) });
    if (!orden) {
      return res.status(404).send("Orden no encontrada");
    }

    // Validar que la orden esté pendiente
    if (orden.estado !== "pendiente") {
      console.warn("Intento de pago sobre orden no pendiente:", orden);
      return res.status(400).send("La orden ya fue pagada o está cerrada");
    }

    // Crear pago usando el total de la orden
    const pago = {
      ordenId: new ObjectId(ordenId),
      metodoPago,
      estadoPago: estadoPago || "aprobado",
      fechaPago: new Date(),
      monto: orden.total
    };

    const result = await pagoCollection.insertOne(pago);

    // Actualizar la orden según el estado del pago
    const nuevoEstado = pago.estadoPago === "aprobado" ? "pagado" : "pendiente";

    await ordenCollection.updateOne(
      { _id: new ObjectId(ordenId) },
      { $set: { pagoId: result.insertedId, estado: nuevoEstado } }
    );

    // Vaciar el carrito si el pago fue aprobado
    if (pago.estadoPago === "aprobado") {
      await carroCollection.updateOne(
        { _id: orden.carroId },
        { $set: { items: [], total: 0 } }
      );
    }

    return res.status(201).send({
      mensaje: "Pago registrado correctamente",
      pagoId: result.insertedId,
      estadoOrden: nuevoEstado,
      estadoPago: pago.estadoPago,
      monto: pago.monto
    });
  } catch (e) {
    console.error("Error al registrar pago:", e);
    return res.status(500).send({ error: e.message });
  }
}

/**
 * GET → Obtener todos los pagos
 */
async function handleGetPagosRequest(req, res) {
  try {
    const pagos = await pagoCollection.find().toArray();
    return res.status(200).send(pagos);
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
}

/**
 * GET → Obtener pago por ID
 */
async function handleGetPagoByIdRequest(req, res) {
  try {
    const pagoId = req.params.id;
    const pago = await pagoCollection.findOne({ _id: new ObjectId(pagoId) });
    if (!pago) {
      return res.status(404).send("Pago no encontrado");
    }
    return res.status(200).send(pago);
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
}

/**
 * DELETE → Eliminar pago por ID
 */
async function handleDeletePagoRequest(req, res) {
  try {
    const pagoId = req.params.id;

    // Buscar el pago antes de eliminarlo
    const pago = await pagoCollection.findOne({ _id: new ObjectId(pagoId) });
    if (!pago) {
      return res.status(404).send("Pago no encontrado");
    }

    // Eliminar el pago
    const result = await pagoCollection.deleteOne({ _id: new ObjectId(pagoId) });
    if (result.deletedCount === 0) {
      return res.status(404).send("Pago no encontrado");
    }

    // Revertir la orden asociada a pendiente y limpiar pagoId
    await ordenCollection.updateOne(
      { _id: pago.ordenId },
      { $set: { pagoId: null, estado: "pendiente" } }
    );

    return res.status(200).send({ mensaje: "Pago eliminado y orden revertida a pendiente" });
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
}

// Exportar todos los métodos
export default {
  handleInsertPagoRequest,
  handleGetPagosRequest,
  handleGetPagoByIdRequest,
  handleDeletePagoRequest
};
