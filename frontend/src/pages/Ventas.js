import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [administradores, setAdministradores] = useState([]);
  const [form, setForm] = useState({
    id_cliente: "",
    id_producto: "",
    cantidad_vendida: 1,
    precio_unitario: "",
    metodo_pago: "Efectivo",
    id_usuario: ""
  });
  const [descripcionProducto, setDescripcionProducto] = useState("");
  const [totalVenta, setTotalVenta] = useState(0);
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [mostrarStock, setMostrarStock] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState(null);

  // Cargar datos
  useEffect(() => {
    fetch("http://localhost:3000/api/ventas")
      .then(res => res.json())
      .then(data => setVentas(Array.isArray(data) ? data : []))
      .catch(() => setVentas([]));
    fetch("http://localhost:3000/api/clientes")
      .then(res => res.json())
      .then(data => setClientes(Array.isArray(data) ? data : []))
      .catch(() => setClientes([]));
    fetch("http://localhost:3000/api/productos")
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
    fetch("http://localhost:3000/api/usuarios")
      .then(res => res.json())
      .then(data => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => setUsuarios([]));
    fetch("http://localhost:3000/api/administradores")
      .then(res => res.json())
      .then(data => setAdministradores(Array.isArray(data) ? data : []))
      .catch(() => setAdministradores([]));
  }, []);

  // Actualizar descripción y precio unitario al seleccionar producto
  useEffect(() => {
    const prod = productos.find(p => p.id_producto === Number(form.id_producto));
    if (prod) {
      setDescripcionProducto(prod.descripcion || "");
      setForm(f => ({
        ...f,
        precio_unitario: prod.precio_venta
      }));
    } else {
      setDescripcionProducto("");
      setForm(f => ({
        ...f,
        precio_unitario: ""
      }));
    }
  }, [form.id_producto, productos]);

  // Actualizar total al cambiar cantidad o precio unitario
  useEffect(() => {
    const cantidad = Number(form.cantidad_vendida) || 0;
    const precio = Number(form.precio_unitario) || 0;
    setTotalVenta(cantidad * precio);
  }, [form.cantidad_vendida, form.precio_unitario]);

  // Unir usuarios y administradores para el select
  const opcionesUsuarios = [
    ...usuarios.map(u => ({
      id: u.id_usuario,
      nombre: u.nombre_usuario,
      tipo: "usuario"
    })),
    ...administradores.map(a => ({
      id: a.id,
      nombre: a.usuario,
      tipo: "administrador"
    }))
  ];

  // Registrar venta y refrescar productos/ventas
  const handleSubmit = async (e) => {
    e.preventDefault();
    const adminDefault = administradores[0];
    const usuarioSeleccionado = form.id_usuario || (adminDefault ? adminDefault.id : "");

    const ventaData = {
      ...form,
      cantidad_vendida: Number(form.cantidad_vendida), // <-- asegúrate que es número
      id_usuario: usuarioSeleccionado,
      id_cliente: form.id_cliente === "" ? null : form.id_cliente
    };

    // Registrar venta
    const ventaRes = await fetch("http://localhost:3000/api/ventas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ventaData),
    });
    let ventaCreada = null;
    try {
      ventaCreada = await ventaRes.json();
      setUltimaVenta(ventaCreada);
    } catch {
      setUltimaVenta(null);
    }

    // Refrescar productos y ventas
    fetch("http://localhost:3000/api/productos")
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data) ? data : []))
      .catch(() => setProductos([]));
    fetch("http://localhost:3000/api/ventas")
      .then(res => res.json())
      .then(data => setVentas(Array.isArray(data) ? data : []))
      .catch(() => setVentas([]));

    setForm({
      id_cliente: "",
      id_producto: "",
      cantidad_vendida: 1,
      precio_unitario: "",
      metodo_pago: "Efectivo",
      id_usuario: ""
    });
    setDescripcionProducto("");
    setTotalVenta(0);
  };

  // Exportar a Excel solo la última venta
  const exportarExcel = () => {
    if (!ultimaVenta) return;
    const ws = XLSX.utils.json_to_sheet([{
      "ID": ultimaVenta.id_venta,
      "Fecha": ultimaVenta.fecha_venta?.substring(0, 19).replace("T", " "),
      "Cliente": ultimaVenta.primer_nombre ? `${ultimaVenta.primer_nombre} ${ultimaVenta.primer_apellido}` : "Genérico",
      "Producto": ultimaVenta.producto,
      "Cantidad": ultimaVenta.cantidad_vendida,
      "Precio unitario": ultimaVenta.precio_unitario,
      "Total": ultimaVenta.total_venta,
      "Método pago": ultimaVenta.metodo_pago,
      "Usuario": ultimaVenta.usuario
    }]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Venta");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "venta.xlsx");
  };

  // Exportar a PDF solo la última venta
  const exportarPDF = () => {
    if (!ultimaVenta) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Venta registrada", 14, 10);
    autoTable(doc, {
      head: [[
        "ID", "Fecha", "Cliente", "Producto", "Cantidad", "Precio unitario", "Total", "Método pago", "Usuario"
      ]],
      body: [[
        ultimaVenta.id_venta,
        ultimaVenta.fecha_venta?.substring(0, 19).replace("T", " "),
        ultimaVenta.primer_nombre ? `${ultimaVenta.primer_nombre} ${ultimaVenta.primer_apellido}` : "Genérico",
        ultimaVenta.producto,
        ultimaVenta.cantidad_vendida,
        ultimaVenta.precio_unitario,
        ultimaVenta.total_venta,
        ultimaVenta.metodo_pago,
        ultimaVenta.usuario
      ]],
      styles: { fontSize: 8 },
      margin: { top: 16 },
    });
    doc.save("venta.pdf");
  };

  return (
    <div style={{ marginLeft: 220, padding: 20 }}>
      <h2>Registrar Venta</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <select
          value={form.id_cliente}
          onChange={e => setForm(f => ({ ...f, id_cliente: e.target.value }))}
          style={{ cursor: "pointer" }}
        >
          <option value="">Cliente Genérico</option>
          {clientes.map(c => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.primer_nombre} {c.primer_apellido}
            </option>
          ))}
        </select>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <input
            type="text"
            placeholder="Buscar producto..."
            value={busquedaProducto}
            onChange={e => setBusquedaProducto(e.target.value)}
            style={{
              marginBottom: 4,
              padding: 6,
              borderRadius: 4,
              border: "1px solid #ccc",
              cursor: "text"
            }}
          />
          <select
            value={form.id_producto}
            onChange={e => setForm(f => ({ ...f, id_producto: e.target.value }))}
            style={{ cursor: "pointer" }}
          >
            <option value="">Producto</option>
            {productos
              .filter(p =>
                (p.nombre + " " + p.descripcion)
                  .toLowerCase()
                  .includes(busquedaProducto.toLowerCase())
              )
              .map(p => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} - {p.descripcion}
                </option>
              ))}
          </select>
          {descripcionProducto && (
            <span style={{
              fontSize: 13,
              color: "#007bff",
              marginTop: 2,
              maxWidth: 200,
              whiteSpace: "pre-line"
            }}>
              {descripcionProducto}
            </span>
          )}
        </div>
        <input
          type="number"
          placeholder="Cantidad"
          value={form.cantidad_vendida}
          min="1"
          onChange={e => setForm(f => ({ ...f, cantidad_vendida: e.target.value }))}
          required
          style={{ cursor: "text" }}
        />
        <input
          type="number"
          placeholder="Precio unitario"
          value={form.precio_unitario}
          onChange={e => setForm(f => ({ ...f, precio_unitario: e.target.value }))}
          required
          style={{ cursor: "text" }}
        />
        <input
          type="number"
          placeholder="Total"
          value={totalVenta}
          readOnly
          style={{ background: "#f0f0f0", fontWeight: "bold", cursor: "text" }}
        />
        <select
          value={form.metodo_pago}
          onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value }))}
          style={{ cursor: "pointer" }}
        >
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
        </select>
        <select
          value={form.id_usuario}
          onChange={e => {
            const selected = opcionesUsuarios.find(u => u.id.toString() === e.target.value);
            setForm(f => ({
              ...f,
              id_usuario: selected ? selected.id : "",
              tipo_usuario: selected ? selected.tipo : "usuario"
            }));
          }}
          required
          style={{ cursor: "pointer" }}
        >
          <option value="">Usuario/Administrador</option>
          {opcionesUsuarios.map(u => (
            <option key={u.tipo + "-" + u.id} value={u.id}>
              {u.nombre} ({u.tipo})
            </option>
          ))}
        </select>
        <button
          type="submit"
          style={{
            padding: "12px 28px",
            background: "linear-gradient(90deg, #007bff 0%, #00e1ff 100%)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 18,
            boxShadow: "0 2px 8px #0002",
            cursor: "pointer",
            transition: "background 0.2s, transform 0.2s",
            marginTop: 4
          }}
          onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
          onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
        >
          Registrar
        </button>
      </form>
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={exportarExcel}
          disabled={!ultimaVenta}
          style={{
            padding: "10px 24px",
            background: "#43a047",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            marginRight: 8,
            cursor: !ultimaVenta ? "not-allowed" : "pointer",
            opacity: !ultimaVenta ? 0.6 : 1,
            transition: "background 0.2s, transform 0.2s"
          }}
        >
          Exportar Excel
        </button>
        <button
          onClick={exportarPDF}
          disabled={!ultimaVenta}
          style={{
            padding: "10px 24px",
            background: "#e53935",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            cursor: !ultimaVenta ? "not-allowed" : "pointer",
            opacity: !ultimaVenta ? 0.6 : 1,
            transition: "background 0.2s, transform 0.2s"
          }}
        >
          Exportar PDF
        </button>
        <button
          onClick={() => setMostrarStock(v => !v)}
          style={{
            padding: "10px 24px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: "bold",
            fontSize: 16,
            marginLeft: 8,
            cursor: "pointer",
            transition: "background 0.2s, transform 0.2s"
          }}
        >
          {mostrarStock ? "Ocultar Stock" : "Mostrar Stock"}
        </button>
      </div>
      {mostrarStock && (
        <div style={{ marginBottom: 24 }}>
          <h3>Stock de Productos</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Stock</th>
                <th>Precio Venta</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id_producto}>
                  <td>{p.id_producto}</td>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.stock}</td>
                  <td>{p.precio_venta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Total</th>
            <th>Método pago</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map(v => (
            <tr key={v.id_venta}>
              <td>{v.id_venta}</td>
              <td>
  {v.fecha_venta
    ? new Date(v.fecha_venta.replace(" ", "T")).toLocaleString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).replace(",", "")
    : ""}
</td>
              <td>{v.primer_nombre ? `${v.primer_nombre} ${v.primer_apellido}` : "Genérico"}</td>
              <td>
                {v.producto}
                {v.descripcion ? <span style={{ color: "#888", fontSize: 13 }}><br />{v.descripcion}</span> : null}
              </td>
              <td>{v.cantidad_vendida}</td>
              <td>{v.precio_unitario}</td>
              <td>{v.total_venta}</td>
              <td>{v.metodo_pago}</td>
              <td>{v.usuario}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ventas;
