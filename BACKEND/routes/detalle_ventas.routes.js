const express = require("express");
const router = express.Router();
const { obtenerDetallesVentas, crearDetalleVenta, eliminarDetalleVenta, verificarVentasPorProducto } = require("../controllers/detalle_ventas.controller");

// Rutas para detalle_ventas
router.get("/", obtenerDetallesVentas);
// Consultar cantidad de detalles para un producto
router.get("/producto/:id", verificarVentasPorProducto);
router.post("/", crearDetalleVenta);
router.delete("/:id", eliminarDetalleVenta);

module.exports = router;
