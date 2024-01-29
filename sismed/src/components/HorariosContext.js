import React, { createContext, useContext, useState } from "react";

const HorariosContext = createContext();

export const HorariosProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const updateSelectedDate = (date) => {
    setSelectedDate(date);
  };

  return (
    <HorariosContext.Provider value={{ selectedDate, updateSelectedDate }}>
      {children}
    </HorariosContext.Provider>
  );
};

export const useHorariosContext = () => {
  return useContext(HorariosContext);
};