import React, { useEffect, useState } from "react";

function Productos() {
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    categoria: "",
    precio_compra: "",
    precio_venta: "",
    stock: "",
    id_proveedor: "",
    fecha_vencimiento: "",
  });
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Trae productos de la tabla productos
  const fetchProductos = async () => {
    const res = await fetch("http://localhost:3000/api/productos");
    const data = await res.json();
    setProductos(data);
  };

  // Trae proveedores
  const fetchProveedores = async () => {
    const res = await fetch("http://localhost:3000/api/proveedores");
    const data = await res.json();
    setProveedores(data);
  };

  useEffect(() => {
    fetchProductos();
    fetchProveedores();
  }, []);

  // Agregar o actualizar producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.id_proveedor) {
      setError("Primero tienes que añadir un proveedor");
      return;
    }
    setError("");
    const url = editId
      ? `http://localhost:3000/api/productos/${editId}`
      : "http://localhost:3000/api/productos";
    const method = editId ? "PUT" : "POST";
    const body = { ...form };
    // Si el campo está vacío, mándalo como null
    if (!body.fecha_vencimiento) body.fecha_vencimiento = null;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setForm({
      nombre: "",
      descripcion: "",
      categoria: "",
      precio_compra: "",
      precio_venta: "",
      stock: "",
      id_proveedor: "",
      fecha_vencimiento: "",
    });
    setEditId(null);
    await fetchProductos();
  };

  // Editar producto
  const handleEdit = (p) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
      return dateStr.substring(0, 10);
    };
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion,
      categoria: p.categoria,
      precio_compra: p.precio_compra,
      precio_venta: p.precio_venta,
      stock: p.stock,
      id_proveedor: p.id_proveedor ? String(p.id_proveedor) : "",
      fecha_vencimiento: formatDate(p.fecha_vencimiento),
    });
    setEditId(p.id_producto);
  };

  // Eliminar producto
  const handleDelete = async (id) => {
    setError("");
    setMessage("");

    // Buscar detalles de ventas y revisar si hay ventas asociadas a este producto
    try {
      const detallesRes = await fetch(`http://localhost:3000/api/detalle_ventas/producto/${id}`);
      if (!detallesRes.ok) {
        const errText = await detallesRes.text().catch(() => "");
        throw new Error(`Error al consultar ventas del producto: ${detallesRes.status} ${errText}`);
      }
      const detalles = await detallesRes.json();
      const tieneVenta = detalles.total && Number(detalles.total) > 0;

      if (tieneVenta) {
        // Si tiene ventas, no se permite eliminar. Preguntar al usuario si desea dejar stock en 0
        const confirmar = window.confirm(
          "Este producto tiene ventas asociadas y no puede ser eliminado. ¿Deseas establecer su stock a 0 en su lugar?"
        );
        if (!confirmar) return;

        // Obtener producto actual desde el state para no sobrescribir campos
        const producto = productos.find(p => String(p.id_producto) === String(id));
        if (!producto) {
          setError("No se encontró el producto para actualizar el stock.");
          return;
        }

        const body = {
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          categoria: producto.categoria,
          precio_compra: producto.precio_compra,
          precio_venta: producto.precio_venta,
          stock: 0,
          id_proveedor: producto.id_proveedor,
          fecha_vencimiento: producto.fecha_vencimiento,
        };

        await fetch(`http://localhost:3000/api/productos/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        setMessage("El producto tiene ventas asociadas: se actualizó el stock a 0 en lugar de eliminarlo.");
        await fetchProductos();
        return;
      }

      // Si no tiene ventas, se puede eliminar normalmente (pedir confirmación)
      const confirmarEliminar = window.confirm("¿Estás seguro de eliminar este producto?");
      if (!confirmarEliminar) return;

      const delRes = await fetch(`http://localhost:3000/api/productos/${id}`, { method: "DELETE" });
      if (!delRes.ok) {
        const data = await delRes.json().catch(() => ({}));
        setError(data.error || `Error al eliminar (status ${delRes.status})`);
        return;
      }
      setMessage("Producto eliminado correctamente.");
      await fetchProductos();
    } catch (err) {
      setError("Error al procesar la solicitud: " + (err.message || err));
    }
  };

  // Mostrar nombre del proveedor en la tabla
  const getProveedorNombre = (id) => {
    const prov = proveedores.find((p) => String(p.id_proveedor) === String(id));
    return prov ? prov.nombre_empresa : "";
  };

  return (
    <div style={{ marginLeft: 220, padding: 20 }}>
      <h1>PRODUCTOS</h1>
      {proveedores.length === 0 && (
        <div style={{ color: "red", marginBottom: 10 }}>
          Primero tienes que añadir un proveedor
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required disabled={proveedores.length === 0} />
        <input placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} required disabled={proveedores.length === 0} />
        <input placeholder="Categoría" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} required disabled={proveedores.length === 0} />
        <input placeholder="Precio de compra" type="number" value={form.precio_compra} onChange={e => setForm({ ...form, precio_compra: e.target.value })} required disabled={proveedores.length === 0} />
        <input placeholder="Precio de venta" type="number" value={form.precio_venta} onChange={e => setForm({ ...form, precio_venta: e.target.value })} required disabled={proveedores.length === 0} />
        <input placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required disabled={proveedores.length === 0} />
        <input
          placeholder="Fecha de vencimiento (opcional)"
          type="date"
          value={form.fecha_vencimiento}
          onChange={e => setForm({ ...form, fecha_vencimiento: e.target.value })}
          disabled={proveedores.length === 0}
        />
        <select
          value={form.id_proveedor}
          onChange={e => setForm({ ...form, id_proveedor: e.target.value })}
          required
          disabled={proveedores.length === 0}
        >
          <option value="">Selecciona un proveedor</option>
          {proveedores.map((prov) => (
            <option key={prov.id_proveedor} value={prov.id_proveedor}>
              {prov.nombre_empresa}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={proveedores.length === 0}
          style={{
            background: editId ? "#ffc107" : "#007bff",
            color: "#fff",
            border: "none",
            padding: "3px 9px",
            borderRadius: 4,
            cursor: proveedores.length === 0 ? "not-allowed" : "pointer",
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
            onClick={() => {
              setEditId(null);
              setForm({
                nombre: "",
                descripcion: "",
                categoria: "",
                precio_compra: "",
                precio_venta: "",
                stock: "",
                id_proveedor: "",
                fecha_vencimiento: "",
              });
            }}
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
  {message && <div style={{ color: "#0a6a0a", background: "#e6f4ea", padding: 8, borderRadius: 4, marginBottom: 10 }}>{message}</div>}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre del producto</th>
            <th>Descripción, peso o unidades</th>
            <th>Categoría</th>
            <th>Precio compra</th>
            <th>Precio venta</th>
            <th>Stock</th>
            <th>Proveedor</th>
            <th>Fecha añadido</th>
            <th>Fecha de caducidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id_producto}>
              <td>{p.id_producto}</td>
              <td>{p.nombre}</td>
              <td>{p.descripcion}</td>
              <td>{p.categoria}</td>
              <td>{p.precio_compra}</td>
              <td>{p.precio_venta}</td>
              <td>{p.stock}</td>
              <td>{getProveedorNombre(p.id_proveedor)}</td>
              <td>{p.fecha_creacion ? p.fecha_creacion.substring(0, 10) : ""}</td>
              <td>{p.fecha_vencimiento ? p.fecha_vencimiento.substring(0, 10) : ""}</td>
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
                  onClick={() => handleDelete(p.id_producto)}
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

export default Productos;