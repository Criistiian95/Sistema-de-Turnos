import React from "react";
import { useNavigate,useParams } from "react-router-dom";
import DoctorInfo from "./DoctorInfo.jsx";
import PatientInfo from "./PatientInfo.jsx";
import Horarios from "./Horarios.jsx";
import { useHorariosContext } from "./HorariosContext.js";
import { useDoctorContext } from "./DoctorContext.js";
import { usePatientContext } from "./PatientContext.js";
import { useFechasOcupadasContext } from './FechasContext.js';
import swal from "sweetalert"
import "../assets/Home.css"
import Doctors from "./Doctors.js";
import Patients from "./Patients.js";
import "../assets/Turnero.css"
import Navbar from "./Navbar.jsx";






function Turnos() {

  const { selectedDate } = useHorariosContext();
  const { selectedDoctor } = useDoctorContext();
  const { selectedPatient } = usePatientContext();
  const { agregarFechaOcupada } = useFechasOcupadasContext();
  const navigate = useNavigate()
  const { userId } = useParams();

  const mostrarAlerta = () => {
    swal({
      title: "Turno creado",
      text: "Su turno se creo con exito",
      icon: "success",
      button: "Aceptar",
      timer: 3000
    })
  };


  const FechaOcupada = () => {
    swal({
      title: "Oopps...",
      text: "Disculpe, elija otra fecha",
      icon: "error",
      button: "Aceptar",
      footer: '<a href="#">Why do I have this issue?</a>',
      timer: 3000
    })
  };


  const handleGuardarTurno = async () => {
    try {
      if (selectedDoctor && selectedPatient && selectedDate) {
        const fechaString = selectedDate.toDateString();
        agregarFechaOcupada(fechaString);
        const turnoData = {
          paciente_id: selectedPatient.DNI,
          doctor_id: selectedDoctor.tuition,
          fecha: selectedDate,
          hora: selectedDate,
          especialidad: selectedDoctor.specialty.id,
          estado_turno: true,
          // Otras propiedades del turno, si es necesario
        };
        console.log("Paciente:", selectedPatient)
        console.log("Doctor:", selectedDoctor);
        console.log("fecha:", selectedDate)
        console.log("especialidad:", selectedDoctor.specialty.id)

        console.log("Turno:", turnoData);


        // Realiza una solicitud POST al servidor para crear un nuevo turno
        const respuesta = await fetch("http://localhost:3003/api/shift/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(turnoData),
        })

        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status} - ${respuesta.statusText}`);
        }

        const datos = await respuesta.json()
        console.log("Turno creado:", datos)

        mostrarAlerta();

        navigate(0)

      } else {
        console.error("No se ha seleccionado un paciente o una fecha");

        // Puedes mostrar un mensaje de error al usuario si falta información
      }
    } catch (error) {
      FechaOcupada()
      console.error("Error al crear el turno:", error);
    }
  };


  return (

    
    <section style={{ backgroundColor: "#AAF3E0" }}>
      
      <div className="container py-5 h-100 ">
      <Navbar userId={userId} />
        <div className='row d-flex justify-content-center align-items-center h-100'>
          <div className='col col-xl-10'>
          
            <div className='card card-Tur' style={{ borderRadius:"1rem" }}>
              <div className='row g-0'>
                <div className="padding bg-secondary flex-column">
                  <div className="container">
                    
                    <h1 className="h1">Turnos Disponibles</h1>
                  </div>
                  <div className="container flex-column d-flex align-items-center ">

                    <Horarios />

                    <br />
                    {selectedPatient ? (
                      <div className="doctores">

                        <PatientInfo {...selectedPatient} />
                      </div>
                    ) : (
                      <p>No se ha seleccionado un paciente.</p>
                    )}

                    <div className="results"> <Patients /></div>

                    {selectedDoctor ? (
                      <div className="doctores">

                        <DoctorInfo {...selectedDoctor} />
                      </div>
                    ) : (
                      <p>No se ha seleccionado un médico.</p>
                    )}
                    <div className="results"> <Doctors /></div>



                    <div className="btn container-btn ">
                      <button className='btn btn-success btn-lg' type="reset" onClick={() => { handleGuardarTurno() }}>Guardar Turno</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default Turnos