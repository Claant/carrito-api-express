import client from "../common/db.js";
import bcrypt from "bcryptjs";

const usuarioCollection = client
  .db("carrito-compras-db")
  .collection("usuarios");

export async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    // Buscar usuario por email
    const user = await usuarioCollection.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Comparar contraseña ingresada con el hash guardado
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Las credenciales no son válidas" });
    }

    // Responder con el usuario (sin contraseña) y mensaje de éxito
    const { password: _, ...userData } = user;

   res.status(200).json({
  message: "Usuario logeado correctamente",
  user: {
    _id: user._id.toString(),   // ahora sí se guarda bien en localStorage
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    fechaRegistro: user.fechaRegistro
  }
});

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
}
