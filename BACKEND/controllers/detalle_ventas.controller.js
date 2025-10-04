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
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerDetallesVentas, crearDetalleVenta, eliminarDetalleVenta };
