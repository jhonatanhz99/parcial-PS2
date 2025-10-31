const express = require("express");
const router = express.Router();
const ventasController = require("../controllers/ventas.controller");

router.get("/", ventasController.obtenerVentas);
router.post("/", ventasController.registrarVenta);
router.get("/:id", ventasController.obtenerVentaPorId);

module.exports = router;
