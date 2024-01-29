import React, { createContext, useContext, useState } from 'react';

const FechasOcupadasContext = createContext();

export const FechasOcupadasProvider = ({ children }) => {
  const [fechasOcupadas, setFechasOcupadas] = useState([]);

  const agregarFechaOcupada = (fecha, hora) => {
    setFechasOcupadas([...fechasOcupadas, { fecha, hora }]);
  };

  return (
    <FechasOcupadasContext.Provider value={{ fechasOcupadas, agregarFechaOcupada }}>
      {children}
    </FechasOcupadasContext.Provider>

  )
  }
  
export const useFechasOcupadasContext = () => {
  return useContext(FechasOcupadasContext);
};