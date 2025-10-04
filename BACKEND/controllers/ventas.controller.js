const pool = require("../config/db");

const obtenerVentas = async (req, res) => {
  try {
    const params = [];
    let sql = `
      SELECT v.*, 
             c.primer_nombre, c.primer_apellido, c.cedula, 
             p.nombre AS producto, p.descripcion, p.categoria,
             pr.nombre_empresa AS proveedor,
             CASE 
                 WHEN v.tipo_usuario = 'usuario' THEN u.nombre_usuario
                 WHEN v.tipo_usuario = 'administrador' THEN a.usuario
                 ELSE NULL
             END AS usuario
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      LEFT JOIN productos p ON v.id_producto = p.id_producto
      LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      LEFT JOIN usuario u ON v.id_usuario = u.id_usuario
      LEFT JOIN administradores a ON v.id_usuario = a.id
      WHERE 1=1
    `;

    if (req.query.id_producto) {
      sql += " AND v.id_producto = ?";
      params.push(req.query.id_producto);
    }
    if (req.query.categoria) {
      sql += " AND p.categoria = ?";
      params.push(req.query.categoria);
    }
    if (req.query.cedula) {
      sql += " AND c.cedula = ?";
      params.push(req.query.cedula);
    }
    if (req.query.nombre_producto) {
      sql += " AND p.nombre LIKE ?";
      params.push(`%${req.query.nombre_producto}%`);
    }
    if (req.query.descripcion) {
      sql += " AND p.descripcion LIKE ?";
      params.push(`%${req.query.descripcion}%`);
    }
    if (req.query.tipo_usuario) {
      sql += " AND v.tipo_usuario = ?";
      params.push(req.query.tipo_usuario);
    }
    if (req.query.fecha_desde) {
      sql += " AND DATE(v.fecha_venta) >= ?";
      params.push(req.query.fecha_desde);
    }
    if (req.query.fecha_hasta) {
      sql += " AND DATE(v.fecha_venta) <= ?";
      params.push(req.query.fecha_hasta);
    }
    if (req.query.metodo_pago) {
      sql += " AND v.metodo_pago = ?";
      params.push(req.query.metodo_pago);
    }
    if (req.query.proveedor) {
      sql += " AND pr.nombre_empresa = ?";
      params.push(req.query.proveedor);
    }
    if (req.query.solo_usuarios) {
      sql += " AND v.tipo_usuario = 'usuario'";
    }
    if (req.query.solo_administradores) {
      sql += " AND v.tipo_usuario = 'administrador'";
    }
    if (req.query.id_usuario) {
      sql += " AND v.id_usuario = ?";
      params.push(req.query.id_usuario);
    }

    sql += ` ORDER BY v.fecha_venta DESC`;

    const [ventas] = await pool.query(sql, params);
    res.json(ventas);
  } catch (error) {
    console.error("Error en obtenerVentas:", error);
    res.status(500).json({ error: error.message });
  }
};

const registrarVenta = async (req, res) => {
  try {
    const {
      id_cliente,
      id_producto,
      cantidad_vendida,
      precio_unitario,
      metodo_pago,
      id_usuario,
      tipo_usuario
    } = req.body;

    if (
      !id_producto ||
      !cantidad_vendida ||
      !precio_unitario ||
      !metodo_pago ||
      !id_usuario ||
      !tipo_usuario
    ) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const cantidadVendidaNum = Number(cantidad_vendida);

    // 1. Verifica que el producto existe y tiene stock suficiente
    const [productos] = await pool.query(
      "SELECT stock FROM productos WHERE id_producto = ?",
      [id_producto]
    );
    if (productos.length === 0) {
      return res.status(400).json({ error: "El producto no existe." });
    }
    const stockActual = Number(productos[0].stock ?? 0);
    if (stockActual < cantidadVendidaNum) {
      return res.status(400).json({ error: "Stock insuficiente para la venta." });
    }

    // 2. Registra la venta
    const sql = `
      INSERT INTO ventas (id_cliente, id_producto, cantidad_vendida, precio_unitario, metodo_pago, id_usuario, tipo_usuario)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id_cliente,
      id_producto,
      cantidad_vendida,
      precio_unitario,
      metodo_pago,
      id_usuario,
      tipo_usuario
    ];
    const [result] = await pool.query(sql, params);

    // 3. Actualiza el stock del producto
    const sqlStock = `
      UPDATE productos
      SET stock = stock - ?
      WHERE id_producto = ?
    `;
    const [updateResult] = await pool.query(sqlStock, [cantidadVendidaNum, id_producto]);

    if (updateResult.affectedRows === 0) {
      return res.status(400).json({ error: "No se pudo actualizar el stock. Verifica el id_producto y que el producto exista." });
    }

    res.status(201).json({
      id_venta: result.insertId,
      ...req.body
    });
  } catch (error) {
    console.error("Error en registrarVenta:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerVentas, registrarVenta };
