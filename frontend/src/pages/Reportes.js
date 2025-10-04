import React from "react";

function Reportes() {
  const exportarExcel = () => {
    alert("Funcionalidad de exportar a Excel aquí");
  };

  return (
    <div style={{ marginLeft: 220, padding: 20 }}>
      <h2>Reportes</h2>
      <button onClick={exportarExcel}>Exportar a Excel</button>
      {/* Aquí puedes mostrar tablas de reportes */}
    </div>
  );
}

export default Reportes;