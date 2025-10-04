const pool = require("../config/db");

const agregarProveedor = async (nombre, contacto, telefono, direccion, email) => {
    const query = "INSERT INTO proveedores (nombre, contacto, telefono, direccion, email) VALUES (?, ?, ?, ?, ?)";
    return pool.query(query, [nombre, contacto, telefono, direccion, email]);
};

const obtenerProveedores = async () => {
    return pool.query("SELECT * FROM proveedores");
};

const eliminarProveedor = async (id) => {
    return pool.query("DELETE FROM proveedores WHERE id_proveedor = ?", [id]);
};

const actualizarProveedor = async (id, proveedorData) => {
    const query = "UPDATE proveedores SET ? WHERE id_proveedor = ?";
    return pool.query(query, [proveedorData, id]);
};

module.exports = { agregarProveedor, obtenerProveedores, eliminarProveedor, actualizarProveedor };
