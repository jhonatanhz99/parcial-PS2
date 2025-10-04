import React, { useEffect, useState } from "react";

function Clientes() {
  const emptyForm = {
    cedula: "",
    primer_nombre: "",
    segundo_nombre: "",
    primer_apellido: "",
    segundo_apellido: "",
    telefono: "",
    direccion: "",
    email: "",
  };

  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  // Traer clientes
  const fetchClientes = async () => {
    const res = await fetch("http://localhost:3000/api/clientes");
    const data = await res.json();
    setClientes(data);
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Agregar o actualizar cliente
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (
      !form.cedula ||
      !form.primer_nombre ||
      !form.primer_apellido ||
      !form.telefono ||
      !form.direccion ||
      !form.email
    ) {
      setError("Todos los campos obligatorios deben estar completos.");
      return;
    }
    const url = editId
      ? `http://localhost:3000/api/clientes/${editId}`
      : "http://localhost:3000/api/clientes";
    const method = editId ? "PUT" : "POST";
    const body = { ...form };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al guardar el cliente");
        return;
      }
      setForm({ ...emptyForm });
      setEditId(null);
      fetchClientes();
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  // Editar cliente
  const handleEdit = (c) => {
    setForm({
      cedula: c.cedula || "",
      primer_nombre: c.primer_nombre || "",
      segundo_nombre: c.segundo_nombre || "",
      primer_apellido: c.primer_apellido || "",
      segundo_apellido: c.segundo_apellido || "",
      telefono: c.telefono || "",
      direccion: c.direccion || "",
      email: c.email || "",
    });
    setEditId(c.id_cliente);
  };

  // Eliminar cliente
  const handleDelete = async (id_cliente) => {
    if (!window.confirm("¿Seguro que deseas eliminar este cliente?")) return;
    setError(""); // Limpia errores anteriores
    try {
      const res = await fetch(`http://localhost:3000/api/clientes/${id_cliente}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        // Muestra el mensaje del backend (por ejemplo, ventas asociadas)
        setError(data.mensaje || data.error || "Error al eliminar el cliente.");
        return;
      }
      fetchClientes();
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setError("");
  };

  return (
    <div style={{ marginLeft: 220, padding: 20, height: "100vh", overflow: "auto" }}>
      <h1>CLIENTES</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input
          placeholder="Cédula"
          value={form.cedula}
          onChange={e => setForm({ ...form, cedula: e.target.value })}
          required
        />
        <input
          placeholder="Primer Nombre"
          value={form.primer_nombre}
          onChange={e => setForm({ ...form, primer_nombre: e.target.value })}
          required
        />
        <input
          placeholder="Segundo Nombre"
          value={form.segundo_nombre}
          onChange={e => setForm({ ...form, segundo_nombre: e.target.value })}
        />
        <input
          placeholder="Primer Apellido"
          value={form.primer_apellido}
          onChange={e => setForm({ ...form, primer_apellido: e.target.value })}
          required
        />
        <input
          placeholder="Segundo Apellido"
          value={form.segundo_apellido}
          onChange={e => setForm({ ...form, segundo_apellido: e.target.value })}
        />
        <input
          placeholder="Teléfono"
          value={form.telefono}
          onChange={e => setForm({ ...form, telefono: e.target.value })}
          required
        />
        <input
          placeholder="Dirección"
          value={form.direccion}
          onChange={e => setForm({ ...form, direccion: e.target.value })}
          required
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          required
        />
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
            onClick={handleCancel}
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
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cédula</th>
            <th>Nombres</th>
            <th>Apellidos</th>
            <th>Teléfono</th>
            <th>Dirección</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id_cliente}>
              <td>{c.id_cliente}</td>
              <td>{c.cedula}</td>
              <td>{c.primer_nombre} {c.segundo_nombre}</td>
              <td>{c.primer_apellido} {c.segundo_apellido}</td>
              <td>{c.telefono}</td>
              <td>{c.direccion}</td>
              <td>{c.email}</td>
              <td>
                <button
                  onClick={() => handleEdit(c)}
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
                  onClick={() => handleDelete(c.id_cliente)}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Clientes;