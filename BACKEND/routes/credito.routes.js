const express = require("express");
const router = express.Router();
const { obtenerCreditos, crearCredito, eliminarCredito } = require("../controllers/credito.controller");

// Rutas para créditos
router.get("/", obtenerCreditos);
router.post("/", crearCredito);
router.delete("/:id", eliminarCredito);

module.exports = router;
