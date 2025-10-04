const pool = require("../config/db");

const agregarProducto = async (nombre, descripcion, precio, stock, categoria) => {
    const query = "INSERT INTO productos (nombre, descripcion, precio, stock, categoria) VALUES (?, ?, ?, ?, ?)";
    return pool.query(query, [nombre, descripcion, precio, stock, categoria]);
};

const obtenerProductos = async () => {
    return pool.query("SELECT * FROM productos");
};

const eliminarProducto = async (id) => {
    return pool.query("DELETE FROM productos WHERE id_producto = ?", [id]);
};
const actualizarProducto = async (id, productoData) => {
    const query = "UPDATE productos SET ? WHERE id_producto = ?";
    return pool.query(query, [productoData, id]);
};


module.exports = { agregarProducto, obtenerProductos, eliminarProducto, actualizarProducto };
