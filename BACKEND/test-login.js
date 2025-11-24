/**
 * Script de diagnóstico para probar login
 * Ejecuta: node test-login.js
 */

require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcrypt');

async function testLogin() {
  console.log('=== INICIANDO TEST DE LOGIN ===\n');

  try {
    console.log('1. Conectando a la base de datos...');
    const connection = await db.getConnection();
    console.log('✓ Conexión exitosa\n');
    connection.release();

    console.log('2. Buscando usuario en tabla "usuario"...');
    const [usuarios] = await db.query('SELECT * FROM usuario LIMIT 5');
    if (usuarios.length === 0) {
      console.log('✗ No hay usuarios registrados en la tabla.');
      console.log('  Primero crea un usuario con: node test-registro.js\n');
      process.exit(1);
    }
    
    console.log('✓ Usuarios encontrados:', usuarios.length);
    console.log('  Listando primeros 3:');
    usuarios.slice(0, 3).forEach((u, i) => {
      console.log(`  ${i+1}. nombre_usuario="${u.nombre_usuario}", email="${u.email}"`);
    });
    console.log();

    // Seleccionar el primer usuario
    const usuario = usuarios[0];
    console.log('3. Probando login con usuario:', usuario.email);
    console.log('  (Nota: La contraseña actual está hasheada, probaremos con una contraseña conocida)\n');

    // Buscar usuario por email
    const [rows] = await db.query('SELECT * FROM usuario WHERE email = ?', [usuario.email]);
    if (rows.length === 0) {
      console.log('✗ Usuario no encontrado por email\n');
      process.exit(1);
    }

    const user = rows[0];
    console.log('✓ Usuario encontrado:');
    console.log('  ID:', user.id_usuario);
    console.log('  Nombre:', user.nombre_usuario);
    console.log('  Email:', user.email);
    console.log('  Contraseña (valor completo):', JSON.stringify(user.contraseña || user.contrasena));
    console.log('  Longitud:', (user.contraseña || user.contrasena).length);
    console.log();

    // Probar con contraseña conocida: '1234' (la que vimos en la BD para Jaider)
    const testPassword = '1234';
    console.log('4. Comparando contraseña...');
    console.log('  Contraseña a probar:', testPassword);
    
    const passwordHash = user.contrasena || user.contraseña;
    if (!passwordHash) {
      console.log('✗ NO HAY HASH DE CONTRASEÑA ALMACENADO');
      console.log('  Campo "contrasena":', user.contrasena);
      console.log('  Campo "contraseña":', user.contraseña);
      console.log('\n💡 PROBLEMA: La columna de contraseña no tiene valor. Recrea el usuario.\n');
      process.exit(1);
    }

    let match = false;
    try {
      // Intenta bcrypt.compare (para contraseñas hasheadas)
      match = await bcrypt.compare(testPassword, passwordHash);
      console.log('  bcrypt.compare resultado:', match);
    } catch (bcryptErr) {
      // Si bcrypt falla, compara como texto plano (para usuarios antiguos)
      console.log('  (Detectado: contraseña en texto plano)');
      console.log('  Comparación texto plano:', testPassword, '===', passwordHash, '?');
      match = testPassword === passwordHash;
      console.log('  Resultado:', match);
    }
    
    if (match) {
      console.log('✓ Contraseña CORRECTA\n');
      console.log('=== TEST DE LOGIN COMPLETADO CON ÉXITO ===\n');
    } else {
      console.log('✗ Contraseña INCORRECTA');
      console.log('  Si registraste el usuario con otra contraseña, ajusta "testPassword" en este script.\n');
    }

  } catch (err) {
    console.error('\n✗ ERROR DURANTE EL TEST:');
    console.error('Mensaje:', err && err.message);
    if (err && err.code) console.error('Código SQL:', err.code);
    console.error('\nStack trace:');
    console.error(err && err.stack);

    if (err && err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.log('\n💡 SUGERENCIA: MySQL no está corriendo o credenciales incorrectas.\n');
    }

    process.exit(1);
  }

  process.exit(0);
}

testLogin();
