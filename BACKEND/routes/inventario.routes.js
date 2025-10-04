const express = require("express");
const router = express.Router();
const { obtenerInventario } = require("../controllers/inventario.controller");

router.get("/", obtenerInventario);

module.exports = router;
