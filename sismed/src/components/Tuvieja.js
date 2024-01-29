import React from "react";
import { useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { usePatientContext } from "./PatientContext";
import { useDoctorContext } from "./DoctorContext";
import Navbar from "./Navbar";

function Patients() {
    const { userId } = useParams();

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


        <header className="header">
            <section style={{ backgroundColor: "#AAF3E0" }}>
                <div className="container py-5 h-100">
                    <Navbar userId={userId} />
                    <div className='row d-flex justify-content-center align-items-center h-100'>
                        <div className='col col-xl-10'>
                            <div className='card' style={{ borderRadius: "1rem" }}>
                                <div className='d-flex justify-content-center'>
                                    <div class="col-md-6 col-lg-5 d-none d-md-block">
                                        <div className="col-md-6 col-lg-7 d-flex align-items-center">
                                            <div className='card-body p-4 p-lg-5 text-black'>
                                                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                                                    <Form>
                                                        <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: "1px" }}>Busque el paciente</h5>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Ingresar DNI</label>
                                                            <Field type="number" id="dni" name="dni" className="inpt" />
                                                            <ErrorMessage name="dni" component="div" />
                                                        </div>
                                                        <div className="pt-1 mb-4">
                                                            <button type="submit" className="btn btn-success btn-lg">Buscar paciente</button>
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </header>
    )
}

export default Patients;