import { BSONType, ObjectId } from "mongodb";

export const Pago = {
  _id: ObjectId,                 // Identificador único del pago
  ordenId: ObjectId,             // Referencia a la Orden asociada
  metodoPago: BSONType.string,   // Ej: 'tarjeta', 'transferencia', 'webpay'
  estadoPago: BSONType.string,   // 'pendiente' | 'aprobado' | 'rechazado'
  fechaPago: BSONType.date,      // Fecha en que se realizó el pago
  monto: BSONType.double         // Monto pagado

}
