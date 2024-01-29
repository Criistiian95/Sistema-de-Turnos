import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home"
import RegisterUser from "./components/RegisterUser";
import Dashboard from "./components/Dashboard";
import Footer from "./components/Footer"
import Turnos from "./components/Turnos";
import RegisterPatient from "./components/RegisterPatient"
import RegisterDoctor from "./components/RegisterDoctors";
import Doctors from "./components/Doctors";
import TurnsPatients from "./components/TurnsPatients"








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
            <Route path="/turnos"  element={<Turnos />} />
          </Routes>
        <Footer/>
        </BrowserRouter>
       
                     
              
      </header>
      
    </div>

  );
}

export default App;
