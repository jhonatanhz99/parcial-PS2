const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const db = require('../config/db');
const router = express.Router();

// Configura tu transporte de correo (Gmail)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: true,
  auth: {
    user: 'jhonatansolarte1125408371@gmail.com',
    pass: 'lcys hs wl iyey cjdw',
  },
});

router.post('/', async (req, res) => {
  const { correo } = req.body;
  if (!correo) {
    return res.status(400).json({ success: false, message: 'Correo requerido.' });
  }

  try {
    // Busca primero en usuarios (campo correcto: correo)
    let [rows] = await db.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    let tabla = 'usuarios';
    let campoCorreo = 'correo';

    // Si no está en usuarios, busca en administradores (campo correcto: usuario)
    if (rows.length === 0) {
      [rows] = await db.query('SELECT * FROM administradores WHERE usuario = ?', [correo]);
      tabla = 'administradores';
      campoCorreo = 'usuario';
    }

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    // Genera un token único y fecha de expiración (1 hora)
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guarda el token y expiración en la base de datos
    await db.query(
      `UPDATE ${tabla} SET token_recuperacion = ?, token_expira = ? WHERE ${campoCorreo} = ?`,
      [token, expira, correo]
    );

    // Enlace de recuperación (ajusta la URL según tu frontend)
    const enlace = `http://localhost:3001/reset-password?token=${token}`;

    // Envía el correo
    await transporter.sendMail({
      from: '"Recuperación" <TUCORREO@gmail.com>',
      to: correo,
      subject: 'Recuperación de contraseña',
      text: `Haz clic en el siguiente enlace para recuperar tu contraseña: ${enlace}`,
      html: `<b>Haz clic <a href="${enlace}">aquí</a> para recuperar tu contraseña</b>`
    });

    res.json({ success: true, message: 'Correo de recuperación enviado.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'No se pudo enviar el correo.' });
  }
});

router.post('/reset', async (req, res) => {
  const { token, nuevaContrasena } = req.body;
  if (!token || !nuevaContrasena) {
    return res.status(400).json({ success: false, message: 'Datos incompletos.' });
  }

  try {
    // Busca el usuario con ese token y verifica que no haya expirado en usuarios
    let [rows] = await db.query('SELECT * FROM usuarios WHERE token_recuperacion = ? AND token_expira > NOW()', [token]);
    let tabla = 'usuarios';

    // Si no está en usuarios, busca en administradores
    if (rows.length === 0) {
      [rows] = await db.query('SELECT * FROM administradores WHERE token_recuperacion = ? AND token_expira > NOW()', [token]);
      tabla = 'administradores';
    }

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado.' });
    }

    // Hashea la nueva contraseña
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(nuevaContrasena, 10);

    // Actualiza la contraseña y elimina el token
    await db.query(
      `UPDATE ${tabla} SET contrasena = ?, token_recuperacion = NULL, token_expira = NULL WHERE token_recuperacion = ?`,
      [hash, token]
    );

    res.json({ success: true, message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar la contraseña.' });
  }
});

module.exports = router;