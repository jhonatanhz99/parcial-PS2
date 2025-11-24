import React, { useState } from "react";

function Login({ onLogin, onShowRegister, onShowRecover }) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario: correo, contrasena: password }),
      });
      const data = await res.json();
      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario)); // Guarda usuario y rol
        onLogin(data.usuario); // Pásalo a App.js
      } else {
        setMensaje(data.message || "Credenciales incorrectas");
      }
    } catch {
      setMensaje("Error de conexión");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `url('https://wallpapers.com/images/hd/shop-background-ms6oc93y0nouxst3.jpg') center/cover no-repeat`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backdropFilter: "blur(16px)",
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.25)",
          borderRadius: 18,
          boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)",
          maxWidth: 370,
          width: "100%",
          padding: 32,
          color: "#fff",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        <h2 style={{
          textAlign: "center",
          marginBottom: 24,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 1,
          color: "#00e1ff",
          textShadow: "0 2px 8px #0008"
        }}>
          Iniciar sesión
        </h2>
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          style={{
            width: "100%",
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.35)",
            color: "#222",
            fontWeight: 500,
            fontSize: 16,
            boxShadow: "0 2px 8px #0002",
            outline: "none",
            transition: "background 0.3s",
          }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            marginBottom: 16,
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "rgba(255,255,255,0.25)",
            color: "#222",
            fontWeight: 500,
            fontSize: 16,
            boxShadow: "0 2px 8px #0002",
            outline: "none",
            transition: "background 0.3s",
          }}
        />
        <button
          type="submit"
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "linear-gradient(90deg, #00e1ff 0%, #007bff 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 1,
            boxShadow: "0 2px 8px #0003",
            cursor: "pointer",
            marginBottom: 10,
            transition: "background 0.3s",
          }}
        >
          Entrar
        </button>
        {mensaje && (
          <div style={{
            marginTop: 16,
            color: "#ff1744",
            fontWeight: 600,
            textAlign: "center",
            textShadow: "0 1px 4px #0008"
          }}>
            {mensaje}
          </div>
        )}
        <div style={{ marginTop: 18, textAlign: "center" }}>
          <button
            type="button"
            onClick={() => (window.location.href = '/register')}
            style={{
              color: "#00e1ff",
              fontWeight: 600,
              textDecoration: "underline",
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
              fontSize: "inherit"
            }}
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;