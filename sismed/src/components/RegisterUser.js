import React from "react";
import "../assets/Home.css"
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { useNavigate, Link } from 'react-router-dom';

function RegisterUser() {
    const navigate= useNavigate()
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

    const handleSubmit = async (values,id) => {
       
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
                credentials:"include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
            console.log(response)
            if (response.ok) {
                const data= await response.json()
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
            <div className="conainer"></div>
            <div className="container">
            
            <div className='form'>
                <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
                        <Form>
                            <h1 className="h1 justify-content">Registra el nuevo usuario</h1>
                            <label className="nombre justify-content">Nombre</label>
                            <Field type="text" name="nombre" />
                            <ErrorMessage name="nombre" component="div" />
                            <label className="justify-content">Apellido</label>
                            <Field type="text" name="apellido" />
                            <ErrorMessage name="apellido" component="div" />
                            <label className="justify-content">Email</label>
                            <Field type="email" name="email" />
                            <ErrorMessage name="email" component="div" />
                            <label className="justify-content">Contraseña</label>
                            <Field type="password" name="password" />
                            <ErrorMessage name="password" component="div" />
                            <label className="justify-content">Elija su rol</label>
                            <div>
                                
                                <Field as="select" name="roles">
                                    <option value="" label="Selecciona un rol" />
                                    <option value="1" label="Administrador" />
                                    <option value="2" label="Moderador" />
                                    <option value="3" label="Usuario" />
                                </Field>
                                <ErrorMessage name="roles" component="div" />
                            </div>
                        <p>
                            <button type="submit" className="input btn">Registrarse</button>
                            </p>
                        </Form>
                    
                </Formik>
                <div>
                <nav className='navbar'>
                      <Link to="/register" className="lista">
                        Registar usuario
                      </Link>
                      <Link to="/login" className="lista">
                        Login
                      </Link>
                    </nav>
                    </div>
                
                </div>
            </div>
        </header>
    );
}

export default RegisterUser;