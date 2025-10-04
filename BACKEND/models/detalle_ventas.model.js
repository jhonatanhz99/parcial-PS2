const pool = require("../config/db");

const crearDetalleVenta = async (id_venta, id_producto, cantidad, precio_unitario, subtotal) => {
    const query = "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)";
    return pool.query(query, [id_venta, id_producto, cantidad, precio_unitario, subtotal]);
};

const obtenerDetallesVentas = async () => {
    return pool.query("SELECT * FROM detalle_ventas");
};

const eliminarDetalleVenta = async (id) => {
    return pool.query("DELETE FROM detalle_ventas WHERE id_detalle = ?", [id]);
};

module.exports = { crearDetalleVenta, obtenerDetallesVentas, eliminarDetalleVenta };
