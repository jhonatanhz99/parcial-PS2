const pool = require("../config/db");

const agregarProductoInventario = async (id_producto, cantidad_disponible, ubicacion, fecha_ingreso) => {
    const query = "INSERT INTO inventario (id_producto, cantidad_disponible, ubicacion, fecha_ingreso) VALUES (?, ?, ?, ?)";
    return pool.query(query, [id_producto, cantidad_disponible, ubicacion, fecha_ingreso]);
};

const obtenerInventario = async () => {
    return pool.query("SELECT * FROM inventario");
};

const eliminarProductoInventario = async (id) => {
    return pool.query("DELETE FROM inventario WHERE id_inventario = ?", [id]);
};

module.exports = { agregarProductoInventario, obtenerInventario, eliminarProductoInventario };
