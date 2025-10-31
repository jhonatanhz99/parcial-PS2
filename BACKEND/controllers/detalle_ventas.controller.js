const pool = require("../config/db");

// Obtener todos los detalles de ventas
const obtenerDetallesVentas = async (req, res) => {
    try {
        const [detalles] = await pool.query("SELECT * FROM detalle_ventas");
        res.json(detalles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo detalle de venta
const crearDetalleVenta = async (req, res) => {
    try {
        const { id_venta, id_producto, cantidad, precio_unitario, subtotal } = req.body;
        const query = "INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)";
        const values = [id_venta, id_producto, cantidad, precio_unitario, subtotal];

        await pool.query(query, values);
        res.status(201).json({ mensaje: "Detalle de venta creado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un detalle de venta por ID
const eliminarDetalleVenta = async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM detalle_ventas WHERE id_detalle = ?";
        
        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Detalle de venta no encontrado" });
        }
        
        res.status(200).json({ mensaje: "Detalle de venta eliminado con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Verificar si existen detalles de venta para un producto
const verificarVentasPorProducto = async (req, res) => {
    try {
        const { id } = req.params;
        // Queremos comprobar referencias tanto en detalle_ventas como en ventas
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
        return res.json({ total });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerDetallesVentas, crearDetalleVenta, eliminarDetalleVenta, verificarVentasPorProducto };
