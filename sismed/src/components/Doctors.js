import React from "react";

import { Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';

import { useDoctorContext } from "./DoctorContext.js";
import { usePatientContext } from "./PatientContext.js";




function Doctors() {

const initialValues = {
    tuition: '',
    
};

const validationSchema = Yup.object().shape({
    tuition: Yup.string().required('La matricula es obligatoria'),
    
});
const { selectedDoctor, selectDoctor } = useDoctorContext();
const { selectedPatient } = usePatientContext();


const handleSubmit=(values)=>{
    // Realizar una solicitud GET al servidor para buscar al paciente por el DNI ingresado en values.dni
    fetch(`http://localhost:3003/api/doctor/search?tuition=${values.tuition}`)
  
    .then((respuesta) => {
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status} - ${respuesta.statusText}`);
        }
        return respuesta.json();
     })
     .then((datos) => {
        if (datos.error) {
            console.error('Error al buscar médico:', datos.error);
            // Puedes mostrar el mensaje de error en la interfaz del usuario
        } else {
            selectDoctor(datos.doctor);
        }
        console.log(selectedDoctor)
        console.log(selectedPatient)
    })
        .catch((error) => {
            console.error('Error al buscar medico:', error);
            // Maneja el error de la solicitud al backend
        });
      
    }
    return(
        
            <div className="d-flex align-items-center flex-column ">
            
        <label>Buscar Medico</label>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        <Form>
            <div className="d-flex align-items-center flex-column">
                <label className="nombre justify-content">Ingresar matricula</label>
                <Field type="number" id="tuition" name="tuition" className="inpt" />
                <ErrorMessage name="tuition" component="div" />
                <p>
                    <button type="submit" className="btn btn-success btn-lg">Buscar medico</button>
                </p>
            </div>
        </Form>
    </Formik>
    {selectedDoctor ? (
            <div >
                <h5 className="h5 rounded-pill bg-light text-dark">Busqueda exitosa!
                </h5>

            </div>
        ) : (
            <p>Seleccione un medico</p>
        )}
    
    
    <button className="btn btn-success btn-lg" onClick={() => selectDoctor(null)}>Limpiar selección</button>
    
    </div>


    )}
    
    
    export default Doctors;