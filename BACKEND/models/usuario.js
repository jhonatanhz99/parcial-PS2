const db = require('../config/db');

const Usuario = {
    getAll: () => db.query('SELECT * FROM usuario'),
    getById: (id_usuario) => db.query('SELECT * FROM usuario WHERE id_usuario = ?', [id_usuario]),
    create: (data) => db.query('INSERT INTO usuario SET ?', [data]),
    update: (id_usuario, data) => db.query('UPDATE usuario SET ? WHERE id_usuario = ?', [data, id_usuario]),
    delete: (id_usuario) => db.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario])
};

module.exports = Usuario;