import React, { createContext, useState, useContext } from "react";

const PatientContext = createContext();

export const usePatientContext = () => {
  return useContext(PatientContext);
};

export const PatientProvider = ({ children }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
  };

  
  return (
    <PatientContext.Provider value={{ selectedPatient, selectPatient }}>
      {children}
    </PatientContext.Provider>
  );
};

export default PatientContext;