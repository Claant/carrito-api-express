import { BSONType, ObjectId } from "mongodb";


export const Carro = {
  _id: ObjectId,                 // Identificador único del carrito
  usuarioId: ObjectId,           // Referencia al Usuario dueño del carrito
  fechaCreacion: BSONType.date,  // Fecha en que se creó el carrito
  estado: BSONType.string,       // 'activo' | 'finalizado'
  items: BSONType.array,         // Array de objetos: [{ productoId, cantidad, subtotal }]
  total: BSONType.number         // Suma de todos los subtotales
};
