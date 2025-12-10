import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import StartScreen from "./components/StartScreen";
import MapView from "./components/MapView";
import MonumentDetail from "./components/MonumentDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import MyUploads from "./components/MyUploads";

import "./styles/styles.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/monuments" element={<MonumentDetail />} />
          <Route path="/monument/:name" element={<MonumentDetail />} /> {/* Ruta detalle monumento */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/uploads" element={<MyUploads />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;