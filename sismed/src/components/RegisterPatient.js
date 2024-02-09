import React from "react";
import "../assets/Home.css"
import { useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar.jsx";

function RegisterPatient() {

    const { userId } = useParams();
    const navigate = useNavigate()
    const initialValues = {
        dni: '',
        name: '',
        lastname: '',
        phone: '',
        street: '',
        location: '',
    };

    const validationSchema = Yup.object().shape({
        dni: Yup.string().required('El dni del usuario es obligatorio'),
        name: Yup.string().required('El nombre del usuario es obligatorio'),
        lastname: Yup.string().required('El apellido del usuario es obligatorio'),
        phone: Yup.string().required('El numero de telefono es obligatorio'),
        street: Yup.string().required('Este campo es obligatorio'),
        location: Yup.string().required("La localidad es obligatoria"),
    });

    const handleSubmit = async (values, id) => {



        try {
            const isValid = await validationSchema.isValid(values);
            const requestBody = {
                ...values
            }

            if (!isValid) {
                console.error('Datos inválidos');
                return;
            }
            const response = await fetch(`http://localhost:3003/api/patient/createPatient`, {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            console.log(response)
            if (response.ok) {
                const data = await response.json()
                console.log("Registro exitoso", data.id)
                navigate("/turnos", { replace: true });
            } else {
                console.error('Error envio de 400');
                window.location.href = "/createPatient"
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    };


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
                                                        <div className="d-flex align-items-center mb-3 pb-1">
                                                            <div className='spinning'>
                                                                <div className='spinning-2'>
                                                                </div>
                                                            </div>
                                                            <span className="h1 fw-bold mb-0">Sistema de turnos medicos</span>
                                                        </div>
                                                        <h5 className="fw-normal mb-3 pb-3" style={{ letterSpacing: "1px" }}>Registra el nuevo paciente</h5>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>DNI</label>
                                                            <Field type="number" name="dni" className="form-control form-control-lg" />
                                                            <ErrorMessage name="dni" component="div" />
                                                        </div>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Nombre</label>
                                                            <Field type="text" name="name" className="form-control form-control-lg" />
                                                            <ErrorMessage name="name" component="div" />
                                                        </div>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Apellido</label>
                                                            <Field type="text" name="lastname" className="form-control form-control-lg" />
                                                            <ErrorMessage name="lastname" component="div" />
                                                        </div>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Telefono</label>
                                                            <Field type="number" name="phone" className="form-control form-control-lg" />
                                                            <ErrorMessage name="phone" component="div" />
                                                        </div>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Calle y numero</label>
                                                            <Field type="text" name="street" className="form-control form-control-lg" />
                                                            <ErrorMessage name="street" component="div" />
                                                        </div>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Localidad</label>
                                                            <Field type="text" name="location" className="form-control form-control-lg" />
                                                            <ErrorMessage name="location" component="div" />
                                                        </div>
                                                        <div className="pt-1 mb-4">
                                                            <button type="submit" className="btn btn-success btn-lg btn-block">Registrar paciente</button>
                                                        </div>
                                                    </Form>
                                                </Formik>
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
    );
}

export default RegisterPatient;