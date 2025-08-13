import React, { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";

function CameraCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const [webcamAvailable, setWebcamAvailable] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setWebcamAvailable(true))
      .catch((err) => {
        console.error("Error accediendo a la cámara:", err);
        setErrorMsg("No se puede acceder a la cámara. Usa un dispositivo con cámara o revisa los permisos.");
        setWebcamAvailable(false);
      });
  }, []);

  const capture = () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("No se pudo tomar la foto. Intenta de nuevo.");
      return;
    }
    // Convierte base64 a Blob
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => onCapture(blob))
      .catch(() => alert("Error procesando la foto."));
  };

  if (webcamAvailable === false) {
    return <p style={{ textAlign: "center", color: "white" }}>{errorMsg}</p>;
  }

  if (webcamAvailable === null) {
    return <p style={{ textAlign: "center", color: "white" }}>Verificando cámara...</p>;
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
