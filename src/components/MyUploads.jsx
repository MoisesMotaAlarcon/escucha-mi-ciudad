import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db } from "../services/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function MyUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fileInputRef = useRef(null); // Ref para input de archivo

  useEffect(() => {
    async function fetchUploads() {
      setLoading(true);
      try {
        // Aquí iría tu llamada real a Firestore
        const data = []; 
        setUploads(data);
      } catch (error) {
        console.error("Error cargando subidas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUploads();
  }, []);

  // Función para abrir el selector de archivos
  const handleNewUploadClick = () => {
    fileInputRef.current.click();
  };

  // Función para subir la imagen a Firebase Storage
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Opcional: progreso de subida
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Progreso:", progress + "%");
      },
      (error) => {
        console.error("Error subiendo archivo:", error);
      },
      async () => {
        // Cuando termina la subida
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        console.log("Archivo subido. URL:", downloadURL);

        // Guardar referencia en Firestore
        try {
          const docRef = await addDoc(collection(db, "uploads"), {
            imageUrl: downloadURL,
            title: file.name,
            text: "",
            createdAt: serverTimestamp(),
          });
          console.log("Documento guardado con ID:", docRef.id);
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

      {/* Input oculto para seleccionar archivo */}
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
