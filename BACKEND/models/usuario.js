const db = require('../config/db');

const Usuario = {
    getAll: () => db.query('SELECT * FROM usuario'),
    getById: (id_usuario) => db.query('SELECT * FROM usuario WHERE id_usuario = ?', [id_usuario]),
    create: (data) => {
        // Usar INSERT explícito para evitar problemas con nombres de columna
        // data puede tener: nombre_usuario, email, contraseña, etc.
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        const sql = `INSERT INTO usuario (${columns}) VALUES (${placeholders})`;
        return db.query(sql, values);
    },
    update: (id_usuario, data) => db.query('UPDATE usuario SET ? WHERE id_usuario = ?', [data, id_usuario]),
    delete: (id_usuario) => db.query('DELETE FROM usuario WHERE id_usuario = ?', [id_usuario])
};

module.exports = Usuario;