import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const PAGE_SIZE = 6;

function MonumentDetail() {
  const { name: routeNameRaw } = useParams() || {};
  const routeName = routeNameRaw ? decodeURIComponent(routeNameRaw) : null;

  const [monuments, setMonuments] = useState([]);
  const [topMonument, setTopMonument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoError, setGeoError] = useState(null);
  const [page, setPage] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const navigate = useNavigate();

  // Función para leer texto
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

  // Cuando cambia la ruta, detener lectura y resetear página
  useEffect(() => {
    stopSpeaking();
    setPage(0);
  }, [routeName]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setGeoError(null);

      if (!navigator.geolocation) {
        setGeoError("Geolocalización no soportada por el navegador.");
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;

          try {
            const geoSearchUrl =
              `https://es.wikipedia.org/w/api.php?` +
              `action=query&list=geosearch&gscoord=${latitude}|${longitude}` +
              `&gsradius=10000&gslimit=50&format=json&origin=*`;

            const response = await fetch(geoSearchUrl);
            const data = await response.json();
            const geoList = data.query?.geosearch || [];

            if (geoList.length === 0) {
              if (!cancelled) {
                setMonuments([]);
                setTopMonument(null);
                setLoading(false);
              }
              return;
            }

            const titles = geoList.map((p) => p.title);

            const detailPromises = titles.map(async (t) => {
              const summaryUrl = `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`;
              const res = await fetch(summaryUrl);
              const sData = await res.json();
              return {
                title: sData.title || t,
                extract: sData.extract || "",
                thumbnail: sData.thumbnail?.source || null,
              };
            });

            const details = await Promise.all(detailPromises);
            if (cancelled) return;

            let ordered = [...details];
            if (routeName) {
              const idx = ordered.findIndex(
                (m) => m.title.toLowerCase() === routeName.toLowerCase()
              );
              if (idx > -1) {
                const [sel] = ordered.splice(idx, 1);
                ordered = [sel, ...ordered];
              }
            }

            setMonuments(ordered);
            setTopMonument(ordered[0] || null);
          } catch (err) {
            if (!cancelled) {
              console.error(err);
              setGeoError("Error al cargar datos de Wikipedia.");
            }
          } finally {
            if (!cancelled) setLoading(false);
          }
        },
        (err) => {
          if (!cancelled) {
            console.error(err);
            setGeoError("No se pudo obtener la ubicación.");
            setLoading(false);
          }
        }
      );
    }

    load();

    return () => {
      cancelled = true;
      stopSpeaking();
    };
  }, [routeName]);

  const others = topMonument ? monuments.slice(1) : monuments;
  const start = page * PAGE_SIZE;
  const currentPageItems = others.slice(start, start + PAGE_SIZE);
  const totalPages = Math.ceil(others.length / PAGE_SIZE);

  const goPrev = () => setPage((p) => Math.max(0, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

  const handleCardClick = (title, description) => {
    stopSpeaking(); 
    navigate(`/monument/${encodeURIComponent(title)}`);
    speakText(description); 
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

      {loading && <p>Cargando monumentos cercanos...</p>}
      {geoError && !loading && <p>{geoError}</p>}

      {!loading && !geoError && topMonument && (
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
          <h1>{topMonument.title}</h1>
          {topMonument.thumbnail && (
            <img
              src={topMonument.thumbnail}
              alt={topMonument.title}
              style={{
                maxWidth: "100%",
                borderRadius: "8px",
                margin: "15px auto",
              }}
            />
          )}
          <p>{topMonument.extract || "Sin descripción disponible."}</p>
          <button
            onClick={isSpeaking ? stopSpeaking : () => speakText(topMonument.extract)}
            className="btn-access"
            style={{ marginTop: "15px" }}
          >
            {isSpeaking ? "⏹ Detener" : "▶️ Escuchar"}
          </button>
        </div>
      )}

      {!loading && !geoError && (
        <>
          <div className="card-grid">
            {currentPageItems.length === 0 && <p>No se encontraron más monumentos.</p>}
            {currentPageItems.map((m, i) => (
              <div
                key={`${page}-${i}-${m.title}`}
                className="card-item"
                onClick={() => handleCardClick(m.title, m.extract)}
                style={{ cursor: "pointer" }}
              >
                <figure>
                  {m.thumbnail ? (
                    <img src={m.thumbnail} alt={m.title} />
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
                    <div className="titulo">{m.title}</div>
                    <div className="info">{m.extract}</div>
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
    </div>
  );
}

export default MonumentDetail;
