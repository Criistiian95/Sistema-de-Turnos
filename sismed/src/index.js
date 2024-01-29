import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { DoctorProvider } from "./components/DoctorContext";
import App from './App';
import reportWebVitals from './reportWebVitals';
import { PatientProvider } from './components/PatientContext';
import { HorariosProvider } from './components/HorariosContext';
import { FechasOcupadasProvider } from './components/FechasContext';
import {UserProvider} from "./components/UserContext"
import 'bootstrap/dist/css/bootstrap.min.css';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <UserProvider>
    <DoctorProvider>
      <PatientProvider>{/* Envuelve tu aplicación con DoctorProvider */}
        <HorariosProvider>
          <FechasOcupadasProvider>
            <App />
          </FechasOcupadasProvider>
        </HorariosProvider>
      </PatientProvider>
    </DoctorProvider>
    </UserProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
