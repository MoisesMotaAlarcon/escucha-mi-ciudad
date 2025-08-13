// src/components/CameraCapture.jsx
import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

function CameraCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const [webcamAvailable, setWebcamAvailable] = useState(true);

  useEffect(() => {
    // Verifica si el navegador permite webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setWebcamAvailable(true))
      .catch(() => setWebcamAvailable(false));
  }, []);

  const capture = () => {
    if (!webcamRef.current) return alert("Webcam no disponible");
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return alert("No se pudo tomar la foto");
    onCapture(imageSrc);
  };

  if (!webcamAvailable) {
    return (
      <p style={{ textAlign: "center", color: "white" }}>
        No se puede acceder a la cámara. Asegúrate de estar en HTTPS o localhost y de dar permisos al navegador.
      </p>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "10px" }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "user" }}
        style={{ width: "100%", maxWidth: "400px", borderRadius: "10px" }}
      />
      <button onClick={capture} style={{ marginTop: "10px" }}>
        Tomar foto
      </button>
    </div>
  );
}

export default CameraCapture;
