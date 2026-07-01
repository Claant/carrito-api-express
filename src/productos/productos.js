import { BSONType, ObjectId } from "mongodb";

export const Productos = {
  _id: ObjectId,               // Identificador único del producto
  nombre: BSONType.string,     // Nombre del producto
  descripcion: BSONType.string,// Descripción detallada
  precio: BSONType.double,     // Precio unitario
  stock: BSONType.int,         // Cantidad disponible
  categoria: BSONType.string,  // Categoría (ej: electrónica, ropa, etc.)
  imagen: BSONType.string      // URL o ruta de la imagen
};
