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
    // Ahora permitimos enviar una venta con múltiples productos (items)
    const { id_cliente, metodo_pago, id_usuario, tipo_usuario, items } = req.body;

    // log request payload para depuración
    console.log('[registrarVenta] payload:', JSON.stringify(req.body));

    // Validaciones más descriptivas para ayudar a depurar 400
    if (!metodo_pago) {
      console.warn('[registrarVenta] falta metodo_pago');
      return res.status(400).json({ error: "Falta campo 'metodo_pago'" });
    }
    if (!id_usuario && id_usuario !== 0) {
      console.warn('[registrarVenta] falta id_usuario');
      return res.status(400).json({ error: "Falta campo 'id_usuario'" });
    }
    if (!tipo_usuario) {
      console.warn('[registrarVenta] falta tipo_usuario');
      return res.status(400).json({ error: "Falta campo 'tipo_usuario'" });
    }
    if (!items) {
      console.warn('[registrarVenta] falta items');
      return res.status(400).json({ error: "Falta campo 'items'" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      console.warn('[registrarVenta] items inválidos o vacío');
      return res.status(400).json({ error: "'items' debe ser un array con al menos un elemento" });
    }

    // Validar estructura mínima de cada item y devolver índice si falta algo
    for (let idx = 0; idx < items.length; idx++) {
      const it = items[idx];
      if (it.id_producto === undefined || it.id_producto === null || it.id_producto === "") {
        return res.status(400).json({ error: `Item ${idx + 1}: falta 'id_producto'` });
      }
      if (it.cantidad === undefined || it.cantidad === null || Number(it.cantidad) <= 0) {
        return res.status(400).json({ error: `Item ${idx + 1}: cantidad inválida` });
      }
      if (it.precio_unitario === undefined || it.precio_unitario === null || isNaN(Number(it.precio_unitario))) {
        return res.status(400).json({ error: `Item ${idx + 1}: falta o es inválido 'precio_unitario'` });
      }
    }

    // Usamos transacción para insertar venta + detalles + actualizar stock
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1) Verificar stock de todos los productos
      for (const it of items) {
        const [rows] = await connection.query("SELECT stock FROM productos WHERE id_producto = ?", [it.id_producto]);
        if (rows.length === 0) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ error: `El producto con id ${it.id_producto} no existe.` });
        }
        const stockActual = Number(rows[0].stock ?? 0);
        if (stockActual < Number(it.cantidad)) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ error: `Stock insuficiente para el producto ${it.id_producto}. Disponible: ${stockActual}` });
        }
      }

      // 2) Inserta la venta en la tabla `ventas` manteniendo compatibilidad con el esquema
      //    Guardamos los datos del primer item en los campos legacy (id_producto, cantidad_vendida, precio_unitario)
      const first = items[0];
      const insertVentaSql = `INSERT INTO ventas (id_cliente, id_producto, cantidad_vendida, precio_unitario, metodo_pago, id_usuario, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const [resultVenta] = await connection.query(insertVentaSql, [
        id_cliente || null,
        first.id_producto,
        first.cantidad,
        first.precio_unitario,
        metodo_pago,
        id_usuario,
        tipo_usuario
      ]);
      const id_venta = resultVenta.insertId;

      // 3) Debido a que no siempre existe la tabla detalle_ventas en la BD del usuario,
      //    en lugar de insertar en detalle_ventas insertamos una fila en `ventas` por cada item
      //    (esto mantiene compatibilidad con las consultas frontend que esperan filas en `ventas`).
      let total_venta = 0;
      const createdVentas = [];
      for (const it of items) {
        const cantidad = Number(it.cantidad);
        const precio = Number(it.precio_unitario);
        const subtotal = cantidad * precio;
        total_venta += subtotal;

        const insertSql = `INSERT INTO ventas (id_cliente, id_producto, cantidad_vendida, precio_unitario, metodo_pago, id_usuario, tipo_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [r] = await connection.query(insertSql, [
          id_cliente || null,
          it.id_producto,
          cantidad,
          precio,
          metodo_pago,
          id_usuario,
          tipo_usuario
        ]);
        const created = {
          id_venta: r.insertId,
          id_cliente: id_cliente || null,
          id_producto: it.id_producto,
          cantidad_vendida: cantidad,
          precio_unitario: precio,
          metodo_pago,
          id_usuario,
          tipo_usuario,
          subtotal
        };
        createdVentas.push(created);

        const [updateResult] = await connection.query("UPDATE productos SET stock = stock - ? WHERE id_producto = ?", [cantidad, it.id_producto]);
        if (updateResult.affectedRows === 0) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ error: `No se pudo actualizar el stock para producto ${it.id_producto}` });
        }
      }

      await connection.commit();
      connection.release();

      // Responder con las filas creadas en ventas (una por item) y total
      res.status(201).json({ ventas: createdVentas, total_venta });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error) {
    console.error("Error en registrarVenta:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerVentas, registrarVenta };

// Obtener una venta por id con sus detalles
const obtenerVentaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    // Intentamos obtener la venta principal
    const [ventasRows] = await pool.query(
      `SELECT v.*, c.primer_nombre, c.primer_apellido
       FROM ventas v
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       WHERE v.id_venta = ?`,
      [id]
    );
    if (ventasRows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
    const venta = ventasRows[0];

    // Intentamos obtener detalles desde detalle_ventas. Si la tabla no existe, devolvemos la venta sola.
    try {
      const [items] = await pool.query(
        `SELECT dv.id_detalle, dv.id_producto, dv.cantidad, dv.precio_unitario, dv.subtotal, p.nombre, p.descripcion
         FROM detalle_ventas dv
         LEFT JOIN productos p ON dv.id_producto = p.id_producto
         WHERE dv.id_venta = ?`,
        [id]
      );
      const total_calculado = items.reduce((s, it) => s + Number(it.subtotal || 0), 0);
      return res.json({ venta: { ...venta, total_venta: venta.total_venta ?? total_calculado }, items });
    } catch (err) {
      if (err && err.code === 'ER_NO_SUCH_TABLE') {
        // detalle_ventas no existe en esta BD, devolvemos la fila de ventas como venta única
        return res.json({ venta, items: [] });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error en obtenerVentaPorId:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { obtenerVentas, registrarVenta, obtenerVentaPorId };
