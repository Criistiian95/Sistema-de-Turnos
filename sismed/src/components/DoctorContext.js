import React, { createContext, useState, useContext } from "react";

const DoctorContext = createContext();

export const useDoctorContext = () => {
  return useContext(DoctorContext);
};


export const DoctorProvider = ({ children }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const selectDoctor = (doctor) => {
    setSelectedDoctor(doctor);
  };

  return (
    <DoctorContext.Provider value={{ selectedDoctor, selectDoctor }}>
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContext;