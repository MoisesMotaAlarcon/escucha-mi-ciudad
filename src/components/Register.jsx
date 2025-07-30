import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/styles.css";

const Register = () => {
  const [name, setName] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim() === "" || usuario.trim() === "" || password.trim() === "") {
      setError("Por favor completa todos los campos.");
      return;
    }

    setError("");
    // Simula registro exitoso
    navigate("/login");
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Crear cuenta</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre completo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="login-input"
        />
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
          Registrarse
        </button>
      </form>
      <p className="login-text">
        ¿Ya tienes cuenta?{" "}
        <button className="switch-button" onClick={() => navigate("/login")}>
          Inicia sesión
        </button>
      </p>
    </div>
  );
};

export default Register;
