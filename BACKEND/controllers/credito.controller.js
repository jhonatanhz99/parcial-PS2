const pool = require("../config/db");

// Obtener todos los créditos
const obtenerCreditos = async (req, res) => {
    try {
        const [creditos] = await pool.query("SELECT * FROM credito");
        res.json(creditos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo crédito
const crearCredito = async (req, res) => {
    try {
        const { id_cliente, monto, fecha_inicio, fecha_vencimiento, tasa_interes } = req.body;
        const query = "INSERT INTO credito (id_cliente, monto, fecha_inicio, fecha_vencimiento, tasa_interes) VALUES (?, ?, ?, ?, ?)";
        const values = [id_cliente, monto, fecha_inicio, fecha_vencimiento, tasa_interes];

        await pool.query(query, values);
        res.status(201).json({ mensaje: "Crédito creado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un crédito por ID
const eliminarCredito = async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM credito WHERE id_credito = ?";
        
        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Crédito no encontrado" });
        }
        
        res.status(200).json({ mensaje: "Crédito eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerCreditos, crearCredito, eliminarCredito };
