import React from "react";
import { Link, useNavigate } from "react-router-dom";

// Estilos base para los links
const linkStyle = {
  color: "#fff",
  textDecoration: "none",
  background: "linear-gradient(90deg, #007bff 0%, #00e1ff 100%)",
  border: "none",
  padding: "10px 0",
  borderRadius: "8px",
  display: "block",
  margin: "10px 0",
  textAlign: "center",
  fontWeight: "bold",
  fontSize: 16,
  boxShadow: "0 2px 8px #0002",
  backdropFilter: "blur(2px)",
  transition: "background 0.2s, transform 0.2s",
  cursor: "pointer",
  width: "100%",
  minWidth: 0,
};

// Hover para los links
const linkHoverStyle = {
  background: "linear-gradient(90deg, #00bfff 0%, #007bff 100%)",
  color: "#fff",
  transform: "scale(1.05)",
};

// Botón cerrar sesión (gradiente rojo)
const logoutStyle = {
  ...linkStyle,
  background: "linear-gradient(90deg, #e53935 0%, #ff1744 100%)",
};

const logoutHoverStyle = {
  background: "linear-gradient(90deg, #ff1744 0%, #e53935 100%)",
  color: "#fff",
  transform: "scale(1.05)",
};

function Sidebar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/"); // Redirige al login
  };

  return (
    <nav
      style={{
        width: 160,
        position: "fixed", // Cambia a fixed
        left: 0,
        top: 0,
        height: "100vh",
        background: "rgba(24, 31, 42, 0.85)", // Fondo translúcido azul oscuro
        padding: 18,
        backdropFilter: "blur(6px)",
        zIndex: 1000, // Para que quede encima del contenido
      }}
    >
      <h1
        style={{
          color: "#2196f3", // Azul, sin brillo ni sombra
          fontSize: 32,
          textAlign: "center",
          marginBottom: 28,
          letterSpacing: 2,
          fontWeight: 800,
          background: "none",
          border: "none",
          borderRadius: 0,
          padding: "8px 0",
          boxShadow: "none",
        }}
      >
        MENÚ
      </h1>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {[
          { to: "/dashboard", label: "Inicio" },
          { to: "/clientes", label: "Clientes" },
          { to: "/productos", label: "Productos" },
          { to: "/inventario", label: "Inventario" },
          { to: "/ventas", label: "Ventas" },
          { to: "/proveedores", label: "Proveedores" },
          { to: "/usuarios", label: "Usuarios" },
          //{ to: "/reportes", label: "Reportes" },
        ].map((item, index) => (
          <li key={index}>
            <Link
              to={item.to}
              style={linkStyle}
              onMouseOver={(e) => Object.assign(e.target.style, linkHoverStyle)}
              onMouseOut={(e) => Object.assign(e.target.style, linkStyle)}
            >
              {item.label}
            </Link>
          </li>
        ))}
        <li>
          <button
            onClick={handleLogout}
            style={logoutStyle}
            onMouseOver={(e) => Object.assign(e.target.style, logoutHoverStyle)}
            onMouseOut={(e) => Object.assign(e.target.style, logoutStyle)}
          >
            Cerrar sesión
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;

