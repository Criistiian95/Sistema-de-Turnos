import React, { useState, useEffect } from "react";
import DatePicker, { registerLocale } from "react-datepicker"
import es from "date-fns/locale/es";
import "react-datepicker/dist/react-datepicker.css"
import { useHorariosContext } from "./HorariosContext.js";

registerLocale("es", es)

// Función para generar horarios dinámicamente
const generarHorarios = async () => {

  const horarios = [];
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // Puedes ajustar el rango según tus necesidades

  while (startDate < endDate) {
    horarios.push({ dateTime: new Date(startDate) });
    startDate.setHours(startDate.getHours() + 1); // Añade un horario cada hora, puedes ajustar esto según tus necesidades
  }


  return horarios;


};

function Horarios() {
  const { updateSelectedDate } = useHorariosContext();
  const [horariosDisponibles, setHorariosDisponibles] = useState(generarHorarios());
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  const [startDate, setStartDate] = useState(new Date());

  useEffect(() => {
    updateSelectedDate(startDate);
  }, [startDate, updateSelectedDate]);

  const filterPassedDate = (date) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    return date >= currentDate && date <= endDate && date.getDay() !== 0;

  };

  const filterPassedTime = (time) => {
    const hours = time.getHours();
    const minutes = time.getMinutes();

    const minTime = new Date(startDate);
    minTime.setHours(9, 0, 0, 0);

    const maxTime = new Date(startDate);
    maxTime.setHours(20, 0, 0, 0);

    return time >= minTime && time <= maxTime;
  };

  const handleDateChange = (date) => {
    setStartDate(date);
    updateSelectedDate(date);
  };

  return (

    <DatePicker
      selected={startDate}
      onChange={handleDateChange}
      showTimeSelect
      filterDate={filterPassedDate}
      filterTime={filterPassedTime}
      dateFormat=" dd MMM, yyyy h:mm aa"
      locale="es"
      calendarClassName="Calendar-date"
      className="Input-date"
    />

  );
}

export default Horarios;