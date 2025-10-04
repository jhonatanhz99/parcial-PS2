const pool = require("../config/db");

const obtenerInventario = async (req, res) => {
    try {
        let sql = `
            SELECT 
                i.*, 
                p.nombre_empresa 
            FROM inventario i
            LEFT JOIN proveedores p ON i.id_proveedor = p.id_proveedor
            WHERE 1=1
        `;
        const params = [];
        if (req.query.nombre) {
            sql += " AND i.nombre_producto LIKE ?";
            params.push(`%${req.query.nombre}%`);
        }
        if (req.query.categoria) {
            sql += " AND i.categoria LIKE ?";
            params.push(`%${req.query.categoria}%`);
        }
        if (req.query.id_proveedor) {
            sql += " AND i.id_proveedor = ?";
            params.push(req.query.id_proveedor);
        }
        if (req.query.estado_producto) {
            sql += " AND i.estado_producto = ?";
            params.push(req.query.estado_producto);
        }
        if (req.query.solo_usuarios) {
            sql += " AND v.tipo_usuario = 'usuario'";
        }
        if (req.query.solo_administradores) {
            sql += " AND v.tipo_usuario = 'administrador'";
        }
        if (req.query.nombre_usuario) {
            sql += " AND v.usuario = ?";
            params.push(req.query.nombre_usuario);
        }
        if (req.query.nombre_admin) {
            sql += " AND v.usuario = ?";
            params.push(req.query.nombre_admin);
        }
        if (req.query.id_usuario) {
            sql += " AND v.id_usuario = ?";
            params.push(req.query.id_usuario);
        }
        const [inventario] = await pool.query(sql, params);
        res.json(inventario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { obtenerInventario };
