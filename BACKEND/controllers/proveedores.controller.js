const pool = require("../config/db");

// Obtener todos los proveedores
const obtenerProveedores = async (req, res) => {
    try {
        const [proveedores] = await pool.query("SELECT * FROM proveedores");
        res.json(proveedores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Crear un nuevo proveedor
const crearProveedor = async (req, res) => {
    try {
        const {
            nombre_empresa,
            nit,
            contacto_nombre,
            telefono,
            email,
            direccion,
            sitio_web,
            tipo_productos,
            condiciones_pago,
            banco,
            numero_cuenta,
            tipo_cuenta,
            titular_cuenta,
            estado,
            observaciones
        } = req.body;

        const query = `
            INSERT INTO proveedores (
                nombre_empresa, nit, contacto_nombre, telefono, email, direccion,
                sitio_web, tipo_productos, condiciones_pago, banco, numero_cuenta,
                tipo_cuenta, titular_cuenta, estado, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            nombre_empresa,
            nit,
            contacto_nombre,
            telefono,
            email,
            direccion,
            sitio_web,
            tipo_productos,
            condiciones_pago,
            banco,
            numero_cuenta,
            tipo_cuenta,
            titular_cuenta,
            estado,
            observaciones
        ];
        const [result] = await pool.query(query, values);
        res.status(201).json({ mensaje: "Proveedor creado con éxito", id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un proveedor por ID
const actualizarProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            nombre_empresa,
            nit,
            contacto_nombre,
            telefono,
            email,
            direccion,
            sitio_web,
            tipo_productos,
            condiciones_pago,
            banco,
            numero_cuenta,
            tipo_cuenta,
            titular_cuenta,
            estado,
            observaciones
        } = req.body;

        const query = `
            UPDATE proveedores SET
                nombre_empresa = ?, nit = ?, contacto_nombre = ?, telefono = ?, email = ?, direccion = ?,
                sitio_web = ?, tipo_productos = ?, condiciones_pago = ?, banco = ?, numero_cuenta = ?,
                tipo_cuenta = ?, titular_cuenta = ?, estado = ?, observaciones = ?
            WHERE id_proveedor = ?
        `;
        const values = [
            nombre_empresa,
            nit,
            contacto_nombre,
            telefono,
            email,
            direccion,
            sitio_web,
            tipo_productos,
            condiciones_pago,
            banco,
            numero_cuenta,
            tipo_cuenta,
            titular_cuenta,
            estado,
            observaciones,
            id
        ];
        const [result] = await pool.query(query, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }
        res.json({ mensaje: "Proveedor actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un proveedor por ID
const eliminarProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM proveedores WHERE id_proveedor = ?";
        const [result] = await pool.query(query, [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Proveedor no encontrado" });
        }
        res.json({ mensaje: "Proveedor eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerProveedores, crearProveedor, actualizarProveedor, eliminarProveedor };
