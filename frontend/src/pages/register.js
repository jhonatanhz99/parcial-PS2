import React, { useState } from 'react';

function Register() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    if (!nombre || !correo || !contrasena) {
      setMensaje('Rellena todos los campos');
      return;
    }
    if (contrasena.length < 6) {
      setMensaje('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (contrasena !== confirm) {
      setMensaje('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    try {
      const res = await fetch('http://localhost:3000/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, contrasena }),
      });
      const data = await res.json();
      if (data.success) {
        setMensaje('Registro exitoso. Redirigiendo al login...');
        setTimeout(() => (window.location.href = '/'), 1400);
      } else {
        setMensaje(data.message || 'Error en el registro');
      }
    } catch (err) {
      setMensaje('No se pudo conectar con el servidor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Crear cuenta</h2>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Nombre</label>
          <input
            style={styles.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Correo</label>
          <input
            type="email"
            style={styles.input}
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div style={styles.row}>
          <div style={{ flex: 1, marginRight: 8 }}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              style={styles.input}
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Confirmar</label>
            <input
              type="password"
              style={styles.input}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>
        </div>

        <button type="submit" style={styles.button} disabled={cargando}>
          {cargando ? 'Creando...' : 'Crear cuenta'}
        </button>

        {mensaje && <div style={styles.message}>{mensaje}</div>}

        <div style={styles.footer}>
          <button type="button" onClick={() => (window.location.href = '/')} style={styles.linkButton}>
            Volver al inicio
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'Montserrat', sans-serif",
    background: '#0b0f17'
  },
  bg: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(2,6,23,0.95) 100%)',
    transform: 'scale(1.05)',
    filter: 'blur(10px)',
    zIndex: 0,
    animation: 'float 10s ease-in-out infinite',
  },
  card: {
    position: 'relative',
    zIndex: 2,
    width: 420,
    maxWidth: '94%',
    background: 'rgba(8,12,20,0.88)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 28,
    boxShadow: '0 12px 40px rgba(2,6,23,0.7)',
    color: '#fff',
    backdropFilter: 'saturate(140%) blur(6px)',
    transition: 'transform 0.28s ease',
  },
  title: {
    margin: 0,
    marginBottom: 18,
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: 0.6,
    color: '#ffffff',
    textShadow: '0 2px 18px rgba(0,0,0,0.6)'
  },
  inputGroup: { marginBottom: 12 },
  label: { display: 'block', marginBottom: 6, fontSize: 13, color: '#cfe6ff' },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: 'none',
    outline: 'none',
    fontSize: 15,
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
  },
  row: { display: 'flex', gap: 8, marginBottom: 12 },
  button: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(90deg,#00c9ff,#007bff)',
    color: '#fff',
    fontWeight: 800,
    fontSize: 16,
    marginTop: 10,
    boxShadow: '0 8px 24px rgba(0,123,255,0.18)'
  },
  message: {
    marginTop: 12,
    color: '#ffdede',
    fontWeight: 600,
    textAlign: 'center'
  },
  footer: { marginTop: 12, textAlign: 'center' },
  linkButton: { background: 'none', border: 'none', color: '#9be7ff', cursor: 'pointer', fontWeight: 600 }
};

export default Register;

/* Insert lightweight global CSS rules for placeholders and focus to improve legibility */
try {
  const ss = document.styleSheets && document.styleSheets[0];
  if (ss) {
    // placeholder
    ss.insertRule("input::placeholder { color: rgba(255,255,255,0.6); }", ss.cssRules.length);
    // focus ring
    ss.insertRule("input:focus { box-shadow: 0 0 0 4px rgba(0,123,255,0.08); background: rgba(255,255,255,0.08); }", ss.cssRules.length);
    // small animation keyframes if not present
    const hasFloat = Array.from(ss.cssRules).some(r => r.name === 'float');
    if (!hasFloat) {
      ss.insertRule('@keyframes float { 0% { transform: translateY(0px) } 50% { transform: translateY(-10px) } 100% { transform: translateY(0px) } }', ss.cssRules.length);
    }
  }
} catch (e) {
  // ignore insertion errors (some environments block stylesheet edits)
}