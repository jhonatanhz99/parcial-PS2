const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) {
        return res.status(400).json({ success: false, message: 'Campos requeridos.' });
    }

    try {
        // Busca primero en administradores por el campo 'usuario'
        let [rows] = await db.query('SELECT * FROM administradores WHERE usuario = ?', [usuario]);
        let rol = "admin";
        if (rows.length === 0) {
            // Si no está en administradores, busca en usuarios por el campo 'correo'
            [rows] = await db.query('SELECT * FROM usuario WHERE correo = ?', [usuario]);
            rol = "usuario";
        }

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
        }

        const user = rows[0];
        const hash = user.contrasena;
        const match = await bcrypt.compare(contrasena, user.contrasena);
        if (!match) {
            return res.status(400).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
        }

        // Genera el token con el rol y el id
        const token = jwt.sign({ id: user.id || user.id_usuario, rol }, 'secreto123', { expiresIn: '1h' });

        // Devuelve el rol y el nombre/correo
        res.json({
            success: true,
            message: 'Login exitoso.',
            token,
            usuario: {
                id: user.id || user.id_usuario,
                nombre: user.nombre || user.usuario,
                correo: user.correo || user.usuario,
                rol
            }
        });
    } catch (err) {
        console.error('ERROR EN LOGIN:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor.' });
    }
};

// Si no tienes la función registrar, agrega una vacía o la real:
exports.registrar = async (req, res) => {
    res.status(501).json({ success: false, message: 'No implementado.' });
};
