import React from "react";

function Dashboard() {
  return (
    <div
      style={{
        marginLeft: 197,
        padding: 20,
        minHeight: "100vh",
        background:
          "linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('https://wallpapers.com/images/hd/store-background-gly9ersnb8mv5f9y.jpg') center/cover no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2
        style={{
          fontSize: "2.5rem",
          color: "#2d3748",
          textShadow: "1px 1px 8px #fff",
        }}
      >
        ¡Bienvenido!
      </h2>
      <p
        style={{
          fontSize: "1.3rem",
          color: "#4a5568",
          background: "rgba(255,255,255,0.6)",
          padding: "10px 20px",
          borderRadius: "8px",
        }}
      >
        Selecciona una opción del menú para comenzar.
      </p>
    </div>
  );
}

export default Dashboard;