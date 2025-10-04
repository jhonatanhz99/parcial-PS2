const pool = require("../config/db");

const crearComision = async (monto, fecha, id_vendedor) => {
    const query = "INSERT INTO comisiones (monto, fecha, id_vendedor) VALUES (?, ?, ?)";
    return pool.query(query, [monto, fecha, id_vendedor]);
};

const obtenerComisiones = async () => {
    return pool.query("SELECT * FROM comisiones");
};

const eliminarComision = async (id) => {
    return pool.query("DELETE FROM comisiones WHERE id_comision = ?", [id]);
};

module.exports = { crearComision, obtenerComisiones, eliminarComision };
