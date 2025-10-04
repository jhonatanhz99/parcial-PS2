const pool = require("../config/db");

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
    try {
        const [productos] = await pool.query("SELECT * FROM productos");
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Agregar un nuevo producto
const crearProducto = async (req, res) => {
    try {
        let { nombre, descripcion, categoria, precio_compra, precio_venta, stock, id_proveedor, fecha_vencimiento } = req.body;

        // Si la fecha viene vacía, ponla como null
        if (!fecha_vencimiento) fecha_vencimiento = null;
        // Si viene en formato ISO, corta solo la fecha
        if (typeof fecha_vencimiento === "string" && fecha_vencimiento.includes("T")) {
            fecha_vencimiento = fecha_vencimiento.substring(0, 10);
        }

        const query = "INSERT INTO productos (nombre, descripcion, categoria, precio_compra, precio_venta, stock, id_proveedor, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [nombre, descripcion, categoria, precio_compra, precio_venta, stock, id_proveedor, fecha_vencimiento];
        await pool.query(query, values);
        res.status(201).json({ mensaje: "Producto creado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un producto
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM productos WHERE id_producto = ?";
        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        res.status(200).json({ mensaje: "Producto eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un producto
const actualizarProducto = async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, descripcion, categoria, precio_compra, precio_venta, stock, id_proveedor, fecha_vencimiento } = req.body;
        const query = "UPDATE productos SET nombre=?, descripcion=?, categoria=?, precio_compra=?, precio_venta=?, stock=?, id_proveedor=?, fecha_vencimiento=? WHERE id_producto=?";
        const values = [nombre, descripcion, categoria, precio_compra, precio_venta, stock, id_proveedor, fecha_vencimiento || null, id];
        await pool.query(query, values);
        res.status(200).json({ mensaje: "Producto actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar el producto" });
    }
};

module.exports = { obtenerProductos, crearProducto, eliminarProducto, actualizarProducto };
