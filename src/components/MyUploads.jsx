// src/pages/MyUploads.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Si tienes un servicio para obtener las subidas, lo importas aquí
// import { getUserUploads } from "../services/uploadsService";

function MyUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulación: aquí iría la llamada real a Firestore o tu backend
    async function fetchUploads() {
      setLoading(true);
      try {
        // const data = await getUserUploads(); // <- tu función real
        const data = []; // Simulación: sin subidas aún
        setUploads(data);
      } catch (error) {
        console.error("Error cargando subidas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUploads();
  }, []);

  return (
    <div className="section-grid" style={{ marginTop: "100px" }}>
      <button
        onClick={() => navigate(-1)}
        className="btn-access"
        style={{ marginBottom: "20px" }}
      >
        ← Volver
      </button>

      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "white" }}>
        Mis Subidas
      </h1>

      {loading && <p>Cargando tus subidas...</p>}

      {!loading && uploads.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            background: "#222",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <p style={{ marginBottom: "20px" }}>No hay ninguna subida.</p>
          <button
            onClick={() => navigate("/uploads")}
            className="btn-access"
            style={{ padding: "10px 20px" }}
          >
            Crear nueva subida
          </button>
        </div>
      )}

      {!loading && uploads.length > 0 && (
        <div className="card-grid">
          {uploads.map((item, idx) => (
            <div
              key={idx}
              className="card-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/uploads/${item.id}`)}
            >
              <figure>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "160px",
                      background: "#444",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#aaa",
                    }}
                  >
                    Sin imagen
                  </div>
                )}
                <figcaption>
                  <div className="titulo">{item.title || "Sin título"}</div>
                  <div className="info">{item.text || "Sin descripción"}</div>
                </figcaption>
              </figure>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyUploads;
