const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// Ruta de registro para administradores
router.post('/', async (req, res) => {
    console.log('REQ BODY:', req.body); // Para depuración
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) {
        return res.status(400).json({ success: false, message: 'Campos requeridos.' });
    }

    try {
        // Verifica si el usuario ya existe
        const [existe] = await db.query('SELECT * FROM administradores WHERE usuario = ?', [usuario]);
        if (existe.length > 0) {
            return res.status(400).json({ success: false, message: 'El usuario ya existe.' });
        }

        // Hashea la contraseña
        const hash = await bcrypt.hash(contrasena, 10);

        // Inserta el administrador
        await db.query(
            'INSERT INTO administradores (usuario, contrasena) VALUES (?, ?)',
            [usuario, hash]
        );

        res.json({ success: true, message: 'Administrador registrado.' });
    } catch (err) {
        console.error('ERROR EN REGISTRO:', err);
        res.status(500).json({ success: false, message: 'Error en el servidor.', error: err.message });
    }
});

module.exports = router;