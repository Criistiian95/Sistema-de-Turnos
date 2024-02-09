import React from "react";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { usePatientContext } from "./PatientContext.js";
import { useDoctorContext } from "./DoctorContext.js";


function Patients() {

    const initialValues = {
        dni: '',

    };


    const validationSchema = Yup.object().shape({
        dni: Yup.string().required('El DNI es obligatorio'),

    });

    const { selectedPatient, selectPatient } = usePatientContext();
    const { selectedDoctor } = useDoctorContext();


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
                    console.log(selectedPatient);
                    console.log(selectedDoctor)
                }

            })
            .catch((error) => {
                console.error('Error al buscar paciente:', error);
                // Maneja el error de la solicitud al backend
            });
    }


    return (


        <div className="container">

            <label className="justify-content">Buscar Paciente</label>
            <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                <Form>
                    <div className="d-flex align-items-center flex-column">
                        <label className="nombre justify-content">Ingresar DNI</label>
                        <Field type="number" id="dni" name="dni" className="inpt" />
                        <ErrorMessage name="dni" component="div" />
                        <p>
                            <button type="submit" className="btn btn-success btn-lg">Buscar paciente</button>
                        </p>
                    </div>
                </Form>
            </Formik>
            {selectedPatient ? (
                <div >
                    <h5 className="h5 rounded-pill bg-light text-dark">Busqueda exitosa!
                    </h5>

                </div>
            ) : (
                <p className="justify-content" >Seleccionar Paciente</p>
            )}

            <button className="btn btn-success btn-lg" onClick={() => selectPatient(null)}>Limpiar selección</button>

        </div>

    )
}


export default Patients;