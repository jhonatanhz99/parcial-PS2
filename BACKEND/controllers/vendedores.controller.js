const pool = require("../config/db");

// Obtener todos los vendedores
const obtenerVendedores = async (req, res) => {
    try {
        const [vendedores] = await pool.query("SELECT * FROM vendedores");
        res.json(vendedores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Agregar un nuevo vendedor
const agregarVendedor = async (req, res) => {
    try {
        const { nombre, apellido, telefono, email, comision } = req.body;
        const query = "INSERT INTO vendedores (nombre, apellido, telefono, email, comision) VALUES (?, ?, ?, ?, ?)";
        const values = [nombre, apellido, telefono, email, comision];

        await pool.query(query, values);
        res.status(201).json({ mensaje: "Vendedor agregado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un vendedor por ID
const eliminarVendedor = async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM vendedores WHERE id_vendedor = ?";

        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Vendedor no encontrado" });
        }

        res.status(200).json({ mensaje: "Vendedor eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarVendedor = async (req, res) => {
    try {
        const { id } = req.params;
        const vendedorData = req.body;

        const [result] = await pool.query(
            "UPDATE vendedores SET ? WHERE id_vendedor = ?",
            [vendedorData, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Vendedor no encontrado" });
        }

        res.status(200).json({ mensaje: "Vendedor actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { obtenerVendedores, agregarVendedor, eliminarVendedor, actualizarVendedor };
