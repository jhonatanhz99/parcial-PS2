const Usuario = require('../models/usuario');
const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.listar = async (req, res) => {
    const [usuarios] = await Usuario.getAll();
    res.json(usuarios);
};

exports.obtener = async (req, res) => {
    const [usuario] = await Usuario.getById(req.params.id);
    res.json(usuario[0]);
};

// Crear usuario (registro público)
exports.crear = async (req, res) => {
    // Acepta tanto 'correo' como 'email' para flexibilidad en el frontend
    const { nombre, correo, email, contrasena } = req.body;
    const emailUsed = email || correo;
    const nombreUsed = nombre;

    if (!nombreUsed || !emailUsed || !contrasena) {
        return res.status(400).json({ success: false, message: 'Campos requeridos: nombre, correo, contrasena.' });
    }

    try {
        // Verificar si ya existe el email (columna real en BD es 'email')
        const [existe] = await db.query('SELECT * FROM usuario WHERE email = ?', [emailUsed]);
        if (existe.length > 0) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado.' });
        }

        // Hashear la contraseña
        const hash = await bcrypt.hash(contrasena, 10);

        // Construir objeto a insertar con nombres de columnas reales de la BD
        // Columnas reales: nombre_usuario, email, contraseña
        const nuevo = {
            nombre_usuario: nombreUsed,
            email: emailUsed,
            contraseña: hash
        };

        console.log('Intentando crear usuario:', { nombre_usuario: nombreUsed, email: emailUsed });

        await Usuario.create(nuevo);

        res.status(201).json({ success: true, message: 'Usuario creado correctamente.' });
    } catch (err) {
        console.error('ERROR CREAR USUARIO:', err && err.message);
        if (err && err.stack) console.error(err.stack);
        res.status(500).json({ success: false, message: 'Error en el servidor.', error: err && err.message });
    }
};

exports.actualizar = async (req, res) => {
    await Usuario.update(req.params.id, req.body);
    res.json({ success: true, message: 'Usuario actualizado' });
};

exports.eliminar = async (req, res) => {
    await Usuario.delete(req.params.id);
    res.json({ success: true, message: 'Usuario eliminado' });
};