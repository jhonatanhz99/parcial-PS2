const express = require("express");
const router = express.Router();
const { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor } = require("../controllers/proveedores.controller");

// Rutas CRUD para proveedores
router.get("/", obtenerProveedores);
router.post("/", crearProveedor);
router.put("/:id", actualizarProveedor);
router.delete("/:id", eliminarProveedor);

module.exports = router;
