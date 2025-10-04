const pool = require("../config/db");

const agregarVenta = async (id_cliente, id_vendedor, fecha_venta, total) => {
    const query = "INSERT INTO ventas (id_cliente, id_vendedor, fecha_venta, total) VALUES (?, ?, ?, ?)";
    return pool.query(query, [id_cliente, id_vendedor, fecha_venta, total_venta]);
};

const obtenerVentas = async () => {
    return pool.query("SELECT * FROM ventas");
};

const eliminarVenta = async (id) => {
    return pool.query("DELETE FROM ventas WHERE id_venta = ?", [id]);
};

const actualizarVenta = async (id, datos) => {
    const query = "UPDATE ventas SET ? WHERE id_venta = ?";
    return pool.query(query, [datos, id]);
};

module.exports = { agregarVenta, obtenerVentas, eliminarVenta, actualizarVenta };
