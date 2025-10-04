const pool = require("../config/db");

// Obtener todas las comisiones
const obtenerComisiones = async (req, res) => {
    try {
        const [comisiones] = await pool.query("SELECT * FROM comisiones");
        res.json(comisiones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva comisión
const crearComision = async (req, res) => {
    try {
        const { monto, fecha, id_vendedor } = req.body;
        const query = "INSERT INTO comisiones (monto, fecha, id_vendedor) VALUES (?, ?, ?)";
        const values = [monto, fecha, id_vendedor];

        await pool.query(query, values);
        res.status(201).json({ mensaje: "Comisión creada correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una comisión por ID
const eliminarComision = async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM comisiones WHERE id_comision = ?";
        
        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Comisión no encontrada" });
        }
        
        res.status(200).json({ mensaje: "Comisión eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerComisiones, crearComision, eliminarComision };
