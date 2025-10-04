const pool = require("../config/db");

const agregarCliente = async (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, direccion, email, tipo_cliente, limite_credito) => {
    const query = "INSERT INTO clientes (primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, direccion, email, tipo_cliente, limite_credito) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    return pool.query(query, [primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, direccion, email, tipo_cliente, limite_credito]);
};

const obtenerClientes = async () => {
    return pool.query("SELECT * FROM clientes");
};

const eliminarCliente = async (id) => {
    return pool.query("DELETE FROM clientes WHERE id_cliente = ?", [id]);
};
// Actualizar un cliente
const actualizarCliente = async (id, clienteData) => {
    try {
        const query = "UPDATE clientes SET ? WHERE id_cliente = ?";
        const [result] = await pool.query(query, [clienteData, id]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        throw error;
    }
};

module.exports = { agregarCliente, obtenerClientes, eliminarCliente, actualizarCliente };