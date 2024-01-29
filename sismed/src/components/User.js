import React from 'react';

function User(props){
    return(
        <React.Fragment>
           
                       <span>{props.lastname} {props.name}</span> 
                        <br />
                       <span>Su rol es:  {props.role ? props.role.name : 'Rol no definido'}</span>
                       
                      
            
        </React.Fragment>
    )
}
export default User;