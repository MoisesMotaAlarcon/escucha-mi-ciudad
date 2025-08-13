// src/components/CameraCapture.jsx
import React, { useRef } from "react";
import Webcam from "react-webcam";

function CameraCapture({ onCapture }) {
  const webcamRef = useRef(null);

  const capture = () => {
    if (!webcamRef.current) return alert("Webcam no disponible");
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return alert("No se pudo tomar la foto");
    onCapture(imageSrc); // base64
  };

  return (
    <div style={{ textAlign: "center", marginTop: "10px" }}>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "user" }} // cámara frontal PC
        style={{ width: "100%", maxWidth: "400px", borderRadius: "10px" }}
      />
      <button onClick={capture} style={{ marginTop: "10px" }}>
        Tomar foto
      </button>
    </div>
  );
}

export default CameraCapture;
