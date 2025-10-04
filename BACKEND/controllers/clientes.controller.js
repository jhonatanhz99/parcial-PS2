const pool = require("../config/db");

// Obtener todos los clientes
const obtenerClientes = async (req, res) => {
    try {
        const [clientes] = await pool.query("SELECT * FROM clientes");
        res.json(clientes);
    } catch (error) {
        console.error('Error al obtener los clientes:', error.message);
        res.status(500).json({ error: 'Error al obtener los clientes. Intente nuevamente más tarde.' });
    }
};

// Agregar un nuevo cliente
const agregarCliente = async (req, res) => {
    try {
        const { cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, direccion, email } = req.body;

        // Validar campos obligatorios
        if (!cedula || !primer_nombre || !primer_apellido || !telefono || !direccion || !email) {
            return res.status(400).json({ error: "Todos los campos obligatorios deben estar completos." });
        }

        const query = "INSERT INTO clientes (cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, direccion, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const values = [cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, direccion, email];

        await pool.query(query, values);
        res.status(201).json({ mensaje: "Cliente registrado correctamente" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            res.status(400).json({ error: "La cédula ya está registrada." });
        } else {
            console.error('Error al agregar cliente:', error.message);
            res.status(500).json({ error: 'Error al registrar el cliente. Intente nuevamente más tarde.' });
        }
    }
};

// Eliminar un cliente por ID
const eliminarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM clientes WHERE id_cliente = ?";

        const [result] = await pool.query(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }

        res.status(200).json({ mensaje: "Cliente eliminado con éxito" });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            // Error por clave foránea
            return res.status(400).json({
                mensaje: 'No se puede eliminar el cliente porque tiene ventas asociadas.'
            });
        }
        // Otro error
        return res.status(500).json({
            mensaje: 'Error al eliminar el cliente.',
            error: error.message
        });
    }
};

// Actualizar un cliente
const actualizarCliente = async (req, res) => {
    try {
        const id = req.params.id; // id_cliente
        const { cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, direccion, email } = req.body;

        const query = `
            UPDATE clientes 
            SET cedula = ?, primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?, 
                telefono = ?, direccion = ?, email = ?
            WHERE id_cliente = ?`;
        const values = [cedula, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, direccion, email, id];
        const [result] = await pool.query(query, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" });
        }
        res.json({ mensaje: "Cliente actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener cliente por cédula
const obtenerClientePorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        const [clientes] = await pool.query("SELECT * FROM clientes WHERE cedula = ?", [cedula]);
        if (clientes.length === 0) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" });
        }
        res.json(clientes[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar cliente por cédula
const actualizarClientePorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, direccion, email } = req.body;
        const query = `
            UPDATE clientes 
            SET primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?, 
                telefono = ?, direccion = ?, email = ?
            WHERE cedula = ?`;
        const values = [primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono, direccion, email, cedula];
        const [result] = await pool.query(query, values);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" });
        }
        res.json({ mensaje: "Cliente actualizado correctamente" });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            res.status(400).json({ error: "El email ya está registrado en otro cliente." });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};

// Eliminar cliente por cédula
const eliminarClientePorCedula = async (req, res) => {
    try {
        const { cedula } = req.params;
        const query = "DELETE FROM clientes WHERE cedula = ?";
        const [result] = await pool.query(query, [cedula]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Cliente no encontrado" });
        }
        res.json({ mensaje: "Cliente eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar cliente por ID
const actualizarClientePorId = async (req, res) => {
  try {
    const { id_cliente } = req.params;
    const {
      cedula,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      telefono,
      direccion,
      email,
    } = req.body;

    // Verifica que la cédula no exista en otro cliente
    const [existe] = await pool.query(
      "SELECT id_cliente FROM clientes WHERE cedula = ? AND id_cliente != ?",
      [cedula, id_cliente]
    );
    if (existe.length > 0) {
      return res.status(400).json({ error: "La cédula ya está registrada en otro cliente." });
    }

    // Verifica que el email no exista en otro cliente
    const [existeEmail] = await pool.query(
      "SELECT id_cliente FROM clientes WHERE email = ? AND id_cliente != ?",
      [email, id_cliente]
    );
    if (existeEmail.length > 0) {
      return res.status(400).json({ error: "El email ya está registrado en otro cliente." });
    }

    // Actualiza el cliente
    const query = `
      UPDATE clientes SET
        cedula = ?, primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?,
        telefono = ?, direccion = ?, email = ?
      WHERE id_cliente = ?`;
    const values = [
      cedula,
      primer_nombre,
      segundo_nombre,
      primer_apellido,
      segundo_apellido,
      telefono,
      direccion,
      email,
      id_cliente,
    ];
    const [result] = await pool.query(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json({ mensaje: "Cliente actualizado correctamente" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "La cédula o el email ya están registrados." });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Eliminar cliente por ID
const eliminarClientePorId = async (req, res) => {
    try {
        const { id_cliente } = req.params;
        const query = "DELETE FROM clientes WHERE id_cliente = ?";
        const [result] = await pool.query(query, [id_cliente]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        res.status(200).json({ mensaje: "Cliente eliminado con éxito" });
    } catch (error) {
        // Verifica si el error es por restricción de clave foránea
        if (
            error.code === 'ER_ROW_IS_REFERENCED_2' ||
            (error.errno === 1451 && error.sqlMessage && error.sqlMessage.includes('a foreign key constraint fails'))
        ) {
            return res.status(400).json({
                mensaje: 'No se puede eliminar el cliente porque tiene ventas asociadas.'
            });
        }
        console.error('Error al eliminar cliente:', error.message);
        res.status(500).json({ error: 'Error al eliminar el cliente. Intente nuevamente más tarde.' });
    }
};

module.exports = {
    obtenerClientes,
    agregarCliente,
    actualizarClientePorId,
    eliminarClientePorId,
    // ...otros métodos si los necesitas
};
