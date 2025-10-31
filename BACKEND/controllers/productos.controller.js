const pool = require("../config/db");

// Obtener todos los productos
const obtenerProductos = async (req, res) => {
    try {
        const [productos] = await pool.query("SELECT * FROM productos");
        res.json(productos);
    } catch (error) {
        console.error(error);
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
        // Verificar si existen detalles de venta asociados al producto
        let totalDetalle = 0;
        let totalVentas = 0;
        try {
            const [rows] = await pool.query("SELECT COUNT(*) AS total FROM detalle_ventas WHERE id_producto = ?", [id]);
            totalDetalle = rows[0].total || 0;
        } catch (err) {
            if (err && err.code === 'ER_NO_SUCH_TABLE') {
                console.warn('Tabla detalle_ventas no existe, asumiendo totalDetalle=0');
                totalDetalle = 0;
            } else {
                throw err;
            }
        }

        try {
            const [rowsV] = await pool.query("SELECT COUNT(*) AS total FROM ventas WHERE id_producto = ?", [id]);
            totalVentas = rowsV[0].total || 0;
        } catch (err) {
            if (err && err.code === 'ER_NO_SUCH_TABLE') {
                console.warn('Tabla ventas no existe, asumiendo totalVentas=0');
                totalVentas = 0;
            } else {
                throw err;
            }
        }

        const total = Number(totalDetalle) + Number(totalVentas);
        if (total > 0) {
            return res.status(400).json({ error: "Producto tiene ventas asociadas y no puede ser eliminado" });
        }

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
