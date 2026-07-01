import { ObjectId } from "mongodb";
import client from "../common/db.js";
import bcrypt from "bcryptjs";
import { validarUsuario } from "../validaciones/usuarios.js";

/**
 * Constante global que accede a la base de datos y colección
 */
const usuarioCollection = client
  .db("carrito-compras-db")
  .collection("usuarios");

// metodo POST crear usuario
async function handleInsertUsuarioRequest(req, res) {
  try {
    const errores = validarUsuario(req.body);
    if (errores.length > 0) {
      return res.status(400).send({ errores });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);

       // Lógica de rol: solo "cliente" o "admin"
    let rolAsignado = "cliente"; // por defecto
    if (req.body.rol) {
      if (req.body.rol === "admin" || req.body.rol === "cliente") {
        rolAsignado = req.body.rol;
      } else {
        return res.status(400).send({ error: "Rol inválido. Debe ser 'cliente' o 'admin'." });
      }
    }



    const usuario = {
      _id: new ObjectId(),
      nombre: req.body.nombre,
      email: req.body.email,
      password: hash,
      rol: rolAsignado,
      fechaRegistro: new Date(),
    };

    const result = await usuarioCollection.insertOne(usuario);

    if (!result) {
      return res.status(400).send({ error: "Error al guardar registro" });
    }

    return res.status(201).send({
      mensaje: "Usuario creado correctamente",
      id: result.insertedId,
    });
  } catch (e) {
    console.error("Error al crear usuario:", e);
    return res.status(500).send({ error: e.message });
  }
}

// metodo GET listar todos los usuarios
async function handleGetUsuariosRequest(req, res) {
  try {
    const data = await usuarioCollection.find({}).toArray();
    return res.status(200).send(data);
  } catch (e) {
    return res.status(500).send({ error: e.message });
  }
}

// metodo GET obtener usuario por ID
async function handleGetUsuarioByIdRequest(req, res) {
  let id = req.params.id;
  try {
    let oid = ObjectId.createFromHexString(id);
    const data = await usuarioCollection.findOne({ _id: oid });
    if (!data) return res.status(404).send({ error: "Usuario no encontrado" });
    return res.status(200).send(data);
  } catch (e) {
    return res.status(400).send({ error: "Id mal formado" });
  }
}

// metodo PUT actualizar usuario por ID
async function handleUpdateUsuarioByIdRequest(req, res) {
  let id = req.params.id;
  try {
    let oid = ObjectId.createFromHexString(id);

    const errores = validarUsuario(req.body, true);
    if (errores.length > 0) {
      return res.status(400).send({ errores });
    }

    let usuarioUpdate = { ...req.body };

    if (req.body.password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      usuarioUpdate.password = await bcrypt.hash(req.body.password, salt);
    }

    const data = await usuarioCollection.updateOne(
      { _id: oid },
      { $set: usuarioUpdate }
    );

    if (data.matchedCount === 0) {
      return res.status(404).send({ error: "Usuario no encontrado" });
    }
    if (data.modifiedCount === 0) {
      return res.status(400).send({ error: "No se realizaron cambios" });
    }

    return res.status(200).send({ mensaje: "Usuario actualizado correctamente" });
  } catch (e) {
    return res.status(400).send({ error: "Id mal formado" });
  }
}

// metodo DELETE eliminar usuario por ID
async function handleDeleteUsuarioByIdRequest(req, res) {
  let id = req.params.id;
  try {
    let oid = ObjectId.createFromHexString(id);
    const result = await usuarioCollection.deleteOne({ _id: oid });

    if (result.deletedCount === 0) {
      return res.status(404).send({ error: "Usuario no encontrado" });
    }

    return res.status(200).send({ mensaje: "Usuario eliminado correctamente" });
  } catch (e) {
    return res.status(400).send({ error: "Id mal formado" });
  }
}

export default {
  handleInsertUsuarioRequest,
  handleGetUsuariosRequest,
  handleGetUsuarioByIdRequest,
  handleUpdateUsuarioByIdRequest,
  handleDeleteUsuarioByIdRequest,
};
