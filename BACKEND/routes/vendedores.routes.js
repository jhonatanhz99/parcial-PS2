

const express = require("express");
const router = express.Router();
const { obtenerVendedores, agregarVendedor, eliminarVendedor, actualizarVendedor } = require("../controllers/Vendedores.controller");

router.get("/", obtenerVendedores);
router.post("/", agregarVendedor);
router.delete("/:id", eliminarVendedor);
router.put("/:id", actualizarVendedor);

module.exports = router;
