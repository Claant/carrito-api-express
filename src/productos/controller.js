import { ObjectId } from "mongodb";
import client from "../common/db.js"; // tu conexión global a la BD
import {Productos} from "./productos.js";

// Constante global de colección
const productoCollection = client.db("carrito-compras-db").collection("productos");

/**
 * POST → Crear un nuevo producto
 */
async function handleInsertProductoRequest(req, res) {
  try {
    const data = req.body;

    const producto = {
      nombre: String(data.nombre),
      descripcion: String(data.descripcion || ""),
      precio: Number(data.precio),   // fuerza a double
      stock: parseInt(data.stock),   // fuerza a int
      categoria: String(data.categoria || ""),
      imagen: String(data.imagen || "")
    };

    const result = await productoCollection.insertOne(producto);
    return res.status(201).send({ ...producto, _id: result.insertedId });
  } catch (e) {
    console.error("Error al crear producto:", e);
    return res.status(500).send({ error: e.message });
  }
}


/**
 * GET → Obtener todos los productos
 */
async function handleGetProductosRequest(req, res) {
  await productoCollection
    .find({})
    .toArray()
    .then((data) => res.status(200).send(data))
    .catch((e) => res.status(500).send({ error: e }));
}

/**
 * GET → Obtener producto por ID
 */
async function handleGetProductoByIdRequest(req, res) {
  let id = req.params.id;
  try {
    let oid = ObjectId.createFromHexString(id);
    await productoCollection
      .findOne({ _id: oid })
      .then((data) => {
        if (!data) return res.status(404).send("Producto no encontrado");
        return res.status(200).send(data);
      })
      .catch((e) => res.status(500).send({ error: e.code }));
  } catch (e) {
    return res.status(400).send("Id mal formado");
  }
}

/**
 * PUT → Actualizar producto por ID
 */
async function handleUpdateProductoByIdRequest(req, res) {
  let id = req.params.id;
  try {
    let oid = ObjectId.createFromHexString(id);
    let productos = req.body;

    await productoCollection
      .updateOne({ _id: oid }, { $set: productos })
      .then((data) => {
        if (data.matchedCount === 0) return res.status(404).send("Producto no encontrado");
        return res.status(200).send(data);
      })
      .catch((e) => res.status(500).send({ error: e.code }));
  } catch (e) {
    return res.status(400).send("Id mal formado");
  }
}

/**
 * DELETE → Eliminar producto por ID
 */
async function handleDeleteProductoByIdRequest(req, res) {
  let id = req.params.id;
  try {
    let oid = ObjectId.createFromHexString(id);
    await productoCollection
      .deleteOne({ _id: oid })
      .then((data) => {
        if (data.deletedCount === 0) return res.status(404).send("Producto no encontrado");
        return res.status(200).send("Producto eliminado correctamente");
      })
      .catch((e) => res.status(500).send({ error: e.code }));
  } catch (e) {
    return res.status(400).send("Id mal formado");
  }
}

/**
 * GET → Obtener productos por categoría
 */
async function handleGetProductosByCategoriaRequest(req, res) {
  try {
    const categoria = req.params.nombre.trim(); // Eliminar espacios en blanco
    const productos = await productoCollection
      .find({ categoria: new RegExp(`^${categoria}$`, "i") }) // insensible a mayúsculas
      .toArray();

    if (!productos || productos.length === 0) {
      return res.status(404).send("No hay productos en esta categoría");
    }

    return res.status(200).send(productos);
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
}

/**
 * GET → Buscar productos por nombre (regex para coincidencias parciales)
 */
async function buscarProductos(req, res) {
  try {
    const termino = req.query.q?.trim();
    if (!termino) {
      return res.status(400).send("Debe proporcionar un término de búsqueda");
    }

    const productos = await productoCollection
      .find({ nombre: { $regex: termino, $options: "i" } })
      .toArray();

    if (!productos || productos.length === 0) {
      return res.status(404).send("No se encontraron productos");
    }

    return res.status(200).send(productos);
  } catch (error) {
    return res.status(500).send({ error: "Error al buscar productos" });
  }
}






// Exportar todos los métodos
export default {
  handleInsertProductoRequest,
  handleGetProductosRequest,
  handleGetProductoByIdRequest,
  handleUpdateProductoByIdRequest,
  handleDeleteProductoByIdRequest,
  handleGetProductosByCategoriaRequest,
  buscarProductos
};
