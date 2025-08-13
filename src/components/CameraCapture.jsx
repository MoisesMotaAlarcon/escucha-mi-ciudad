import React, { useRef } from "react";
import Webcam from "react-webcam";

function CameraCapture({ onCapture }) {
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc); // devuelve la imagen en base64
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Webcam
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: "environment" }} // cámara trasera
        style={{ width: "100%", maxWidth: "400px", borderRadius: "10px" }}
      />
      <button onClick={capture} style={{ marginTop: "10px" }}>
        Tomar foto
      </button>
    </div>
  );
}

export default CameraCapture;
