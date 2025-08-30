import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/styles.css";

function Header() {
  const { usuarioActual, logout } = useContext(AuthContext);
  const [dropdown, setDropdown] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header id="header">
      <div className="menu_container">
        <Link to="/"><img src="/logo.png" alt="Logo" className="logo" /></Link>
        <input type="checkbox" id="menu" />
        <label htmlFor="menu" aria-label="Menu hamburguesa">
          <i className="fa fa-bars" id="desplega" aria-hidden="true"></i>
          <i className="fa fa-times" id="recoge" aria-hidden="true"></i>
        </label>

        <nav>
          <ul className="menu">
            <li><Link className="btn" to="/">Inicio</Link></li>
            <li><Link className="btn" to="/map">Mapa</Link></li>
            <li><Link className="btn" to="/monuments">Monumentos Cercanos</Link></li>
            <li><Link className="btn" to="/uploads">Mis Archivos</Link></li>

            {!usuarioActual ? (
              <>
                <li><Link className="btn" to="/register">Registro</Link></li>
                <li><Link className="btn" to="/login">Iniciar Sesión</Link></li>
              </>
            ) : (
              <li
                className="dropdown"
                onMouseEnter={() => setDropdown(true)}
                onMouseLeave={() => setDropdown(false)}
              >
                <span className="btn">{usuarioActual.displayName || "Usuario"}</span>
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
