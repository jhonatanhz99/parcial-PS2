const pool = require("../config/db");

const registrarPago = async (id_cliente, monto, fecha_pago, metodo_pago) => {
    const query = "INSERT INTO pagos (id_cliente, monto, fecha_pago, metodo_pago) VALUES (?, ?, ?, ?)";
    return pool.query(query, [id_cliente, monto, fecha_pago, metodo_pago]);
};

const obtenerPagos = async () => {
    return pool.query("SELECT * FROM pagos");
};

const eliminarPago = async (id) => {
    return pool.query("DELETE FROM pagos WHERE id_pago = ?", [id]);
};

module.exports = { registrarPago, obtenerPagos, eliminarPago };
