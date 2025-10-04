const express = require("express");
const router = express.Router();
const { obtenerPagos, registrarPago, eliminarPago } = require("../controllers/pagos.controller");

// Rutas para pagos
router.get("/", obtenerPagos);
router.post("/", registrarPago);
router.delete("/:id", eliminarPago);

module.exports = router;
