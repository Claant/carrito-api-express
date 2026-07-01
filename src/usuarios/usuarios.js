import { BSONType, ObjectId } from "mongodb";

export const Usuarios = {
  _id: ObjectId,                // Identificador único
  nombre: BSONType.string,      // Nombre del usuario
  email: BSONType.string,       // Correo electrónico
  password: BSONType.string,    // Contraseña encriptada
  rol: BSONType.string,         // 'cliente' | 'admin'
  fechaRegistro: BSONType.date  // Fecha de creación del usuario
};
