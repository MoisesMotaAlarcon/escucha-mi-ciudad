import React from "react";
import { Link } from "react-router-dom";
import "../styles/styles.css";

function StartScreen() {
  return (
    <main>
      <section id="ban">
        <div className="banner">
          <h3>Bienvenido a la Ruta Sonora</h3>
          <p>Descubre monumentos con descripciones accesibles y geolocalización.</p>
          <div className="buttons">
            <Link to="/map" className="btn-access">Explorar</Link>
            <Link to="/register" className="btn-access">Registrarse</Link>
            <Link to="/login" className="btn-access">Iniciar Sesión</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default StartScreen;
