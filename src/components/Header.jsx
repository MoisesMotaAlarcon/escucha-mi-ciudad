import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/styles.css";

function Header() {
  const { usuarioActual, logout } = useContext(AuthContext);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setMenuAbierto(false);
  };

  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header id="header">
      <div className="menu_container">

        {/* LOGO */}
        <Link to="/" onClick={cerrarMenu}>
          <img src="/logo.png" alt="Logo" className="logo" />
        </Link>

        {/* BOTÓN HAMBURGUESA */}
        <label 
          className="hamburger-btn"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          {menuAbierto ? (
            <i className="fa fa-times"></i>
          ) : (
            <i className="fa fa-bars"></i>
          )}
        </label>

        {/* MENÚ */}
        <nav>
          <ul className={`menu ${menuAbierto ? "abierto" : ""}`}>
            <li><Link className="btn" to="/" onClick={cerrarMenu}>Inicio</Link></li>
            <li><Link className="btn" to="/map" onClick={cerrarMenu}>Mapa</Link></li>
            <li><Link className="btn" to="/monuments" onClick={cerrarMenu}>Monumentos Cercanos</Link></li>
            <li><Link className="btn" to="/uploads" onClick={cerrarMenu}>Mis Archivos</Link></li>

            {/* USUARIO NO LOGEADO */}
            {!usuarioActual ? (
              <>
                <li><Link className="btn" to="/register" onClick={cerrarMenu}>Registro</Link></li>
                <li><Link className="btn" to="/login" onClick={cerrarMenu}>Iniciar Sesión</Link></li>
              </>
            ) : (
              <li 
                className="dropdown"
                onClick={() => setDropdown(!dropdown)}
              >
                <span className="btn">
                  {usuarioActual.displayName || "Usuario"}
                </span>

                {dropdown && (
                  <ul className="dropdown-menu">
                    <li onClick={handleLogout}>Cerrar sesión</li>
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
