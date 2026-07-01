import { ObjectId } from "mongodb";
import client from "../common/db.js";

// Constantes globales de colecciones
const carroCollection = client.db("carrito-compras-db").collection("carro");
const usuarioCollection = client.db("carrito-compras-db").collection("usuarios");
const productoCollection = client.db("carrito-compras-db").collection("productos");
const ordenesCollection = client.db("carrito-compras-db").collection("ordenesPedido");


/**
 * POST → Crear una nueva orden
 */
async function handleInsertOrdenRequest(req, res) {
  try {
    const data = req.body;

    // Validar IDs antes de convertir
    if (!data.usuarioId || !ObjectId.isValid(data.usuarioId)) {
      return res.status(400).send("usuarioId inválido");
    }
    if (!data.carroId || !ObjectId.isValid(data.carroId)) {
      return res.status(400).send("carroId inválido");
    }

    // Validar usuario
    const usuario = await usuarioCollection.findOne({ _id: new ObjectId(data.usuarioId) });
    if (!usuario) return res.status(404).send("Usuario no encontrado");

    // Validar carro
    const carro = await carroCollection.findOne({ _id: new ObjectId(data.carroId) });
    if (!carro) return res.status(404).send("Carro no encontrado");

    // Validar que el carro pertenece al usuario
    if (!carro.usuarioId) {
      return res.status(400).send("El carro no tiene usuario asignado");
    }
    if (carro.usuarioId.toString() !== new ObjectId(data.usuarioId).toString()) {
      return res.status(400).send("El carro no pertenece al usuario indicado");
    }


    // Crear orden con datos del carro
    const orden = {
      usuarioId: new ObjectId(data.usuarioId),
      carroId: new ObjectId(data.carroId),
      fechaCreacion: new Date(),
      estado: "pendiente",
      items: carro.items,
      total: carro.total,
      pagoId: null
    };

    const result = await ordenesCollection.insertOne(orden);
    return res.status(201).send({ ...orden, _id: result.insertedId });
  } catch (e) {
    console.error("Error al crear orden:", e);
    return res.status(500).send({ error: e.message });
  }
}


/**
 * GET → Obtener todas las órdenes
 */
async function handleGetOrdenesRequest(req, res) {
  try {
    const ordenes = await ordenesCollection.find().toArray();
    return res.status(200).send(ordenes);
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
}

/**
 * GET → Obtener orden por ID
 */
async function handleGetOrdenByIdRequest(req, res) {
  try {
    const ordenId = req.params.id;
    const orden = await ordenesCollection.findOne({ _id: new ObjectId(ordenId) });
    if (!orden) return res.status(404).send("Orden no encontrada");
    return res.status(200).send(orden);
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
}

/**
 * GET → Obtener órdenes por usuario
 */
async function handleGetOrdenesByUsuarioRequest(req, res) {
  try {
    const usuarioId = new ObjectId(req.params.usuarioId);

    const ordenes = await ordenesCollection
      .find({ usuarioId })
      .sort({ fechaCreacion: -1 }) //  ordena de más reciente a más antigua
      .toArray();

    return res.status(200).send({
      cantidadCompras: ordenes.length,
      ordenes
    });
  } catch (e) {
    console.error("Error al obtener órdenes por usuario:", e);
    return res.status(500).send({ error: e.message });
  }
}


/**
 * PUT → Actualizar estado de la orden
 * Solo en caso de realizar mantencion manual en casos administrativos pero no de flujo normal
 */
async function handleUpdateOrdenRequest(req, res) {
  try {
    const ordenId = req.params.id;
    const { estado } = req.body;

    const result = await ordenesCollection.updateOne(
      { _id: new ObjectId(ordenId) },
      { $set: { estado } }
    );

    if (result.matchedCount === 0) return res.status(404).send("Orden no encontrada");

    const ordenActualizada = await ordenesCollection.findOne({ _id: new ObjectId(ordenId) });
    return res.status(200).send(ordenActualizada);
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
}

/**
 * DELETE → Eliminar orden por ID
 */
async function handleDeleteOrdenRequest(req, res) {
  try {
    const ordenId = req.params.id;
    const result = await ordenesCollection.deleteOne({ _id: new ObjectId(ordenId) });
    if (result.deletedCount === 0) return res.status(404).send("Orden no encontrada");
    return res.status(200).send({ mensaje: "Orden eliminada correctamente" });
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
}

// Exportar todos los métodos
export default {
  handleInsertOrdenRequest,
  handleGetOrdenesRequest,
  handleGetOrdenByIdRequest,
  handleGetOrdenesByUsuarioRequest,
  handleUpdateOrdenRequest,
  handleDeleteOrdenRequest
};