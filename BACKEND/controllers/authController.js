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
            // Si no está en administradores, busca en usuarios por el campo 'email'
            [rows] = await db.query('SELECT * FROM usuario WHERE email = ?', [usuario]);
            rol = "usuario";
        }

        if (rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
        }

        const user = rows[0];
        // Columna real puede ser 'contrasena' (admin) o 'contraseña' (usuario)
        const passwordHash = user.contrasena || user.contraseña;
        
        if (!passwordHash) {
            console.error('ERROR EN LOGIN: passwordHash no encontrado en usuario:', user);
            return res.status(400).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
        }

        // Manejo compatible: contraseñas hasheadas (nuevas) y en texto plano (antiguas)
        let match = false;
        try {
            // Intenta bcrypt.compare (para contraseñas hasheadas)
            match = await bcrypt.compare(contrasena, passwordHash);
        } catch (bcryptErr) {
            // Si bcrypt falla, compara como texto plano (para usuarios antiguos)
            console.warn('Fallback a comparación de texto plano para usuario:', user.email);
            match = contrasena === passwordHash;
        }

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
                nombre: user.nombre_usuario || user.nombre || user.usuario,
                correo: user.email || user.correo || user.usuario,
                rol
            }
        });
    } catch (err) {
        console.error('ERROR EN LOGIN:', err && err.message);
        if (err && err.stack) console.error(err.stack);
        res.status(500).json({ success: false, message: 'Error en el servidor.', error: err && err.message });
    }
};

// Si no tienes la función registrar, agrega una vacía o la real:
exports.registrar = async (req, res) => {
    res.status(501).json({ success: false, message: 'No implementado.' });
};
