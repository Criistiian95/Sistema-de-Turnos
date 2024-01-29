import React from 'react';
import "../assets/Patient.css"

function DoctorInfo(props){

    
    return(
        <React.Fragment>
            <div className="description-doc">
                <div className='list-patients'>
                
                <div className='definition-patient border-top border-start' >
                    
                    <span className='list'>Medico:</span>
                
                    <span className='list'>{props.name} {props.lastname}</span>
                   
                    <span className='list'>{props.specialty ? props.specialty.name : 'Especialidad no definida'}</span>
                </div>
                </div>   
            </div>
        </React.Fragment>
    )
}
export default DoctorInfo;