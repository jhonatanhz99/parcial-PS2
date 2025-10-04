import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Inventario() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mostrarTabla] = useState(true);
  const [proveedoresRegistrados, setProveedoresRegistrados] = useState([]);
  const [proveedor, setProveedor] = useState("");
  const [metodoPago, setMetodoPago] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  // Filtros
  const [filtros, setFiltros] = useState({
    id_producto: "",
    categoria: "",
    cedula: "",
    nombre_producto: "",
    descripcion: "",
    tipo_usuario: "",
    id_usuario: "",
  });
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaCliente, setBusquedaCliente] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");

  // Opciones únicas de usuarios y administradores (sin repetir)
  const opcionesUsuarios = [
    ...ventas
      .filter(v => v.tipo_usuario === "usuario" && v.usuario)
      .map(v => ({
        id: v.id_usuario,
        nombre: v.usuario,
        tipo: "usuario"
      })),
    ...ventas
      .filter(v => v.tipo_usuario === "administrador" && v.usuario)
      .map(v => ({
        id: v.id_usuario,
        nombre: v.usuario,
        tipo: "administrador"
      }))
  ].filter((v, i, arr) =>
    arr.findIndex(x => x.id === v.id && x.tipo === v.tipo) === i
  );

  // Opciones únicas de método de pago desde ventas
  const opcionesMetodoPago = Array.from(
    new Set(ventas.map(v => v.metodo_pago).filter(Boolean))
  );

  // Opciones únicas de proveedor desde proveedores registrados
  const opcionesProveedor = Array.from(
    new Set(proveedoresRegistrados.map(p => p.nombre_empresa).filter(Boolean))
  );

  // Cargar productos, categorías, clientes y proveedores
  useEffect(() => {
    fetch("http://localhost:3000/api/productos")
      .then(res => res.json())
      .then(data => {
        setProductos(data);
        setCategorias(Array.from(new Set(data.map(p => p.categoria).filter(Boolean))));
      });
    fetch("http://localhost:3000/api/clientes")
      .then(res => res.json())
      .then(setClientes);
    fetch("http://localhost:3000/api/proveedores")
      .then(res => res.json())
      .then(setProveedoresRegistrados);
    fetchVentas(); // Cargar ventas al inicio
    // eslint-disable-next-line
  }, []);

  // Buscar nombre de cliente por cédula
  useEffect(() => {
    if (busquedaCliente.trim() === "") {
      setClienteNombre("");
      setFiltros(f => ({ ...f, cedula: "" }));
      return;
    }
    const cliente = clientes.find(c => String(c.cedula) === busquedaCliente.trim());
    setClienteNombre(cliente ? `${cliente.primer_nombre} ${cliente.primer_apellido}` : "");
    setFiltros(f => ({ ...f, cedula: busquedaCliente }));
  }, [busquedaCliente, clientes]);

  // Filtrar ventas por todos los filtros
  const fetchVentas = async () => {
    const params = new URLSearchParams();
    if (filtros.id_producto) params.append("id_producto", filtros.id_producto);
    if (filtros.categoria) params.append("categoria", filtros.categoria);
    if (filtros.cedula) params.append("cedula", filtros.cedula);
    if (filtros.nombre_producto) params.append("nombre_producto", filtros.nombre_producto);
    if (filtros.descripcion) params.append("descripcion", filtros.descripcion);
    if (filtros.tipo_usuario) params.append("tipo_usuario", filtros.tipo_usuario);
    if (fechaDesde) params.append("fecha_desde", fechaDesde);
    if (fechaHasta) params.append("fecha_hasta", fechaHasta);
    if (metodoPago) params.append("metodo_pago", metodoPago);
    if (proveedor) params.append("proveedor", proveedor);

    if (filtros.id_usuario === "__solo_usuarios__") {
      params.append("solo_usuarios", "1");
    } else if (filtros.id_usuario === "__solo_administradores__") {
      params.append("solo_administradores", "1");
    } else if (filtros.id_usuario) {
      params.append("id_usuario", filtros.id_usuario);
    }

    const res = await fetch(`http://localhost:3000/api/ventas?${params.toString()}`);
    const data = await res.json();
    setVentas(data);
  };

  // Botón filtrar
  const handleFiltrar = () => {
    fetchVentas();
  };

  // Botón limpiar filtros
  const handleLimpiarFiltros = () => {
    setFiltros({
      id_producto: "",
      categoria: "",
      cedula: "",
      nombre_producto: "",
      descripcion: "",
      tipo_usuario: "",
      id_usuario: "",
    });
    setBusquedaProducto("");
    setBusquedaCliente("");
    setClienteNombre("");
    setProveedor("");
    setMetodoPago("");
    setFechaDesde("");
    setFechaHasta("");
    fetchVentas();
  };

//desde la linea 145  remplazar hasta la ultima linea de la función exportar pdf y excel(comentario jhonatan)
// Función para formatear fecha en 24 horas (igual que en la tabla)
function formatearFecha(fechaStr) {
  if (!fechaStr) return "";
  // Si ya viene como string tipo "2025-06-04T04:27:04.000Z" o "2025-06-04 04:27:04"
  const fecha = new Date(fechaStr.replace(" ", "T"));
  return fecha.toLocaleString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).replace(",", "");
}

// Exportar a Excel
const exportarExcel = () => {
  const ws = XLSX.utils.json_to_sheet(
    ventas.map(item => ({
      "ID": item.id_venta,
      "Fecha": formatearFecha(item.fecha_venta),
      "Cliente": item.primer_nombre ? `${item.primer_nombre} ${item.primer_apellido}` : "Genérico",
      "Cédula": item.cedula,
      "Producto": item.producto,
      "Descripción": item.descripcion,
      "Categoría": item.categoria,
      "Proveedor": item.proveedor,
      "Cantidad": item.cantidad_vendida,
      "Precio unitario": item.precio_unitario,
      "Total": item.total_venta,
      "Método pago": item.metodo_pago,
      "Usuario": item.usuario,
      "Tipo usuario": item.tipo_usuario
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ventas");
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "ventas.xlsx");
};

// Exportar a PDF
const exportarPDF = () => {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.text("Reporte de Ventas", 14, 10);
  autoTable(doc, {
    head: [[
      "ID", "Fecha", "Cliente", "Cédula", "Producto", "Descripción", "Categoría", "Proveedor", "Cantidad", "Precio unitario", "Total", "Método pago", "Usuario", "Tipo usuario"
    ]],
    body: ventas.map(item => [
      item.id_venta,
      formatearFecha(item.fecha_venta),
      item.primer_nombre ? `${item.primer_nombre} ${item.primer_apellido}` : "Genérico",
      item.cedula,
      item.producto,
      item.descripcion,
      item.categoria,
      item.proveedor,
      item.cantidad_vendida,
      item.precio_unitario,
      item.total_venta,
      item.metodo_pago,
      item.usuario,
      item.tipo_usuario
    ]),
    styles: { fontSize: 8 },
    margin: { top: 16 },
  });
  doc.save("ventas.pdf");
};

  return (
    <div style={{ marginLeft: 220, padding: 20 }}>
      <h2>Consulta de Ventas</h2>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Buscador de productos con select */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <input
            type="text"
            placeholder="Buscar producto por nombre o descripción..."
            value={busquedaProducto}
            onChange={e => setBusquedaProducto(e.target.value)}
            style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc", marginBottom: 4 }}
          />
          <select
            value={filtros.id_producto}
            onChange={e => setFiltros(f => ({ ...f, id_producto: e.target.value }))}
            style={{ minWidth: 220, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="">Todos los productos</option>
            {productos
              .filter(p =>
                (p.nombre + " " + (p.descripcion || ""))
                  .toLowerCase()
                  .includes(busquedaProducto.toLowerCase())
              )
              .map(p => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} {p.descripcion ? `- ${p.descripcion}` : ""}
                </option>
              ))}
          </select>
        </div>
        {/* Categorías de productos */}
        <select
          value={filtros.categoria}
          onChange={e => setFiltros(f => ({ ...f, categoria: e.target.value }))}
          style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {/* Buscador de clientes por cédula o nombre con select */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <input
            type="text"
            placeholder="Buscar cliente por cédula o nombre..."
            value={busquedaCliente}
            onChange={e => setBusquedaCliente(e.target.value)}
            style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc", marginBottom: 4 }}
          />
          <select
            value={filtros.cedula}
            onChange={e => {
              const cedulaSeleccionada = e.target.value;
              setFiltros(f => ({ ...f, cedula: cedulaSeleccionada }));
              const cliente = clientes.find(c => String(c.cedula) === cedulaSeleccionada);
              setClienteNombre(cliente ? `${cliente.primer_nombre} ${cliente.primer_apellido}` : "");
            }}
            style={{ minWidth: 220, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="">Todos los clientes</option>
            {clientes
              .filter(c =>
                c.cedula.toString().includes(busquedaCliente.trim()) ||
                (`${c.primer_nombre} ${c.primer_apellido}`.toLowerCase().includes(busquedaCliente.trim().toLowerCase()))
              )
              .map(c => (
                <option key={c.cedula} value={c.cedula}>
                  {c.primer_nombre} {c.primer_apellido} - {c.cedula}
                </option>
              ))}
          </select>
        </div>
        {/* Select para filtrar por usuario/administrador específico */}
        <select
          value={filtros.id_usuario || ""}
          onChange={e => setFiltros(f => ({ ...f, id_usuario: e.target.value }))}
          style={{ minWidth: 260, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
        >
          <option value="">Todos los usuarios y administradores</option>
          <option value="__solo_usuarios__">Solo usuarios</option>
          <option value="__solo_administradores__">Solo administradores</option>
          {opcionesUsuarios.map(u => (
            <option key={u.tipo + "-" + u.id} value={u.id}>
              {u.nombre} {u.tipo === "administrador" ? "(administrador)" : ""}
            </option>
          ))}
        </select>


        
        {/* Select para filtrar por tipo de usuario
        
        <select
          value={filtros.tipo_usuario}
          onChange={e => setFiltros(f => ({ ...f, tipo_usuario: e.target.value }))}
          style={{ minWidth: 180, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
        >
          <option value="">Todos (Usuario y Administrador)</option>
          <option value="usuario">Solo Usuarios</option>
          <option value="administrador">Solo Administradores</option>
        </select>
        */}
        
        {/* Filtro por fechas */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: 13, marginBottom: 2 }}>Fecha desde:</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
            style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc", marginBottom: 4 }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: 13, marginBottom: 2 }}>Fecha hasta:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
            style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc", marginBottom: 4 }}
          />
        </div>
        {/* Filtro por método de pago */}
        <select
          value={metodoPago}
          onChange={e => setMetodoPago(e.target.value)}
          style={{ minWidth: 180, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
        >
          <option value="">Todos los métodos de pago</option>
          {opcionesMetodoPago.map(metodo => (
            <option key={metodo} value={metodo}>{metodo}</option>
          ))}
        </select>
        {/* Filtro por proveedor */}
        <select
          value={proveedor}
          onChange={e => setProveedor(e.target.value)}
          style={{ minWidth: 180, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
        >
          <option value="">Todos los proveedores</option>
          {opcionesProveedor.map(prov => (
            <option key={prov} value={prov}>{prov}</option>
          ))}
        </select>
        <button
          onClick={handleFiltrar}
          style={{
            padding: "10px 24px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            transition: "background 0.2s, transform 0.2s"
          }}
        >
          Filtrar
        </button>
        <button
          onClick={handleLimpiarFiltros}
          style={{
            padding: "10px 24px",
            background: "#6c757d",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            cursor: "pointer",
            transition: "background 0.2s, transform 0.2s"
          }}
        >
          Limpiar filtros
        </button>
        <button
          onClick={exportarExcel}
          disabled={ventas.length === 0}
          style={{
            padding: "10px 24px",
            background: "#43a047",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            marginLeft: 8,
            cursor: ventas.length === 0 ? "not-allowed" : "pointer",
            opacity: ventas.length === 0 ? 0.6 : 1,
            boxShadow: "0 2px 8px #0002",
            transition: "background 0.2s, transform 0.2s"
          }}
        >
          <span role="img" aria-label="excel" style={{ marginRight: 6 }}>📊</span>
          Exportar Excel
        </button>
        <button
          onClick={exportarPDF}
          disabled={ventas.length === 0}
          style={{
            padding: "10px 24px",
            background: "#e53935",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            marginLeft: 8,
            cursor: ventas.length === 0 ? "not-allowed" : "pointer",
            opacity: ventas.length === 0 ? 0.6 : 1,
            boxShadow: "0 2px 8px #0002",
            transition: "background 0.2s, transform 0.2s"
          }}
        >
          <span role="img" aria-label="pdf" style={{ marginRight: 6 }}>📄</span>
          Exportar PDF
        </button>
      </div>
      <div style={{ marginBottom: 16, fontWeight: "bold" }}>
        Total ventas: {ventas.length}
      </div>
      {mostrarTabla && (
        <div style={{ overflowX: "auto", maxWidth: "100%" }}>
          <table border="1" cellPadding="4" style={{ width: "100%", fontSize: 12, minWidth: 1200 }}>
            <thead style={{ background: "#f5f5f5" }}>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Cédula</th>
                <th>Producto</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Proveedor</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Total</th>
                <th>Método pago</th>
                <th>Usuario</th>
                <th>Tipo usuario</th>
              </tr>
            </thead>
            <tbody>
              {ventas.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: "center", color: "#888" }}>
                    No hay ventas para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                ventas.map((item) => (
                  <tr key={item.id_venta}>
                    <td>{item.id_venta}</td>
                    <td>{item.fecha_venta
            ? new Date(item.fecha_venta.replace(" ", "T")).toLocaleString("es-ES", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              }).replace(",", "")
            : ""}</td>
                    <td>{item.primer_nombre ? `${item.primer_nombre} ${item.primer_apellido}` : "Genérico"}</td>
                    <td>{item.cedula}</td>
                    <td>{item.producto}</td>
                    <td>{item.descripcion}</td>
                    <td>{item.categoria}</td>
                    <td>{item.proveedor}</td>
                    <td>{item.cantidad_vendida}</td>
                    <td>{item.precio_unitario}</td>
                    <td>{item.total_venta}</td>
                    <td>{item.metodo_pago}</td>
                    <td>{item.usuario}</td>
                    <td>{item.tipo_usuario}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Inventario;