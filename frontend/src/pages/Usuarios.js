import React, { useEffect, useState } from "react";

function Usuarios({ usuarioActual }) {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre_usuario: "", email: "", contraseña: "" });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const fetchUsuarios = async () => {
    const res = await fetch("http://localhost:3000/api/usuarios");
    const data = await res.json();
    setUsuarios(data);
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    const url = editId ? `http://localhost:3000/api/usuarios/${editId}` : "http://localhost:3000/api/usuarios";
    const method = editId ? "PUT" : "POST";
    const body = editId
      ? form
      : { ...form, rol: "usuario", creado_por: usuarioActual.id };
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        if (data && data.message && data.message.includes("Duplicate entry")) {
          setMensaje("El correo ya está registrado.");
        } else {
          setMensaje("Error al guardar el usuario.");
        }
        return;
      }
      setForm({ nombre_usuario: "", email: "", contraseña: "" });
      setEditId(null);
      setMensaje("");
      fetchUsuarios();
    } catch {
      setMensaje("Error de conexión.");
    }
  };

  const handleEdit = (u) => {
    setForm({ nombre_usuario: u.nombre_usuario, email: u.email, contraseña: "" });
    setEditId(u.id || u.id_usuario);
    setMensaje("");
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:3000/api/usuarios/${id}`, { method: "DELETE" });
    fetchUsuarios();
    setMensaje("");
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ nombre_usuario: "", email: "", contraseña: "" });
    setMensaje("");
  };

  return (
    <div style={{ marginLeft: 220, padding: 20 }}>
      <h2>Usuarios</h2>
      {usuarioActual?.rol === "admin" && (
        <form onSubmit={handleSubmit}>
          <input
            placeholder="Nombre"
            value={form.nombre_usuario}
            onChange={e => setForm({ ...form, nombre_usuario: e.target.value })}
            required
          />
          <input
            placeholder="Correo"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={form.contraseña}
            onChange={e => setForm({ ...form, contraseña: e.target.value })}
            required
          />
          <button
            type="submit"
            style={{
              background: editId ? "#ffc107" : "#007bff",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
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
          {mensaje && (
            <div style={{ color: "#dc3545", marginTop: 10, fontWeight: "bold" }}>
              {mensaje}
            </div>
          )}
        </form>
      )}
      <table border="1" cellPadding="8" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", color: "#888" }}>
                No hay usuarios registrados.
              </td>
            </tr>
          ) : (
            usuarios.map(u => (
              <tr key={u.id || u.id_usuario}>
                <td>{u.id || u.id_usuario}</td>
                <td>{u.nombre_usuario}</td>
                <td>{u.email}</td>
                <td>
                  {usuarioActual?.rol === "admin" && (
                    <>
                      <button
                        onClick={() => handleEdit(u)}
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
                        onClick={() => handleDelete(u.id || u.id_usuario)}
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
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Usuarios;
