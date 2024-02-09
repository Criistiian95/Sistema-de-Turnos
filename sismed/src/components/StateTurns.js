import React, { useState, useEffect } from "react";
import TurnsInfo from "./TurnsInfo.jsx";
import isSameDay from "date-fns/isSameDay/index.js";




function Turns() {
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
    // Realizar una solicitud GET al servidor para obtener los horarios ocupados
    fetch("http://localhost:3003/api/shift/estado-turnos")
      .then((respuesta) => {
        if (!respuesta.ok) {
          throw new Error(`Error ${respuesta.status} - ${respuesta.statusText}`);
        }
        return respuesta.json();
      })
      .then((datos) => {
        const turnosHoy = datos.filter((shift) => {
          const fechaTurno = new Date(shift.fecha);
          const fechaActual = new Date();
  
          const esMismoDia = isSameDay(fechaTurno, fechaActual);

          return esMismoDia;;
        });
        setOccupiedShifts(turnosHoy);
      })
      .catch((error) => {
        console.error('Error al obtener los horarios ocupados:', error);
      });
  }, []);

  return (
    <div className="">
      <h2 className="fw-bold justify-content-center d-flex">TURNOS DEL DIA</h2>
      
      <table className="table table-striped table-dark table-bordered">
      <caption>Listado de Turnos</caption>
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
  );
}



export default Turns;