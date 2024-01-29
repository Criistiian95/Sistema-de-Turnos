import React from 'react';
import "../assets/Patient.css"

function PatientInfo(props) {


    return (
        <React.Fragment>
            <div className="description-doc">
                <div className='list-patients'>
                    
                    <div className='definition-patient border-top border-start' >
                        <span className='list'>Paciente:</span>
                    
                        <span className='list'>{props.DNI}</span>
                    
                        <span className='list'>{props.name} {props.lastname}</span>
                    </div>
                </div>
            </div>


        </React.Fragment>
    )
}
export default PatientInfo;