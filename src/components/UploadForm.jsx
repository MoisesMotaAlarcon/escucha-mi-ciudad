import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db, auth } from "../services/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import CameraCapture from "./CameraCapture";

function UploadForm() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // cuando el usuario selecciona archivo de galería
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // cuando el usuario toma foto con cámara
  const handleCameraCapture = async (imageBase64) => {
    // Convertir base64 a Blob
    const res = await fetch(imageBase64);
    const blob = await res.blob();
    setFile(blob);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Selecciona un archivo o toma una foto");

    setLoading(true);
    try {
      const storageRef = ref(storage, `uploads/${auth.currentUser.uid}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "uploads"), {
        userId: auth.currentUser.uid,
        fileUrl,
        text,
        createdAt: serverTimestamp(),
      });

      alert("¡Subida exitosa!");
      navigate("/myuploads");
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
        <input
          type="file"
          accept="image/*,audio/*"
          onChange={handleFileChange}
          style={{ marginBottom: "20px" }}
        />
        <p>O usa la cámara:</p>
        <CameraCapture onCapture={handleCameraCapture} />

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
