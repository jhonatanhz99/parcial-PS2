const Usuario = require('../models/usuario');

exports.listar = async (req, res) => {
    const [usuarios] = await Usuario.getAll();
    res.json(usuarios);
};

exports.obtener = async (req, res) => {
    const [usuario] = await Usuario.getById(req.params.id);
    res.json(usuario[0]);
};

exports.crear = async (req, res) => {
    await Usuario.create(req.body);
    res.json({ success: true, message: 'Usuario creado' });
};

exports.actualizar = async (req, res) => {
    await Usuario.update(req.params.id, req.body);
    res.json({ success: true, message: 'Usuario actualizado' });
};

exports.eliminar = async (req, res) => {
    await Usuario.delete(req.params.id);
    res.json({ success: true, message: 'Usuario eliminado' });
};