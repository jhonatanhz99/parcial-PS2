const express = require("express");
const router = express.Router();
const { obtenerComisiones, crearComision, eliminarComision } = require("../controllers/comisiones.controller");

// Rutas para comisiones
router.get("/", obtenerComisiones);
router.post("/", crearComision);
router.delete("/:id", eliminarComision);

module.exports = router;
