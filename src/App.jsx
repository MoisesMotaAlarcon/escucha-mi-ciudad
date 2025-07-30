import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StartScreen from "./components/StartScreen";
import MapView from "./components/MapView";
import MonumentDetail from "./components/MonumentDetail";
import Login from "./components/Login";
import Register from "./components/Register";

import "./styles/styles.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<StartScreen />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/monuments" element={<MonumentDetail />} />
        <Route path="/monument/:name" element={<MonumentDetail />} /> {/* Ruta detalle monumento */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
