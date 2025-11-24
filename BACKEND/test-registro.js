/**
 * Script de diagnóstico para probar el registro de usuarios
 * Ejecuta: node test-registro.js
 */

require('dotenv').config();
const db = require('./config/db');
const bcrypt = require('bcrypt');

async function testRegistro() {
  console.log('=== INICIANDO TEST DE REGISTRO ===\n');

  // Datos de prueba
  const testUser = {
    nombre: 'Usuario Prueba',
    correo: `prueba${Date.now()}@example.com`,
    contrasena: '123456'
  };

  try {
    console.log('1. Conectando a la base de datos...');
    // Prueba la conexión
    const connection = await db.getConnection();
    console.log('✓ Conexión exitosa\n');
    connection.release();

    console.log('2. Verificando tabla "usuario"...');
    const [tables] = await db.query("SHOW TABLES LIKE 'usuario'");
    if (tables.length === 0) {
      console.log('✗ La tabla "usuario" NO existe.');
      console.log('  Creando tabla...\n');
      await db.query(`
        CREATE TABLE usuario (
          id_usuario INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(150) NOT NULL,
          correo VARCHAR(200) NOT NULL UNIQUE,
          contrasena VARCHAR(255) NOT NULL,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✓ Tabla "usuario" creada\n');
    } else {
      console.log('✓ Tabla "usuario" existe');
      const [cols] = await db.query('DESCRIBE usuario');
      console.log('  Columnas:', cols.map(c => c.Field).join(', '));
      console.log();
    }

    console.log('3. Intentando registrar usuario...');
    console.log('  Datos:', { nombre_usuario: testUser.nombre, email: testUser.correo, contraseña: '***' });

    // Verificar duplicados (usar nombre real de columna: 'email')
    const [existe] = await db.query('SELECT * FROM usuario WHERE email = ?', [testUser.correo]);
    if (existe.length > 0) {
      console.log('✗ El correo ya existe.\n');
      return;
    }

    // Hashear
    console.log('  Hasheando contraseña...');
    const hash = await bcrypt.hash(testUser.contrasena, 10);
    console.log('  ✓ Hash generado\n');

    // Insertar (usar nombres reales de columnas)
    console.log('4. Insertando en la BD...');
    const [result] = await db.query(
      'INSERT INTO usuario (nombre_usuario, email, contraseña) VALUES (?, ?, ?)',
      [testUser.nombre, testUser.correo, hash]
    );
    console.log('✓ Usuario insertado exitosamente');
    console.log('  ID:', result.insertId);
    console.log('  Correo:', testUser.correo);
    console.log('\n=== TEST COMPLETADO CON ÉXITO ===\n');

  } catch (err) {
    console.error('\n✗ ERROR DURANTE EL TEST:');
    console.error('Mensaje:', err.message);
    if (err.code) console.error('Código SQL:', err.code);
    if (err.sqlState) console.error('Estado SQL:', err.sqlState);
    console.error('\nStack trace completo:');
    console.error(err.stack);
    console.error('\n=== FIN DEL ERROR ===\n');

    // Recomendaciones según el error
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
      console.log('💡 SUGERENCIA: La conexión a MySQL se perdió o falló.');
      console.log('   Verifica que:');
      console.log('   - MySQL está corriendo');
      console.log('   - Las credenciales en .env son correctas');
      console.log('   - DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT son válidos\n');
    } else if (err.code === 'ER_NO_SUCH_TABLE') {
      console.log('💡 SUGERENCIA: La tabla "usuario" no existe.');
      console.log('   El script intenta crearla automáticamente.\n');
    } else if (err.code === 'ER_BAD_FIELD_ERROR') {
      console.log('💡 SUGERENCIA: Una columna no existe o tiene otro nombre.');
      console.log('   Verifica la estructura de la tabla con: DESCRIBE usuario;\n');
    }

    process.exit(1);
  }

  process.exit(0);
}

testRegistro();
