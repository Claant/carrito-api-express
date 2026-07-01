import express from "express";
import client from "../common/db.js";

const router = express.Router();

// 🔹 Ventas diarias
router.get("/ventas-diarias", async (req, res) => {
  try {
    const db = client.db("carrito-compras-db");
    const ordenesCollection = db.collection("ordenesPedido");

    const reporte = await ordenesCollection.aggregate([
      {
        $addFields: {
          fechaCreacionDate: {
            $cond: [
              { $eq: [{ $type: "$fechaCreacion" }, "string"] },
              { $dateFromString: { dateString: "$fechaCreacion", onError: null } },
              "$fechaCreacion"
            ]
          }
        }
      },
      { $match: { fechaCreacionDate: { $ne: null } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            fecha: {
              $dateToString: { format: "%Y-%m-%d", date: "$fechaCreacionDate" }
            }
          },
          totalVentas: { $sum: "$items.subtotal" }
        }
      },
      { $sort: { "_id.fecha": 1 } }
    ]).toArray();

    res.json(reporte);
  } catch (err) {
    console.error("Error en /ventas-diarias:", err);
    res.status(500).json({ error: "Error generando reporte", details: err.message });
  }
});

// 🔹 Ventas semanales
router.get("/ventas-semanales", async (req, res) => {
  try {
    const db = client.db("carrito-compras-db");
    const ordenesCollection = db.collection("ordenesPedido");

    const reporte = await ordenesCollection.aggregate([
      {
        $addFields: {
          fechaCreacionDate: {
            $cond: [
              { $eq: [{ $type: "$fechaCreacion" }, "string"] },
              { $dateFromString: { dateString: "$fechaCreacion", onError: null } },
              "$fechaCreacion"
            ]
          }
        }
      },
      { $match: { fechaCreacionDate: { $ne: null } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            semana: { $week: "$fechaCreacionDate" },
            year: { $year: "$fechaCreacionDate" }
          },
          totalVentas: { $sum: "$items.subtotal" }
        }
      },
      { $sort: { "_id.year": 1, "_id.semana": 1 } }
    ]).toArray();

    res.json(reporte);
  } catch (err) {
    console.error("Error en /ventas-semanales:", err);
    res.status(500).json({ error: "Error generando reporte", details: err.message });
  }
});

// 🔹 Ventas mensuales
router.get("/ventas-mensuales", async (req, res) => {
  try {
    const db = client.db("carrito-compras-db");
    const ordenesCollection = db.collection("ordenesPedido");

    const reporte = await ordenesCollection.aggregate([
      {
        $addFields: {
          fechaCreacionDate: {
            $cond: [
              { $eq: [{ $type: "$fechaCreacion" }, "string"] },
              { $dateFromString: { dateString: "$fechaCreacion", onError: null } },
              "$fechaCreacion"
            ]
          }
        }
      },
      { $match: { fechaCreacionDate: { $ne: null } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            mes: { $month: "$fechaCreacionDate" },
            year: { $year: "$fechaCreacionDate" }
          },
          totalVentas: { $sum: "$items.subtotal" }
        }
      },
      { $sort: { "_id.year": 1, "_id.mes": 1 } }
    ]).toArray();

    res.json(reporte);
  } catch (err) {
    console.error("Error en /ventas-mensuales:", err);
    res.status(500).json({ error: "Error generando reporte", details: err.message });
  }
});

// 🔹 Ventas anuales
router.get("/ventas-anuales", async (req, res) => {
  try {
    const db = client.db("carrito-compras-db");
    const ordenesCollection = db.collection("ordenesPedido");

    const reporte = await ordenesCollection.aggregate([
      {
        $addFields: {
          fechaCreacionDate: {
            $cond: [
              { $eq: [{ $type: "$fechaCreacion" }, "string"] },
              { $dateFromString: { dateString: "$fechaCreacion", onError: null } },
              "$fechaCreacion"
            ]
          }
        }
      },
      { $match: { fechaCreacionDate: { $ne: null } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: { year: { $year: "$fechaCreacionDate" } },
          totalVentas: { $sum: "$items.subtotal" }
        }
      },
      { $sort: { "_id.year": 1 } }
    ]).toArray();

    res.json(reporte);
  } catch (err) {
    console.error("Error en /ventas-anuales:", err);
    res.status(500).json({ error: "Error generando reporte", details: err.message });
  }
});

// 🔹 Ventas por producto
router.get("/ventas-productos", async (req, res) => {
  try {
    const db = client.db("carrito-compras-db");
    const ordenesCollection = db.collection("ordenesPedido");

    const reporte = await ordenesCollection.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: { nombre: "$items.nombre" },
          totalVentas: { $sum: "$items.subtotal" }
        }
      },
      { $sort: { totalVentas: -1 } }
    ]).toArray();

    res.json(reporte);
  } catch (err) {
    console.error("Error en /ventas-productos:", err);
    res.status(500).json({ error: "Error generando reporte", details: err.message });
  }
});

export default router;
