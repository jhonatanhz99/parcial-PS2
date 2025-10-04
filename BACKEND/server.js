require('dotenv').config();
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');

const clientesRoutes = require("./routes/clientes.routes");
const comisionesRoutes = require("./routes/comisiones.routes");
const creditoRoutes = require("./routes/credito.routes");
const detalleVentasRoutes = require("./routes/detalle_ventas.routes");
const inventarioRoutes = require("./routes/inventario.routes");
const pagosRoutes = require("./routes/pagos.routes");
const productosRoutes = require("./routes/productos.routes");
const proveedoresRoutes = require("./routes/proveedores.routes");
const vendedoresRoutes = require("./routes/vendedores.routes");
const ventasRoutes = require("./routes/ventas.routes");
const authRoutes = require('./routes/authRoutes');
const registerRoutes = require('./routes/register.routes');
const recoverRoutes = require('./routes/recover.routes');
const administradoresRoutes = require("./routes/administradores.routes");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sirve archivos estáticos de la carpeta login-frontend
app.use('/login-frontend', express.static(path.join(__dirname, 'login-frontend')));

// Rutas
app.use('/api/register', registerRoutes);
app.use('/api', authRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/comisiones", comisionesRoutes);
app.use("/api/credito", creditoRoutes);
app.use("/api/detalle_ventas", detalleVentasRoutes);
app.use("/api/inventario", require("./routes/inventario.routes"));
app.use("/api/pagos", pagosRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/vendedores", vendedoresRoutes);
app.use("/api/ventas", ventasRoutes);
app.use('/api/usuarios', require('./routes/usuario.routes'));
app.use('/api/recover', recoverRoutes);
app.use("/api/administradores", administradoresRoutes);

// Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
