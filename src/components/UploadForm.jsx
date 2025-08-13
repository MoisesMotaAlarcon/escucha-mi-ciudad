// src/components/UploadForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db, auth } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Selecciona un archivo");

    setLoading(true);
    try {
      // 1. Subir a Storage
      const storageRef = ref(storage, `uploads/${auth.currentUser.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      // 2. Guardar metadatos en Firestore
      await addDoc(collection(db, "uploads"), {
        userId: auth.currentUser.uid,
        fileUrl,
        text,
        createdAt: serverTimestamp(),
      });

      alert("¡Subida exitosa!");
      navigate("/myuploads"); // Volver a la lista de subidas
    } catch (err) {
      console.error(err);
      alert("Error subiendo archivo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "100px", textAlign: "center", color: "white" }}>
      <h2>Crear nueva subida</h2>
      <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
        <input type="file" onChange={handleFileChange} accept="image/*,audio/*" />
        <textarea
          placeholder="Escribe una descripción..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ display: "block", margin: "20px auto", width: "80%", height: "100px" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Subiendo..." : "Subir"}
        </button>
      </form>
    </div>
  );
}

export default UploadForm;
