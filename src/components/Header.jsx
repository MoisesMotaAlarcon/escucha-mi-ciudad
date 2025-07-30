import React from "react";
import { Link } from "react-router-dom";
import "../styles/styles.css";

function Header() {
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
            <li><Link className="btn" to="/register">Registro</Link></li>
            <li><Link className="btn" to="/login">Iniciar Sesión</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;