import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db } from "../services/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function MyUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Cargar subidas desde Firestore
  useEffect(() => {
    const fetchUploads = async () => {
      setLoading(true);
      try {
        // TODO: reemplazar con tu consulta real a Firestore
        const data = [];
        setUploads(data);
      } catch (error) {
        console.error("Error cargando subidas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUploads();
  }, []);

  // Abrir selector de archivos o cámara
  const handleNewUploadClick = () => fileInputRef.current.click();

  // Subir imagen a Firebase Storage y guardar referencia en Firestore
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Progreso:", progress.toFixed(0) + "%");
      },
      (error) => console.error("Error subiendo archivo:", error),
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const docRef = await addDoc(collection(db, "uploads"), {
            imageUrl: downloadURL,
            title: file.name,
            text: "",
            createdAt: serverTimestamp(),
          });
          setUploads((prev) => [
            ...prev,
            { id: docRef.id, imageUrl: downloadURL, title: file.name, text: "" },
          ]);
        } catch (err) {
          console.error("Error guardando en Firestore:", err);
        }
      }
    );
  };

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
            onClick={handleNewUploadClick}
            className="btn-access"
            style={{ padding: "10px 20px" }}
          >
            Crear nueva subida
          </button>
        </div>
      )}

      {!loading && uploads.length > 0 && (
        <div className="card-grid">
          {uploads.map((item) => (
            <div
              key={item.id}
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

      {/* Input oculto para seleccionar archivo o abrir cámara */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default MyUploads;
