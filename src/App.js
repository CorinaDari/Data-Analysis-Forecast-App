import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SalesAnalysis from "./SalesAnalysis/SalesAnalysis";
import ClientProfile from "./SalesAnalysis/ClientProfile";
import SalesIntervals from "./SalesAnalysis/SalesIntervals";
import FutureSales from "./SalesAnalysis/FutureSales";
import PriceImpact from "./SalesAnalysis/PriceImpact";
import Navbar from "./Layout/Navbar";
import Cartograma from "./SalesAnalysis/Cartograma"; // Importă fișierul Cartograma
import "./App.css"; // Include fișierul de stil pentru layout

const App = () => {
  return (
    <Router>
      <div className="app-layout">
        <Navbar /> {/* Include Navbar */}
        <div className="content">
          <Routes>
            <Route path="/" element={<SalesAnalysis />} />
            <Route path="/client-profile" element={<ClientProfile />} />
            <Route path="/sales-intervals" element={<SalesIntervals />} />
            <Route path="/future-sales" element={<FutureSales />} />
            <Route path="/price-impact" element={<PriceImpact />} />
            <Route path="/cartograma" element={<Cartograma />} /> {/* Ruta pentru Cartograma */}
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
