import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useParams } from "react-router-dom";
import * as Yup from 'yup';
import TurnsInfo from "./TurnsInfo.jsx";
import Navbar from "./Navbar.jsx";


function TurnsPatients() {
    const { userId } = useParams();
    const [selectedPatient, selectPatient] = useState(null);
    const [selectedDoctor, selectDoctor] = useState(null);
    const [selectedTurn, selectTurn] = useState(null);
    const initialValues = {
        dni: '',

    };
    const validationSchema = Yup.object().shape({
        dni: Yup.string().required('El DNI es obligatorio'),

    });
    const [occupiedShifts, setOccupiedShifts] = useState([]);


    const handleDeleteTurn = (turnId) => {
        // Eliminar el turno del estado local
        setOccupiedShifts((prevShifts) => prevShifts.filter((shift) => shift.id !== turnId));
    };

    const handleUpdateTurnStatus = (turnId, newStatus) => {
        // Actualizar el estado local con el nuevo estado del turno
        setOccupiedShifts((prevShifts) =>
            prevShifts.map((shift) =>
                shift.id === turnId ? { ...shift, confirmado: newStatus } : shift
            )
        );
    };

    useEffect(() => {
        if (selectedPatient && selectedPatient.DNI) {
            fetch(`http://localhost:3003/api/shift/patient/${selectedPatient.DNI}`)
                .then((respuesta) => {
                    if (!respuesta.ok) {
                        throw new Error(`Error ${respuesta.status} - ${respuesta.statusText}`);
                    }
                    console.log(selectedPatient)
                    return respuesta.json();
                })
                .then((datos) => {
                    console.log(datos);
                    setOccupiedShifts(datos);
                })
                .catch((error) => {
                    console.error('Error al obtener los horarios ocupados del paciente:', error);
                });
        }
    }, [selectedPatient]);

    const handleSubmit = (values) => {
        // Realizar una solicitud GET al servidor para buscar al paciente por el DNI ingresado en values.dni
        fetch(`http://localhost:3003/api/patient/search?dni=${values.dni}`)

            .then((respuesta) => {
                if (!respuesta.ok) {
                    throw new Error(`Error ${respuesta.status} - ${respuesta.statusText}`);
                }

                return respuesta.json();
            })
            .then((datos) => {
                // Si el servidor responde con un mensaje de error, muestra el mensaje de error en lugar de intentar analizar datos no válidos
                if (datos.error) {
                    console.error('Error al buscar paciente:', datos.error);
                    // Puedes mostrar el mensaje de error en la interfaz del usuario
                } else {
                    selectPatient(datos.patient);
                    selectDoctor(datos.doctor); // Supongamos que también obtienes la información del doctor
                    selectTurn(datos.turn);
                    console.log(selectedDoctor);
                    console.log(selectedPatient);
                    console.log(selectedTurn);
                }

            })
            .catch((error) => {
                console.error('Error al buscar paciente:', error);
                // Maneja el error de la solicitud al backend
            });
    }


    return (

<div>
 
        <div className="d-flex align-content-center flex-wrap flex-column">
    

<label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Buscar Paciente</label>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                <Form>
                    <div className="d-flex align-items-center flex-column">
                        
                    <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Ingresar DNI</label>
                        <Field type="number" id="dni" name="dni" className="inpt" />
                        <ErrorMessage name="dni" component="div" />
                        <p>
                            <button type="submit" className="btn btn-success btn-lg">Buscar paciente</button>
                        </p>
                    </div>
                </Form>
            </Formik>
            </div>
            {selectedPatient ? (console.log(occupiedShifts),
                <div className="container">
                    <h4 className="text-center">Búsqueda exitosa!</h4>
                   <table className="table table-striped table-dark table-bordered">
      <caption>Listado de turnos del paciente</caption>
        <thead className="thead-dark"> 
          <tr>
            <th>Fecha</th>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Especialidad</th>
            <th>Observaciones</th>
            <th>Opciones</th>
          </tr>
        </thead>
        <tbody>
                    
                    {occupiedShifts.map((shift, index) => (
    <TurnsInfo
    key={index}
    id={shift.id}
      fecha={shift.fecha}
      patient={shift.paciente_id}
      doctor={shift.doctor_id}
      specialty={shift.especialidad}
      observaciones={shift.observaciones}
      onUpdateTurnStatus={handleUpdateTurnStatus}
      onDeleteTurn={handleDeleteTurn} 
    />
))}
</tbody>
</table>
                </div>
            ) : (
                <p className="justify-content">Seleccionar Paciente</p>
            )}
<div className="d-flex justify-content-center">

            <button className="btn btn-success btn-lg" onClick={() => { selectPatient(null); selectDoctor(null); selectTurn(null); }}>Limpiar selección</button>
            </div>
            <div>
    <Navbar userId={userId} />
    </div>
        </div>
    )
}

export default TurnsPatients;