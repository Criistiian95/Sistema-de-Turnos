import React from "react";
import "../assets/Home.css"
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { useNavigate, Link } from 'react-router-dom';

function RegisterUser() {
    const navigate = useNavigate()
    const initialValues = {
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        roles: '',
    };

    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('El nombre del usuario es obligatorio'),
        apellido: Yup.string().required('El apellido del usuario es obligatorio'),
        email: Yup.string().email('El correo electrónico no es válido').required('El correo electrónico es obligatorio'),
        password: Yup.string().min(8, 'La contraseña debe tener al menos 8 caracteres').required('La contraseña es obligatoria'),
        roles: Yup.string().required("Debe elegir un rol"),
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
            const response = await fetch(`http://localhost:3003/api/user/Registro-usuario`, {
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
                console.log("Inicio exitoso", data.id)
                navigate("/login", { replace: true });
            } else {
                console.error('Error envio de 400');
                window.location.href = "/api/Registro-usuario"
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    };


    return (
        <header className="header">
            <section style={{ backgroundColor: "#AAF3E0" }}>
                <div className="container py-5 h-100">
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
                                                        <h3 className="fw-normal mb-3 pb-3" style={{ letterSpacing: "1px" }}>Registra el nuevo usuario</h3>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Nombre</label>
                                                            <Field type="text" name="nombre" />
                                                            <ErrorMessage name="nombre" component="div" />
                                                        </div>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Apellido</label>
                                                            <Field type="text" name="apellido" />
                                                            <ErrorMessage name="apellido" component="div" />
                                                        </div>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Email</label>
                                                            <Field type="email" name="email" />
                                                            <ErrorMessage name="email" component="div" />
                                                        </div>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Contraseña</label>
                                                            <Field type="password" name="password" />
                                                            <ErrorMessage name="password" component="div" />
                                                        </div>
                                                        <div className='form-outline mb-4'>
                                                            <label className="form-label" for="form2Example17" style={{ fontSize: "30px" }}>Elija su rol</label>
                                                            <div>

                                                                <Field as="select" name="roles">
                                                                    <option value="" label="Selecciona un rol" />
                                                                    <option value="1" label="Administrador" />
                                                                    <option value="2" label="Moderador" />
                                                                    <option value="3" label="Usuario" />
                                                                </Field>
                                                                <ErrorMessage name="roles" component="div" />
                                                            </div>
                                                        </div>
                                                        <div className="pt-1 mb-4">
                                                            <button type="submit" className="btn btn-success btn-lg btn-block">Registrar Usuario</button>
                                                        </div>
                                                    </Form>

                                                </Formik>
                                                <div>
                                                    <button className='btn btn-success btn-lg btn-block ' >
                                                        <a className='link-underline-opacity-0 fw-bolder text-light text-decoration-none'
                                                            href="/login">Loguearse</a></button>
                                                </div>
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

export default RegisterUser;