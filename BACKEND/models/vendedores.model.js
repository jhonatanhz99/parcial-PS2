const pool = require("../config/db");

const agregarVendedor = async (nombre, apellido, telefono, email, comision) => {
    const query = "INSERT INTO vendedores (nombre, apellido, telefono, email, comision) VALUES (?, ?, ?, ?, ?)";
    return pool.query(query, [nombre, apellido, telefono, email, comision]);
};

const obtenerVendedores = async () => {
    return pool.query("SELECT * FROM vendedores");
};

const eliminarVendedor = async (id) => {
    return pool.query("DELETE FROM vendedores WHERE id_vendedor = ?", [id]);
};

const actualizarVendedor = async (id, vendedorData) => {
    const query = "UPDATE vendedores SET ? WHERE id_vendedor = ?";
    return pool.query(query, [vendedorData, id]);
};


module.exports = { agregarVendedor, obtenerVendedores, eliminarVendedor, actualizarVendedor };
