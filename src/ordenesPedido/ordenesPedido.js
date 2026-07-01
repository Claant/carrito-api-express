import { BSONType, ObjectId } from "mongodb";

export const OrdenesPedido = {
  _id: ObjectId,                 // Identificador único de la orden
  usuarioId: ObjectId,           // Referencia al Usuario que generó la orden
  fecha: BSONType.date,          // Fecha de creación de la orden
  estado: BSONType.string,       // 'pendiente' | 'pagado' | 'entregado'
  total: BSONType.double,        // Monto total de la orden
  items: BSONType.array,         // Array de objetos: [{ productoId, cantidad, precio }]
  pagoId: ObjectId               // Referencia al pago asociado (opcional)
};
