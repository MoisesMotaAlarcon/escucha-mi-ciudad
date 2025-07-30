import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (usuario.trim() === "" || password.trim() === "") {
      setError("Por favor ingresa usuario y contraseña.");
      return;
    }

    setError("");
    // Simula login exitoso
    navigate("/uploads");
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Inicia Sesión</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit" className="login-button">
          Entrar
        </button>
      </form>
      <p className="login-text">
        ¿No tienes cuenta?{" "}
        <button className="switch-button" onClick={() => navigate("/register")}>
          Regístrate
        </button>
      </p>
    </div>
  );
};

export default Login;
