import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { storage, db, auth } from "../services/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const PAGE_SIZE = 6;

function MyUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [topUpload, setTopUpload] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      else setUser(u);
    });
    return unsubscribe;
  }, [navigate]);

  // Abrir selector
  const handleNewUploadClick = () => fileInputRef.current?.click();

  // Subir archivo
  const handleFileChange = async (e) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const desc = prompt("Escribe una descripción (opcional):") || "";
    const filePath = `uploads/${user.uid}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snap) => {
        const p = (snap.bytesTransferred / snap.totalBytes) * 100;
        console.log("Progreso:", p.toFixed(0) + "%");
      },
      (err) => {
        console.error("Error subiendo archivo:", err);
        setError("Error subiendo archivo.");
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const createdAtMs = Date.now();

          const docRef = await addDoc(collection(db, "uploads"), {
            imageUrl: downloadURL,
            filePath,
            title: file.name,
            text: desc,
            userId: user.uid,
            createdAt: serverTimestamp(), 
            createdAtMs,                  
          });

          const newUpload = {
            id: docRef.id,
            imageUrl: downloadURL,
            filePath,
            title: file.name,
            text: desc,
            userId: user.uid,
            createdAtMs,
          };
          setUploads((prev) => [newUpload, ...prev]);
          setTopUpload((t) => t ?? newUpload);
          setError("");
        } catch (err) {
          console.error("Error guardando en Firestore:", err);
          setError("Error guardando en la base de datos.");
        }
      }
    );
  };

  // Escucha en tiempo real
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError("");

    const q = query(
      collection(db, "uploads"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const data = snap.docs.map((d) => {
          const v = d.data();
          return {
            id: d.id,
            imageUrl: v.imageUrl || "",
            filePath: v.filePath || "",
            title: v.title || "Sin título",
            text: v.text || "Sin descripción",
            userId: v.userId,
            createdAt: v.createdAt,   
            createdAtMs: v.createdAtMs || 0, 
          };
        });

        // Orden: primero por createdAtMs (si existe), fallback a createdAt
        data.sort((a, b) => {
          const bTime =
            (b.createdAtMs ?? 0) ||
            (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0);
          const aTime =
            (a.createdAtMs ?? 0) ||
            (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
          return bTime - aTime;
        });

        setUploads(data);

        // Mantener top si sigue existiendo; si no, poner el primero
        setTopUpload((curr) => {
          if (!data.length) return null;
          if (!curr) return data[0];
          const stillThere = data.find((x) => x.id === curr.id);
          return stillThere || data[0];
        });

        setLoading(false);
      },
      (err) => {
        console.error("Error cargando subidas:", err);
        setError(
          err?.message?.includes("Missing or insufficient permissions")
            ? "No tienes permisos para leer las subidas. Revisa las reglas de Firestore."
            : "Error cargando subidas."
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Eliminar
  const handleDelete = async (item) => {
    if (!window.confirm("¿Eliminar esta subida?")) return;
    try {
      if (item.filePath) {
        await deleteObject(ref(storage, item.filePath));
      }
      await deleteDoc(doc(db, "uploads", item.id));
    } catch (err) {
      console.error("Error eliminando archivo:", err);
      alert("No se pudo eliminar el archivo.");
    }
  };

  // TTS
  const speakText = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "es-ES";
    u.rate = 1;
    u.pitch = 1;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Grid/paginación (sin el destacado)
  const others = topUpload
    ? uploads.filter((u) => u.id !== topUpload.id)
    : uploads;
  const start = page * PAGE_SIZE;
  const currentItems = others.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(others.length / PAGE_SIZE);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  const handleCardClick = (item) => {
    stopSpeaking();
    setTopUpload(item);
    speakText(item.text);
  };

  return (
    <div className="section-grid" style={{ marginTop: "100px" }}>
      <button
        onClick={() => navigate("/")}
        className="btn-access"
        style={{ marginBottom: "20px" }}
      >
        ← Volver
      </button>

      <h1 style={{ textAlign: "center", marginBottom: "10px", color: "white" }}>
        Mis Subidas
      </h1>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          onClick={handleNewUploadClick}
          className="btn-access"
          style={{ padding: "10px 20px" }}
        >
          Crear nueva subida
        </button>
      </div>

      {error && (
        <p style={{ textAlign: "center", color: "#ff6b6b" }}>{error}</p>
      )}
      {loading && (
        <p style={{ textAlign: "center", color: "white" }}>Cargando...</p>
      )}
      {!loading && uploads.length === 0 && (
        <p style={{ textAlign: "center", color: "white" }}>
          No hay ninguna subida
        </p>
      )}

      {!loading && topUpload && (
        <div
          className="monument-top-card"
          style={{
            marginBottom: "40px",
            textAlign: "center",
            border: "1px solid #3D82B8",
            padding: "20px",
            borderRadius: "12px",
            background: "#222",
            color: "white",
          }}
        >
          <h2>{topUpload.title}</h2>
          {topUpload.imageUrl && (
            <img
              src={topUpload.imageUrl}
              alt={topUpload.title}
              style={{
                maxWidth: "100%",
                borderRadius: "8px",
                margin: "15px auto",
              }}
            />
          )}
          <p>{topUpload.text || "Sin descripción"}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={isSpeaking ? stopSpeaking : () => speakText(topUpload.text)}
              className="btn-access"
              style={{ marginTop: "15px" }}
            >
              {isSpeaking ? "⏹ Detener" : "▶️ Escuchar"}
            </button>
            <button
              onClick={() => handleDelete(topUpload)}
              className="btn-access"
              style={{ marginTop: "15px", background: "red" }}
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {!loading && others.length > 0 && (
        <>
          <div className="card-grid">
            {currentItems.map((item) => (
              <div
                key={item.id}
                className="card-item"
                onClick={() => handleCardClick(item)}
                style={{ cursor: "pointer" }}
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
                    <div className="titulo">{item.title}</div>
                    <div className="info">{item.text}</div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div
              className="monuments-pagination"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginTop: "40px",
                marginBottom: "40px",
                color: "white",
              }}
            >
              <button
                onClick={goPrev}
                disabled={page === 0}
                className="btn-access"
                style={{ opacity: page === 0 ? 0.5 : 1 }}
              >
                Anterior
              </button>
              <span>
                Página {page + 1} de {totalPages}
              </span>
              <button
                onClick={goNext}
                disabled={page === totalPages - 1}
                className="btn-access"
                style={{ opacity: page === totalPages - 1 ? 0.5 : 1 }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

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
