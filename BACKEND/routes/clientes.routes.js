// routes/clientes.routes.js

const express = require("express");
const router = express.Router();
const clientesController = require("../controllers/clientes.controller");

// Obtener todos los clientes
router.get("/", clientesController.obtenerClientes);

// Agregar cliente
router.post("/", clientesController.agregarCliente);

// Actualizar cliente por ID
router.put("/:id_cliente", clientesController.actualizarClientePorId);

// Eliminar cliente por ID
router.delete("/:id_cliente", clientesController.eliminarClientePorId);

module.exports = router;
