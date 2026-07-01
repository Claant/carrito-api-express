import { ObjectId } from "mongodb";
import client from "../common/db.js"; // tu conexión global a la BD
import { Carro } from "./carro.js";
import { Usuarios } from "../usuarios/usuarios.js";

// Constantes globales de colecciones
const carroCollection = client.db("carrito-compras-db").collection("carro");
const usuarioCollection = client.db("carrito-compras-db").collection("usuarios");
const productoCollection = client.db("carrito-compras-db").collection("productos");

/**
 * POST → Crear un nuevo carro con cálculo automático
 */
async function handleInsertCarroRequest(req, res) {
  try {
    const data = req.body;
    const usuarioId = new ObjectId(data.usuarioId);

    const usuario = await usuarioCollection.findOne({ _id: usuarioId });
    if (!usuario) return res.status(404).send("Usuario no encontrado");

    if (!data.items || data.items.length === 0) {
      return res.status(400).send("El carrito debe contener al menos un producto");
    }

    // Buscar carrito activo del usuario
    let carro = await carroCollection.findOne({ usuarioId, estado: "activo" });
    if (!carro) {
      carro = {
        usuarioId,
        estado: "activo",
        items: [],
        total: 0
      };
    }

    // Procesar cada producto enviado
    for (const item of data.items) {
      const producto = await productoCollection.findOne({ _id: new ObjectId(item.productoId) });
      if (!producto) throw new Error("Producto no encontrado");

      const itemIndex = carro.items.findIndex(i => i.productoId.toString() === item.productoId);

      if (itemIndex !== -1) {
        // Ya existe → incrementar cantidad
        carro.items[itemIndex].cantidad += item.cantidad;
        carro.items[itemIndex].subtotal = carro.items[itemIndex].cantidad * carro.items[itemIndex].precio;
      } else {
        // No existe → agregar nuevo ítem
        carro.items.push({
          productoId: item.productoId,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: item.cantidad,
          subtotal: producto.precio * item.cantidad
        });
      }
    }

    // Recalcular total
    carro.total = carro.items.reduce((acc, i) => acc + i.subtotal, 0);

    // Guardar cambios
    await carroCollection.updateOne(
      { usuarioId, estado: "activo" },
      { $set: { items: carro.items, total: carro.total } },
      { upsert: true }
    );

    return res.status(201).send({
      mensaje: "Producto(s) agregado(s) al carrito",
      carro
    });
  } catch (e) {
    console.error("Error en handleInsertCarroRequest:", e);
    return res.status(500).send({ error: e.message });
  }
}


/**
 * GET → Obtener carros (todos o filtrados por usuarioId)
 */
async function handleGetCarrosRequest(req, res) {
  try {
    const usuarioId = req.query.usuarioId;
    let filtro = {};
    if (usuarioId) {
      filtro = { usuarioId: new ObjectId(usuarioId) };
    }

    const carros = await carroCollection.find(filtro).toArray();

    // Populate manual
    for (const carro of carros) {
      for (const item of carro.items) {
        const producto = await productoCollection.findOne({ _id: new ObjectId(item.productoId) });
        if (producto) {
          item.nombre = producto.nombre;
          item.precio = producto.precio;
          item.subtotal = item.cantidad * producto.precio;
        }
      }
    }

    return res.status(200).send(carros);
  } catch (e) {
    console.error("Error en handleGetCarrosRequest:", e);
    return res.status(500).send({ error: e.message });
  }
}

/**
 * GET → Obtener carro por ID
 */
async function handleGetCarroByIdRequest(req, res) {
  try {
    const carroId = req.params.id;
    const carro = await carroCollection.findOne({ _id: new ObjectId(carroId) });
    if (!carro) {
      return res.status(404).send("Carro no encontrado");
    }
    return res.status(200).send(carro);
  } catch (e) {
    console.error("Error en handleGetCarroByIdRequest:", e);
    return res.status(500).send({ error: e.message });
  }
}

/**
 * PUT → Actualizar carro por ID
 */
async function handleUpdateCarroRequest(req, res) {
  try {
    const carroId = req.params.id;
    const data = req.body;

    if (!data.items || data.items.length === 0) {
      return res.status(400).send("Debe enviar items para actualizar el carrito");
    }

    // Consolidar items por productoId para evitar duplicados
    const itemsMap = new Map();
    for (const item of data.items) {
      const producto = await productoCollection.findOne({ _id: new ObjectId(item.productoId) });
      if (!producto) throw new Error("Producto no encontrado");

      if (itemsMap.has(item.productoId)) {
        const existente = itemsMap.get(item.productoId);
        existente.cantidad += item.cantidad;
        existente.subtotal = existente.cantidad * existente.precio;
        itemsMap.set(item.productoId, existente);
      } else {
        itemsMap.set(item.productoId, {
          productoId: item.productoId,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: item.cantidad,
          subtotal: producto.precio * item.cantidad
        });
      }
    }

    const itemsConsolidados = Array.from(itemsMap.values());
    const total = itemsConsolidados.reduce((acc, i) => acc + i.subtotal, 0);

    const update = {
      $set: {
        estado: data.estado || "activo",
        items: itemsConsolidados,
        total
      }
    };

    const result = await carroCollection.updateOne({ _id: new ObjectId(carroId) }, update);
    if (result.matchedCount === 0) {
      return res.status(404).send("Carro no encontrado");
    }

    const carroActualizado = await carroCollection.findOne({ _id: new ObjectId(carroId) });
    return res.status(200).send(carroActualizado);
  } catch (e) {
    console.error("Error en handleUpdateCarroRequest:", e);
    return res.status(500).send({ error: e.message });
  }
}


/**
 * DELETE → Eliminar carro por ID
 */



async function handleDeleteProductoDelCarroRequest(req, res) {
  try {
    const { productoId } = req.params;
    const { usuarioId } = req.body;

    const carro = await carroCollection.findOne({ usuarioId: new ObjectId(usuarioId) });
    if (!carro) {
      return res.status(404).send({ error: "Carrito no encontrado para este usuario" });
    }

    // Buscar el ítem
    const itemIndex = carro.items.findIndex(i => i.productoId.toString() === productoId);
    if (itemIndex === -1) {
      return res.status(404).send({ error: "Producto no encontrado en el carrito" });
    }

    const item = carro.items[itemIndex];

    // Reducir cantidad o eliminar ítem
    if (item.cantidad > 1) {
      item.cantidad -= 1;
      item.subtotal = item.cantidad * item.precio;
      carro.items[itemIndex] = item;
    } else {
      carro.items.splice(itemIndex, 1);
    }

    // Recalcular total
    carro.total = carro.items.reduce((acc, i) => acc + i.subtotal, 0);

    await carroCollection.updateOne(
      { _id: carro._id },
      { $set: { items: carro.items, total: carro.total } }
    );

    return res.status(200).send({
      mensaje: "Producto eliminado correctamente",
      total: carro.total,
      items: carro.items
    });
  } catch (e) {
    console.error("Error en handleDeleteProductoDelCarroRequest:", e);
    return res.status(500).send({ error: e.message });
  }
}





// GET → Todos los productos
async function handleGetProductosRequest(req, res) {
  try {
    const productos = await productoCollection.find().toArray();
    return res.status(200).send(productos);
  } catch (e) {
    console.error("Error en handleGetProductosRequest:", e);
    return res.status(500).send({ error: e.message });
  }
}





// GET → Productos por categoría
async function handleGetProductosPorCategoria(req, res) {
  try {
    const categoria = req.params.categoria; // usar el mismo nombre que en la ruta
    const productos = await productoCollection.find({ categoria }).toArray();

    if (productos.length === 0) {
      return res.status(200).send([]); // mejor devolver vacío en vez de todos
    }

    return res.status(200).send(productos);
  } catch (e) {
    console.error("Error en handleGetProductosPorCategoria:", e);
    return res.status(500).send({ error: e.message });
  }
}




async function handleGetCarroByUsuarioIdRequest(req, res) {
  try {
    const usuarioId = req.params.usuarioId;

    if (!ObjectId.isValid(usuarioId)) {
      return res.status(400).send({ error: "usuarioId inválido" });
    }

    const carro = await carroCollection.findOne({ usuarioId: new ObjectId(usuarioId) });

    if (!carro) {
      return res.status(404).send({ error: "Carro no encontrado" });
    }

    // Populate manual de los items
    for (const item of carro.items) {
      const producto = await productoCollection.findOne({ _id: new ObjectId(item.productoId) });
      if (producto) {
        item.nombre = producto.nombre;
        item.precio = producto.precio;
        item.subtotal = item.cantidad * producto.precio;
      }
    }

    // Devolver el objeto completo con _id
    return res.status(200).send(carro);
  } catch (e) {
    console.error("Error en handleGetCarroByUsuarioIdRequest:", e);
    return res.status(500).send({ error: e.message });
  }
}




async function handleUpdateCantidadProductoRequest(req, res) {
  try {
    const { productoId } = req.params;          // viene de la URL
    const { usuarioId, cantidad } = req.body;   // viene del body

    if (cantidad < 0) {
      return res.status(400).send({ error: "La cantidad no puede ser negativa" });
    }

    const carro = await carroCollection.findOne({ usuarioId: new ObjectId(usuarioId) });
    if (!carro) {
      return res.status(404).send({ error: "Carrito no encontrado para este usuario" });
    }

    const itemIndex = carro.items.findIndex(i => i.productoId.toString() === productoId);
    if (itemIndex === -1) {
      return res.status(404).send({ error: "Producto no encontrado en el carrito" });
    }

    if (cantidad === 0) {
      carro.items.splice(itemIndex, 1);
    } else {
      carro.items[itemIndex].cantidad = cantidad;
      carro.items[itemIndex].subtotal = cantidad * carro.items[itemIndex].precio;
    }

    carro.total = carro.items.reduce((acc, i) => acc + i.subtotal, 0);

    await carroCollection.updateOne(
      { _id: carro._id },
      { $set: { items: carro.items, total: carro.total } }
    );

    return res.status(200).send({
      mensaje: "Cantidad actualizada correctamente",
      total: carro.total,
      items: carro.items
    });
  } catch (e) {
    console.error("Error en handleUpdateCantidadProductoRequest:", e);
    return res.status(500).send({ error: e.message });
  }
}






export default {
  handleInsertCarroRequest,
  handleGetCarrosRequest,
  handleGetCarroByIdRequest,
  handleUpdateCarroRequest,
  handleDeleteProductoDelCarroRequest,
  handleGetProductosRequest,
  handleGetProductosPorCategoria, 
  handleGetCarroByUsuarioIdRequest,
  handleUpdateCantidadProductoRequest
};
