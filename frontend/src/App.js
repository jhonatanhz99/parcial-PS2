import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './components/Login';
import Sidebar from "./components/Sidebar";
import Proveedores from "./pages/Proveedores";
import Clientes from "./pages/Clientes";
import Productos from "./pages/Productos";
import Inventario from "./pages/Inventario";
import Ventas from "./pages/Ventas";
import Usuarios from "./pages/Usuarios";
import Reportes from "./pages/Reportes";
import Dashboard from "./pages/Dashboard";


function ProtectedRoute({ children }) {
  const isAuth = !!localStorage.getItem("token");
  return isAuth ? children : <Navigate to="/" />;
}

function App() {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("token"));
  const usuarioGuardado = localStorage.getItem("usuario");
  const [usuarioActual, setUsuarioActual] = useState(
    usuarioGuardado && usuarioGuardado !== "undefined"
      ? JSON.parse(usuarioGuardado)
      : null
  );

  const handleLogin = (usuario) => {
    setIsAuth(true);
    setUsuarioActual(usuario);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setIsAuth(false);
    setUsuarioActual(null);
  };

  if (!isAuth) {
    return (
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Login onLogin={handleLogin} />
            }
          />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Sidebar onLogout={handleLogout} />
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <ProtectedRoute>
              <Clientes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/productos"
          element={
            <ProtectedRoute>
              <Productos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <ProtectedRoute>
              <Inventario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ventas"
          element={
            <ProtectedRoute>
              <Ventas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/proveedores"
          element={
            <ProtectedRoute>
              <Proveedores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute>
              <Usuarios usuarioActual={usuarioActual} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <Reportes />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
