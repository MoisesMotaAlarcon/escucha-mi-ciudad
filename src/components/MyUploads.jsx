// src/components/MyUploads.jsx
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
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const PAGE_SIZE = 6;

function MyUploads() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Verificar usuario logueado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      else setUser(u);
    });
    return unsubscribe;
  }, [navigate]);

  // Abrir selector de archivos
  const handleNewUploadClick = () => fileInputRef.current.click();

  // Subida de archivo
  const handleFileChange = async (e) => {
    if (!user) return;
    const file = e.target.files[0];
    if (!file) return;

    const desc = prompt("Escribe una descripción (opcional):") || "";
    const filePath = `uploads/${user.uid}_${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Progreso:", progress + "%");
      },
      (error) => console.error("Error subiendo archivo:", error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          const docRef = await addDoc(collection(db, "uploads"), {
            imageUrl: downloadURL,
            filePath, // guardar ruta exacta para eliminar
            title: file.name,
            text: desc,
            userId: user.uid,
            createdAt: serverTimestamp(),
          });
          setUploads((prev) => [
            ...prev,
            { id: docRef.id, imageUrl: downloadURL, filePath, title: file.name, text: desc, userId: user.uid },
          ]);
        } catch (err) {
          console.error("Error guardando en Firestore:", err);
        }
      }
    );
  };

  // Cargar subidas del usuario
  useEffect(() => {
    if (!user) return;

    async function fetchUploads() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "uploads"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const uploadsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUploads(uploadsData);
      } catch (error) {
        console.error("Error cargando subidas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUploads();
  }, [user]);

  // Eliminar archivo
  const handleDelete = async (item) => {
    if (!window.confirm("¿Eliminar esta subida?")) return;
    try {
      // Borrar de Storage usando filePath
      const storageRef = ref(storage, item.filePath);
      await deleteObject(storageRef);

      // Borrar de Firestore
      await deleteDoc(doc(db, "uploads", item.id));

      setUploads((prev) => prev.filter((u) => u.id !== item.id));
    } catch (err) {
      console.error("Error eliminando archivo:", err);
      alert("No se pudo eliminar el archivo.");
    }
  };

  // Leer descripción
  const speakText = (text) => {
    if (!text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Paginación
  const start = page * PAGE_SIZE;
  const currentItems = uploads.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(uploads.length / PAGE_SIZE);
  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  return (
    <div className="section-grid" style={{ marginTop: "100px" }}>
      <button onClick={() => navigate("/")} className="btn-access" style={{ marginBottom: "20px" }}>
        ← Volver
      </button>

      <h1 style={{ textAlign: "center", marginBottom: "30px", color: "white" }}>Mis Subidas</h1>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <button onClick={handleNewUploadClick} className="btn-access" style={{ padding: "10px 20px" }}>
          Crear nueva subida
        </button>
      </div>

      {loading && <p style={{ textAlign: "center", color: "white" }}>Cargando tus subidas...</p>}
      {!loading && uploads.length === 0 && <p style={{ textAlign: "center", color: "white" }}>No hay ninguna subida</p>}

      {!loading && uploads.length > 0 && (
        <>
          <div className="card-grid">
            {currentItems.map((item) => (
              <div key={item.id} className="card-item" style={{ cursor: "pointer" }}>
                <figure>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} style={{ maxWidth: "100%", borderRadius: "8px" }} />
                  ) : (
                    <div style={{ width: "100%", height: "160px", background: "#444", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa" }}>
                      Sin imagen
                    </div>
                  )}
                  <figcaption>
                    <div className="titulo">{item.title || "Sin título"}</div>
                    <div className="info">{item.text || "Sin descripción"}</div>
                  </figcaption>
                </figure>

                <button onClick={() => handleDelete(item)} style={{ display: "block", margin: "10px auto", padding: "8px 15px", background: "#3D82B8", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  Eliminar
                </button>

                <button onClick={isSpeaking ? stopSpeaking : () => speakText(item.text)} style={{ display: "block", margin: "5px auto", padding: "6px 12px", background: "#3D82B8", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                  {isSpeaking ? "⏹ Detener" : "▶️ Escuchar"}
                </button>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="monuments-pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginTop: "40px", marginBottom: "40px", color: "white" }}>
              <button onClick={goPrev} disabled={page === 0} className="btn-access" style={{ opacity: page === 0 ? 0.5 : 1 }}>Anterior</button>
              <span> Página {page + 1} de {totalPages} </span>
              <button onClick={goNext} disabled={page === totalPages - 1} className="btn-access" style={{ opacity: page === totalPages - 1 ? 0.5 : 1 }}>Siguiente</button>
            </div>
          )}
        </>
      )}

      <input type="file" accept="image/*" capture="environment" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />
    </div>
  );
}

export default MyUploads;
