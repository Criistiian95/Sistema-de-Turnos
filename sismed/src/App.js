import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home.js"
import RegisterUser from "./components/RegisterUser.js";
import Dashboard from "./components/Dashboard.jsx";
import Footer from "./components/Footer.js"
import Turnos from "./components/Turnos.js";
import RegisterPatient from "./components/RegisterPatient.js"
import RegisterDoctor from "./components/RegisterDoctors.js";
import Doctors from "./components/Doctors.js";
import TurnsPatients from "./components/TurnsPatients.js"

import ProtectedRoute from "./components/ProtectedRoute.js";








function App() {

  return (
  
    <div className="App">
      
      <header className="App-header">
      
        <BrowserRouter>

          <Routes className="navbar">
          <Route path="/" element={<Home />} className="lista" />
            <Route path="/login" element={<Home />} className="lista" />
            <Route path="/register" element={<RegisterUser />} className="lista" />
            <Route path="/api/user/:userId" element={<Dashboard />} />
            <Route path="/createPatient" element={<RegisterPatient />} />
            <Route path="/createDoctor" element={<RegisterDoctor/>} />
            <Route path="/turns-patients" element={<TurnsPatients />} />
            <Route path="/doctors" element={<Doctors  />} />
            <Route path="/turnos" element={<Turnos />} />
          </Routes>
        <Footer/>
        </BrowserRouter>
       
                     
              
      </header>
      
    </div>

  );
}

export default App;
