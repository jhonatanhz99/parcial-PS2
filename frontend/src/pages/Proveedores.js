import React, { useEffect, useState } from "react";

const emptyForm = {
  nombre_empresa: "",
  nit: "",
  contacto_nombre: "",
  telefono: "",
  email: "",
  direccion: "",
  sitio_web: "",
  tipo_productos: "",
  condiciones_pago: "",
  banco: "",
  numero_cuenta: "",
  tipo_cuenta: "",
  titular_cuenta: "",
  estado: "Activo",
  observaciones: ""
};

function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState(null);

  const fetchProveedores = async () => {
    const res = await fetch("http://localhost:3000/api/proveedores");
    const data = await res.json();
    setProveedores(data);
  };

  useEffect(() => { fetchProveedores(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId
      ? `http://localhost:3000/api/proveedores/${editId}`
      : "http://localhost:3000/api/proveedores";
    const method = editId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ...emptyForm });
    setEditId(null);
    fetchProveedores();
  };

  const handleEdit = (p) => {
    setForm({
      nombre_empresa: p.nombre_empresa || "",
      nit: p.nit || "",
      contacto_nombre: p.contacto_nombre || "",
      telefono: p.telefono || "",
      email: p.email || "",
      direccion: p.direccion || "",
      sitio_web: p.sitio_web || "",
      tipo_productos: p.tipo_productos || "",
      condiciones_pago: p.condiciones_pago || "",
      banco: p.banco || "",
      numero_cuenta: p.numero_cuenta || "",
      tipo_cuenta: p.tipo_cuenta || "",
      titular_cuenta: p.titular_cuenta || "",
      estado: p.estado || "Activo",
      observaciones: p.observaciones || ""
    });
    setEditId(p.id_proveedor);
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3000/api/proveedores/${id}`, { method: "DELETE" });
    fetchProveedores();
  };

  return (
    <div style={{ marginLeft: 220, padding: 20 }}>
      <h2>Proveedores</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <input placeholder="Empresa" value={form.nombre_empresa} onChange={e => setForm({ ...form, nombre_empresa: e.target.value })} required />
        <input placeholder="NIT" value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} required />
        <input placeholder="Contacto" value={form.contacto_nombre} onChange={e => setForm({ ...form, contacto_nombre: e.target.value })} />
        <input placeholder="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} />
        <input placeholder="Sitio Web" value={form.sitio_web} onChange={e => setForm({ ...form, sitio_web: e.target.value })} />
        <input placeholder="Tipo Productos" value={form.tipo_productos} onChange={e => setForm({ ...form, tipo_productos: e.target.value })} />
        <input placeholder="Condiciones Pago" value={form.condiciones_pago} onChange={e => setForm({ ...form, condiciones_pago: e.target.value })} />
        <input placeholder="Banco" value={form.banco} onChange={e => setForm({ ...form, banco: e.target.value })} />
        <input placeholder="N° Cuenta" value={form.numero_cuenta} onChange={e => setForm({ ...form, numero_cuenta: e.target.value })} />
        <select value={form.tipo_cuenta} onChange={e => setForm({ ...form, tipo_cuenta: e.target.value })}>
          <option value="">Tipo Cuenta</option>
          <option value="Corriente">Corriente</option>
          <option value="Ahorros">Ahorros</option>
          <option value="Otro">Otro</option>
        </select>
        <input placeholder="Titular Cuenta" value={form.titular_cuenta} onChange={e => setForm({ ...form, titular_cuenta: e.target.value })} />
        <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
        <input placeholder="Observaciones" value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} />
        <button
          type="submit"
          style={{
            background: editId ? "#ffc107" : "#007bff",
            color: "#fff",
            border: "none",
            padding: "3px 9px",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: "bold",
            marginRight: 8,
            transition: "background 0.2s"
          }}
        >
          {editId ? "Actualizar" : "Agregar"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => { setEditId(null); setForm({ ...emptyForm }); }}
            style={{
              background: "#6c757d",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
              fontWeight: "bold",
              marginLeft: 8,
              transition: "background 0.2s"
            }}
          >
            Cancelar
          </button>
        )}
      </form>
      <div style={{ overflowX: "auto", maxWidth: "100%" }}>
        <table
          border="1"
          cellPadding="4"
          style={{
            marginTop: 20,
            width: "100%",
            fontSize: 12,
            minWidth: 900,
            borderCollapse: "collapse",
            tableLayout: "auto",
          }}
        >
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th>ID</th>
              <th>Empresa</th>
              <th>NIT</th>
              <th>Contacto</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Dirección</th>
              <th>Sitio Web</th>
              <th>Tipo Productos</th>
              <th>Condiciones Pago</th>
              <th>Banco</th>
              <th>N° Cuenta</th>
              <th>Tipo Cuenta</th>
              <th>Titular Cuenta</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.length === 0 ? (
              <tr>
                <td colSpan={18} style={{ textAlign: "center", color: "#888" }}>
                  No hay proveedores registrados.
                </td>
              </tr>
            ) : (
              proveedores.map((p) => (
                <tr key={p.id_proveedor}>
                  <td>{p.id_proveedor}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.nombre_empresa}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.nit}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.contacto_nombre}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.telefono}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.email}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.direccion}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.sitio_web}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.tipo_productos}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.condiciones_pago}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.banco}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.numero_cuenta}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.tipo_cuenta}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.titular_cuenta}</td>
                  <td>{p.estado}</td>
                  <td>{p.fecha_registro ? p.fecha_registro.substring(0, 10) : ""}</td>
                  <td style={{ wordBreak: "break-word" }}>{p.observaciones}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(p)}
                      style={{
                        background: "#ffc107",
                        color: "#212529",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginRight: 4,
                        transition: "background 0.2s"
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(p.id_proveedor)}
                      style={{
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontWeight: "bold",
                        marginLeft: 4,
                        transition: "background 0.2s"
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Proveedores;