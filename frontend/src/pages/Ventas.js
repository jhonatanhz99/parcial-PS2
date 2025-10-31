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
    metodo_pago: "Efectivo",
    id_usuario: "",
    tipo_usuario: "usuario"
  });
  const [cartItems, setCartItems] = useState([
    { id_producto: "", cantidad: 1, precio_unitario: 0, buscar: "" }
  ]);
  const [mostrarStock, setMostrarStock] = useState(false);
  const [ultimaVenta, setUltimaVenta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

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

  const opcionesUsuarios = [
    ...usuarios.map(u => ({ id: u.id_usuario, nombre: u.nombre_usuario, tipo: "usuario" })),
    ...administradores.map(a => ({ id: a.id, nombre: a.usuario, tipo: "administrador" }))
  ];

  const addItem = () => {
    setCartItems(prev => [...prev, { id_producto: "", cantidad: 1, precio_unitario: 0 }]);
  };

  const removeItem = (index) => {
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    setCartItems(prev => {
      const copy = [...prev];
      // normalizar para cantidad/precio como números cuando se usan
      if (field === 'cantidad') value = value === '' ? '' : Number(value);
      if (field === 'precio_unitario') value = value === '' ? '' : Number(value);
      copy[index] = { ...copy[index], [field]: value };
      // Si se seleccionó producto, autocompletar precio
      if (field === 'id_producto') {
        const prod = productos.find(p => p.id_producto === Number(value));
        if (prod) copy[index].precio_unitario = prod.precio_venta || 0;
      }
      return copy;
    });
  };

  const totalVenta = cartItems.reduce((s, it) => s + (Number(it.cantidad || 0) * Number(it.precio_unitario || 0)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const adminDefault = administradores[0];
    const usuarioSeleccionado = form.id_usuario || (adminDefault ? adminDefault.id : "");

    // Preparar payload
    // Validaciones cliente-side
    for (let i = 0; i < cartItems.length; i++) {
      const it = cartItems[i];
      if (!it.id_producto) {
        alert(`Seleccione un producto en la fila ${i + 1}`);
        return;
      }
      if (!it.cantidad || Number(it.cantidad) <= 0) {
        alert(`Cantidad inválida en la fila ${i + 1}`);
        return;
      }
    }

    const payload = {
      id_cliente: form.id_cliente === "" ? null : form.id_cliente,
      metodo_pago: form.metodo_pago,
      id_usuario: usuarioSeleccionado,
      tipo_usuario: form.tipo_usuario || "usuario",
      items: cartItems.map(it => ({ id_producto: Number(it.id_producto), cantidad: Number(it.cantidad), precio_unitario: Number(it.precio_unitario) }))
    };

    setLoading(true);
    setServerError(null);
    let ventaCreada = null;
    try {
      const ventaRes = await fetch("http://localhost:3000/api/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await ventaRes.json();
      if (!ventaRes.ok) {
        setServerError(json.error || 'Error al registrar la venta');
        setLoading(false);
        return;
      }
      // Si el backend devuelve id_venta, pedir la venta completa con detalles
      if (json.id_venta) {
        try {
          const r = await fetch(`http://localhost:3000/api/ventas/${json.id_venta}`);
          if (r.ok) {
            const full = await r.json();
            setUltimaVenta(full);
          } else {
            setUltimaVenta(json);
          }
        } catch (e) {
          setUltimaVenta(json);
        }
      } else {
        setUltimaVenta(json);
      }
    } catch (err) {
      console.error(err);
      setServerError('Respuesta inválida del servidor');
      setUltimaVenta(null);
      setLoading(false);
      return;
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

    // reset
    setForm({ id_cliente: "", metodo_pago: "Efectivo", id_usuario: "", tipo_usuario: "usuario" });
    setCartItems([{ id_producto: "", cantidad: 1, precio_unitario: 0, buscar: "" }]);
    setLoading(false);
  };

  const exportarExcel = () => {
    if (!ultimaVenta) return;
    const rows = (ultimaVenta.items || []).map(it => ({
      ID: ultimaVenta.id_venta,
      Producto: productos.find(p => p.id_producto === Number(it.id_producto))?.nombre || it.id_producto,
      Cantidad: it.cantidad,
      'Precio unitario': it.precio_unitario,
      Subtotal: it.cantidad * it.precio_unitario
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Venta");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `venta_${ultimaVenta.id_venta || 'nuevo'}.xlsx`);
  };

  const exportarPDF = () => {
    if (!ultimaVenta) return;
    const doc = new jsPDF({ orientation: "landscape" });
    doc.text("Venta registrada", 14, 10);
    const head = [["Producto", "Cantidad", "Precio unitario", "Subtotal"]];
    const body = (ultimaVenta.items || []).map(it => [
      productos.find(p => p.id_producto === Number(it.id_producto))?.nombre || it.id_producto,
      it.cantidad,
      it.precio_unitario,
      it.cantidad * it.precio_unitario
    ]);
    autoTable(doc, { head, body, margin: { top: 16 } });
    doc.save(`venta_${ultimaVenta.id_venta || 'nuevo'}.pdf`);
  };

  return (
    <div style={{ marginLeft: 220, padding: 20 }}>
      <h2>Registrar Venta</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={form.id_cliente} onChange={e => setForm(f => ({ ...f, id_cliente: e.target.value }))}>
            <option value="">Cliente Genérico</option>
            {clientes.map(c => (
              <option key={c.id_cliente} value={c.id_cliente}>{c.primer_nombre} {c.primer_apellido}</option>
            ))}
          </select>

          <select value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value }))}>
            <option value="Efectivo">Efectivo</option>
            <option value="Tarjeta">Tarjeta</option>
            <option value="Transferencia">Transferencia</option>
          </select>

          <select value={form.id_usuario} onChange={e => {
            const selected = opcionesUsuarios.find(u => u.id.toString() === e.target.value);
            setForm(f => ({ ...f, id_usuario: selected ? selected.id : '', tipo_usuario: selected ? selected.tipo : 'usuario' }));
          }} required>
            <option value="">Usuario/Administrador</option>
            {opcionesUsuarios.map(u => (
              <option key={u.tipo + '-' + u.id} value={u.id}>{u.nombre} ({u.tipo})</option>
            ))}
          </select>

          <button type="button" onClick={addItem} style={{ padding: 8 }}>Añadir producto</button>
          <button type="submit" disabled={loading} style={{ padding: 10, background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, opacity: loading ? 0.6 : 1 }}>{loading ? 'Registrando...' : 'Registrar'}</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((it, idx) => (
                <tr key={idx}>
                  <td>
                    <input type="text" placeholder="Buscar producto..." value={it.buscar || ''} onChange={e => updateItem(idx, 'buscar', e.target.value)} style={{ marginBottom: 4 }} />
                    <select value={it.id_producto} onChange={e => updateItem(idx, 'id_producto', e.target.value)}>
                      <option value="">Producto</option>
                      {productos.filter(p => (p.nombre + ' ' + p.descripcion).toLowerCase().includes((it.buscar || '').toLowerCase())).map(p => (
                        <option key={p.id_producto} value={p.id_producto}>{p.nombre} - {p.descripcion}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="number" min="1" value={it.cantidad} onChange={e => updateItem(idx, 'cantidad', e.target.value)} />
                  </td>
                  <td>
                    <input type="number" value={it.precio_unitario} onChange={e => updateItem(idx, 'precio_unitario', e.target.value)} />
                  </td>
                  <td>{(Number(it.cantidad) * Number(it.precio_unitario)).toFixed(2)}</td>
                  <td>
                    <button type="button" onClick={() => removeItem(idx)}>Quitar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 12, textAlign: 'right', fontWeight: 'bold' }}>
            Total: {totalVenta.toFixed(2)}
          </div>
        </div>
      </form>

      <div style={{ marginBottom: 16 }}>
        <button onClick={exportarExcel} disabled={!ultimaVenta} style={{ padding: '10px 24px', marginRight: 8 }}>Exportar Excel</button>
        <button onClick={exportarPDF} disabled={!ultimaVenta} style={{ padding: '10px 24px' }}>Exportar PDF</button>
        <button onClick={() => setMostrarStock(v => !v)} style={{ padding: '10px 24px', marginLeft: 8 }}>{mostrarStock ? 'Ocultar Stock' : 'Mostrar Stock'}</button>
      </div>

      {serverError && (
        <div style={{ color: 'red', marginBottom: 12 }}>
          {serverError}
        </div>
      )}

      {/* Mostrar factura/última venta con detalle */}
      {ultimaVenta && (
        <div style={{ marginTop: 16, padding: 12, border: '1px solid #eee', background: '#fafafa' }}>
          <h3>Venta registrada: {ultimaVenta.venta ? ultimaVenta.venta.id_venta : (ultimaVenta.id_venta || '')}</h3>
          <div>Cliente: {ultimaVenta.venta ? (ultimaVenta.venta.primer_nombre ? `${ultimaVenta.venta.primer_nombre} ${ultimaVenta.venta.primer_apellido}` : 'Genérico') : (ultimaVenta.primer_nombre ? `${ultimaVenta.primer_nombre} ${ultimaVenta.primer_apellido}` : 'Genérico')}</div>
          <table border="1" cellPadding="6" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio unitario</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(
                ultimaVenta.items || ultimaVenta.ventaItems || ultimaVenta.ventas || []
              ).map((it, i) => {
                // it puede ser {id_producto,cantidad,precio_unitario,nombre,...} según respuesta
                const item = it;
                const nombre = (item.nombre) ? item.nombre : (productos.find(p => p.id_producto === Number(item.id_producto))?.nombre || item.id_producto);
                const cantidad = item.cantidad || item.cantidad_vendida || item.cantidad_vendida === 0 ? (item.cantidad || item.cantidad_vendida) : '';
                const precio = item.precio_unitario || item.precio_unitario === 0 ? item.precio_unitario : '';
                return (
                  <tr key={i}>
                    <td>{nombre}</td>
                    <td>{cantidad}</td>
                    <td>{precio}</td>
                    <td>{(Number(cantidad) * Number(precio) || 0).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', fontWeight: 'bold', marginTop: 8 }}>
            Total: {(() => {
              if (ultimaVenta.venta && ultimaVenta.venta.total_venta !== undefined) return Number(ultimaVenta.venta.total_venta).toFixed(2);
              if (ultimaVenta.total_venta !== undefined) return Number(ultimaVenta.total_venta).toFixed(2);
              // calcular sumatoria
              const rows = ultimaVenta.items || ultimaVenta.ventas || [];
              const sum = rows.reduce((s, it) => s + (Number(it.subtotal || (it.cantidad * it.precio_unitario) || (it.cantidad_vendida * it.precio_unitario)) || 0), 0);
              return sum.toFixed(2);
            })()}
          </div>
        </div>
      )}

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
