import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

// Centro aproximado España
const SPAIN_CENTER = [40.0, -3.7];
const SPAIN_ZOOM = 6;

// Radio en metros para buscar lugares
const SEARCH_RADIUS_M = 1500;

function MapView() {
  const mapRef = useRef(null); 
  const userMarkerRef = useRef(null); 
  const placesLayerRef = useRef(null); 
  const navigate = useNavigate();
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (mapRef.current) return;

    // Crea mapa centrado en España
    const mapInstance = L.map("map").setView(SPAIN_CENTER, SPAIN_ZOOM);
    mapRef.current = mapInstance;

    // Capa base OSM
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(mapInstance);

    // Capa para marcadores de lugares encontrados 
    placesLayerRef.current = L.layerGroup().addTo(mapInstance);

    setMapReady(true);

    // Geolocalizar automáticamente al montar
    geolocateAndLoad();

    // Limpieza
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      placesLayerRef.current = null;
      userMarkerRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Geolocaliza y busca lugares cercanos //
  const geolocateAndLoad = () => {
    if (!mapRef.current) return;
    if (!navigator.geolocation) {
      console.log("Geolocalización no soportada por tu navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // centra mapa en usuario
        mapRef.current.setView([latitude, longitude], 15);

        // añade/actualiza marcador usuario
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          userMarkerRef.current = L.marker([latitude, longitude])
            .addTo(mapRef.current)
            .bindPopup("¡Estás aquí!");
        }
        userMarkerRef.current.openPopup();

        // busca lugares cercanos
        await fetchNearbyPlaces(latitude, longitude);
      },
      (err) => {
        console.log("No se pudo obtener ubicación:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* ------------------------------------------------------------------
     Búsqueda de lugares en Overpass
     Se incluyen las categorías: monumentos, ayuntamientos, edificios públicos, 
     plazas, municipal, patrimonio...
  ------------------------------------------------------------------ */
  const fetchNearbyPlaces = async (latitude, longitude) => {
    if (!mapRef.current || !placesLayerRef.current) return;

    // Limpia marcadores anteriores
    placesLayerRef.current.clearLayers();

    const q = `[out:json][timeout:25];
      (
        node["historic"="monument"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        node["historic"="castle"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        way["historic"="monument"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        way["historic"="castle"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        relation["historic"="monument"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        relation["historic"="castle"](around:${SEARCH_RADIUS_M},${latitude},${longitude});

        node["amenity"="townhall"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        way["amenity"="townhall"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        relation["amenity"="townhall"](around:${SEARCH_RADIUS_M},${latitude},${longitude});

        node["building"="public"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        way["building"="public"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        relation["building"="public"](around:${SEARCH_RADIUS_M},${latitude},${longitude});

        node["place"="square"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        way["place"="square"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        relation["place"="square"](around:${SEARCH_RADIUS_M},${latitude},${longitude});

        node["tourism"="attraction"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        way["tourism"="attraction"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        relation["tourism"="attraction"](around:${SEARCH_RADIUS_M},${latitude},${longitude});

        way["leisure"="park"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        way["leisure"="garden"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        node["leisure"="park"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        node["leisure"="garden"](around:${SEARCH_RADIUS_M},${latitude},${longitude});

        node["historic"="way"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        way["historic"="way"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
        relation["historic"="way"](around:${SEARCH_RADIUS_M},${latitude},${longitude});
      );
      out center;`;

    const overpassUrl = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(q);

    try {
      const res = await fetch(overpassUrl);
      const data = await res.json();

      if (!data.elements || data.elements.length === 0) {
        alert("No se encontraron lugares emblemáticos cerca.");
        return;
      }

      data.elements.forEach((el) => {
        // Determinar coordenadas según tipo
        let lat, lon;
        if (el.type === "node") {
          lat = el.lat;
          lon = el.lon;
        } else {
          lat = el.center?.lat;
          lon = el.center?.lon;
        }
        if (!lat || !lon) return;

        const name = el.tags?.name || "Sin nombre";
        const marker = L.marker([lat, lon]).addTo(placesLayerRef.current);

        // popup simple con botón
        const btnId = `details-btn-${el.type}-${el.id}`;
        marker.bindPopup(
          `<div style="text-align:center;">
            <b>${name}</b><br/>
            <button id="${btnId}" style="margin-top:4px;">Ver detalles</button>
          </div>`
        );

        // Cuando se abra este popup, se conecta con navegación
        marker.on("popupopen", () => {
          const btnEl = document.getElementById(btnId);
          if (btnEl) {
            btnEl.onclick = () => navigate(`/monument/${encodeURIComponent(name)}`);
          }
        });
      });
    } catch (err) {
      console.error("Error Overpass:", err);
      alert("Error al buscar lugares emblemáticos cercanos.");
    }
  };

  // Render //
  return (
    <div>
      {/* Botones */}
      <div
        className="buttons"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "100px",
          marginBottom: "20px",
        }}
      >
        <button onClick={() => navigate(-1)} className="btn-access">
          Volver
        </button>
        <button onClick={geolocateAndLoad} className="btn-access">
          Buscar Monumentos
        </button>
      </div>

      {/* Contenedor del mapa */}
      <div
        id="map"
        style={{
          height: "500px",
          width: "90%",
          margin: "0 auto",
          display: "block",
        }}
      />
    </div>
  );
}

export default MapView;
