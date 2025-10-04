const express = require("express");
const router = express.Router();
const { obtenerDetallesVentas, crearDetalleVenta, eliminarDetalleVenta } = require("../controllers/detalle_ventas.controller");

// Rutas para detalle_ventas
router.get("/", obtenerDetallesVentas);
router.post("/", crearDetalleVenta);
router.delete("/:id", eliminarDetalleVenta);

module.exports = router;
