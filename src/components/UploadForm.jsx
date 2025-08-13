// src/components/UploadForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db, auth } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    // Generar URL de vista previa
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Selecciona un archivo");

    setLoading(true);
    try {
      // Subir a Firebase Storage
      const storageRef = ref(
        storage,
        `uploads/${auth.currentUser.uid}/${Date.now()}_${file.name}`
      );
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // Guardar metadatos en Firestore
      await addDoc(collection(db, "uploads"), {
        userId: auth.currentUser.uid,
        fileUrl,
        text,
        createdAt: serverTimestamp(),
      });

      alert("¡Subida exitosa!");
      navigate("/myuploads");
    } catch (err) {
      console.error("Error subiendo archivo:", err);
      alert("Error subiendo archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "100px", textAlign: "center", color: "white" }}>
      <h2>Crear nueva subida</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        {/* Selector de archivo: permite cámara o galería */}
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*,audio/*"
          capture="environment"
          style={{ display: "block", margin: "0 auto 20px" }}
        />

        {/* Vista previa */}
        {previewUrl && file && file.type.startsWith("image/") && (
          <img
            src={previewUrl}
            alt="Vista previa"
            style={{ maxWidth: "90%", margin: "10px auto", borderRadius: "8px" }}
          />
        )}
        {previewUrl && file && file.type.startsWith("audio/") && (
          <audio controls style={{ margin: "10px auto", display: "block" }}>
            <source src={previewUrl} type={file.type} />
            Tu navegador no soporta audio.
          </audio>
        )}

        {/* Campo de texto */}
        <textarea
          placeholder="Escribe una descripción..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            display: "block",
            margin: "20px auto",
            width: "80%",
            height: "100px",
            padding: "10px",
            borderRadius: "8px",
          }}
        />

        {/* Botón de subir */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Subiendo..." : "Subir"}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;
