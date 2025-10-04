const pool = require("../config/db");

// Obtener todos los pagos
const obtenerPagos = async (req, res) => {
    try {
        const [pagos] = await pool.query("SELECT * FROM pagos");
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Registrar un nuevo pago
const registrarPago = async (req, res) => {
    try {
        const { id_cliente, monto, fecha_pago, metodo_pago } = req.body;
        const query = "INSERT INTO pagos (id_cliente, monto, fecha_pago, metodo_pago) VALUES (?, ?, ?, ?)";
        const values = [id_cliente, monto, fecha_pago, metodo_pago];

        await pool.query(query, values);
        res.status(201).json({ mensaje: "Pago registrado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un pago por ID
const eliminarPago = async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM pagos WHERE id_pago = ?";

        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Pago no encontrado" });
        }

        res.status(200).json({ mensaje: "Pago eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerPagos, registrarPago, eliminarPago };
