import React from "react";
import "../styles/styles.css";

function Footer() {
  return (
    <footer>
      <div className="footer_grid">
        {/* Columna Logo */}
        <div className="footer_box logo_box">
          <img src="/logo.png" alt="Logo Footer" className="logo" />
        </div>

        {/* Columnas Texto + Iconos */}
        <div className="footer_box content_box">
          <h2>Redes Sociales</h2>
          <p>Síguenos para estar al tanto de las últimas novedades.</p>
          <nav>
            <ul>
              <li><i className="fa-brands fa-facebook fa-2x"></i></li>
              <li><i className="fa-brands fa-tiktok fa-2x"></i></li>
              <li><i className="fa-brands fa-instagram fa-2x"></i></li>
              <li><i className="fa-brands fa-youtube fa-2x"></i></li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="footer_bottom">
        <p>Políticas Legales</p>
      </div>
    </footer>
  );
}

export default Footer;